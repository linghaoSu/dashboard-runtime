import {
  dashboardConfigSchema,
  type DashboardConfig,
  type I18nText,
  type WidgetConfig
} from "@dao-style-viz/ai-dashboard-schema";
import type {
  DataSourceRegistry,
  WidgetRegistry
} from "@dao-style-viz/ai-dashboard-runtime";
import { isConfigRef } from "@dao-style-viz/ai-dashboard-runtime";

export type DashboardConfigValidationIssue = {
  code:
    | "invalid_schema"
    | "unknown_widget"
    | "unknown_data_source"
    | "incompatible_data_source"
    | "layout_overflow"
    | "refresh_interval_too_low"
    | "missing_i18n_key"
    | "invalid_widget_props"
    | "invalid_static_params"
    | "invalid_event_payload"
    | "unknown_event_target"
    | "invalid_ref"
    | "ref_cycle";
  path: Array<string | number>;
  message: string;
};

export type DashboardConfigValidationResult =
  | {
      success: true;
      config: DashboardConfig;
      issues: [];
    }
  | {
      success: false;
      config?: DashboardConfig;
      issues: DashboardConfigValidationIssue[];
    };

export type ValidateDashboardConfigOptions = {
  dataSources: DataSourceRegistry;
  widgets: WidgetRegistry;
  minRefreshIntervalMs?: number;
  requireI18nKeys?: boolean;
};

export function validateDashboardConfig(
  input: unknown,
  options: ValidateDashboardConfigOptions
): DashboardConfigValidationResult {
  const parsed = dashboardConfigSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "invalid_schema",
        path: issue.path,
        message: issue.message
      }))
    };
  }

  const issues: DashboardConfigValidationIssue[] = [];
  const config = parsed.data;
  const minRefreshIntervalMs = options.minRefreshIntervalMs ?? 5000;
  const widgetIds = new Set(config.widgets.map((widget) => widget.id));

  validateConfigRefGraph(config, issues);

  if (options.requireI18nKeys ?? true) {
    validateI18nText(config.meta?.name, ["meta", "name"], issues);
    validateI18nText(config.meta?.description, ["meta", "description"], issues);
  }

  config.widgets.forEach((widget, index) => {
    const widgetPath = ["widgets", index];
    validateWidget(
      widget,
      widgetPath,
      config,
      options,
      minRefreshIntervalMs,
      widgetIds,
      issues
    );
  });

  return issues.length
    ? {
        success: false,
        config,
        issues
      }
    : {
        success: true,
        config,
        issues: []
      };
}

function validateWidget(
  widget: WidgetConfig,
  path: Array<string | number>,
  config: DashboardConfig,
  options: ValidateDashboardConfigOptions,
  minRefreshIntervalMs: number,
  widgetIds: ReadonlySet<string>,
  issues: DashboardConfigValidationIssue[]
) {
  const widgetDefinition = options.widgets[widget.type];

  if (!widgetDefinition) {
    issues.push({
      code: "unknown_widget",
      path: [...path, "type"],
      message: `Unknown widget type: ${widget.type}`
    });
  } else {
    const props = widgetDefinition.propsSchema.safeParse(widget.props ?? {});
    if (!props.success) {
      issues.push({
        code: "invalid_widget_props",
        path: [...path, "props"],
        message: props.error.message
      });
    }
  }

  if (options.requireI18nKeys ?? true) {
    validateI18nText(widget.title, [...path, "title"], issues);
    validateI18nText(widget.description, [...path, "description"], issues);
    validateI18nText(
      widget.data?.fallback?.emptyText,
      [...path, "data", "fallback", "emptyText"],
      issues
    );
    validateI18nText(
      widget.data?.fallback?.errorText,
      [...path, "data", "fallback", "errorText"],
      issues
    );
  }

  widget.events?.forEach((eventConfig, eventIndex) => {
    validateWidgetEvent(
      eventConfig,
      [...path, "events", eventIndex],
      widgetIds,
      issues
    );
  });

  if (widget.layout.x + widget.layout.w > config.canvas.width) {
    issues.push({
      code: "layout_overflow",
      path: [...path, "layout"],
      message: `Widget ${widget.id} overflows canvas width`
    });
  }

  if (widget.layout.y + widget.layout.h > config.canvas.height) {
    issues.push({
      code: "layout_overflow",
      path: [...path, "layout"],
      message: `Widget ${widget.id} overflows canvas height`
    });
  }

  if (!widget.data) {
    return;
  }

  const dataSource = options.dataSources[widget.data.source];
  if (!dataSource) {
    issues.push({
      code: "unknown_data_source",
      path: [...path, "data", "source"],
      message: `Unknown dataSource: ${widget.data.source}`
    });
  } else {
    if (
      widgetDefinition &&
      dataSource.compatibleWidgets &&
      !dataSource.compatibleWidgets.includes(widgetDefinition.type)
    ) {
      issues.push({
        code: "incompatible_data_source",
        path: [...path, "data", "source"],
        message: `DataSource ${widget.data.source} is not compatible with widget ${widget.type}`
      });
    }

    if (!containsConfigRef(widget.data.params)) {
      const params = dataSource.paramsSchema.safeParse(widget.data.params ?? {});
      if (!params.success) {
        issues.push({
          code: "invalid_static_params",
          path: [...path, "data", "params"],
          message: params.error.message
        });
      }
    }
  }

  const refresh = widget.data.refresh;
  if (
    refresh?.type === "interval" &&
    refresh.intervalMs < minRefreshIntervalMs
  ) {
    issues.push({
      code: "refresh_interval_too_low",
      path: [...path, "data", "refresh", "intervalMs"],
      message: `refresh.intervalMs must be at least ${minRefreshIntervalMs}`
    });
  }

  validateWidgetParamRefs(
    widget.data.params,
    [...path, "data", "params"],
    config,
    issues
  );
}

function validateWidgetEvent(
  eventConfig: NonNullable<WidgetConfig["events"]>[number],
  path: Array<string | number>,
  widgetIds: ReadonlySet<string>,
  issues: DashboardConfigValidationIssue[]
) {
  if (eventConfig.action === "setFilter") {
    validateSetFilterEventPayload(eventConfig.payload, path, issues);
  }

  if (
    eventConfig.action === "refreshWidget" &&
    eventConfig.target &&
    !widgetIds.has(eventConfig.target)
  ) {
    issues.push({
      code: "unknown_event_target",
      path: [...path, "target"],
      message: `Unknown refreshWidget target: ${eventConfig.target}`
    });
  }
}

function validateSetFilterEventPayload(
  payload: Record<string, unknown> | undefined,
  path: Array<string | number>,
  issues: DashboardConfigValidationIssue[]
) {
  if (!payload || !hasOwn(payload, "key") || !hasOwn(payload, "value")) {
    issues.push({
      code: "invalid_event_payload",
      path: [...path, "payload"],
      message: "setFilter events require payload.key and payload.value"
    });
    return;
  }

  if (typeof payload.key !== "string" && !isConfigRef(payload.key)) {
    issues.push({
      code: "invalid_event_payload",
      path: [...path, "payload", "key"],
      message: "setFilter payload.key must be a string or config ref"
    });
  }
}

function validateConfigRefGraph(
  config: DashboardConfig,
  issues: DashboardConfigValidationIssue[]
) {
  validateGlobalFilterRefs(config.globalFilters ?? {}, issues);
  validateContextRefs(config.context ?? {}, issues);
}

function validateGlobalFilterRefs(
  globalFilters: Record<string, unknown>,
  issues: DashboardConfigValidationIssue[]
) {
  collectConfigRefs(globalFilters).forEach((ref) => {
    const root = getRefSegments(ref)[0];

    if (root === "context" || root === "globalFilters") {
      issues.push({
        code: "invalid_ref",
        path: ["globalFilters"],
        message: `globalFilters cannot reference ${root} because globalFilters resolve before context`
      });
    }
  });
}

function validateContextRefs(
  context: Record<string, unknown>,
  issues: DashboardConfigValidationIssue[]
) {
  const keys = new Set(Object.keys(context));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string, stack: string[]) => {
    if (visited.has(key)) {
      return;
    }

    if (visiting.has(key)) {
      const cycleStart = stack.indexOf(key);
      const cycle = [...stack.slice(cycleStart), key].map(
        (segment) => `context.${segment}`
      );
      issues.push({
        code: "ref_cycle",
        path: ["context", key],
        message: `Ref cycle detected: ${cycle.join(" -> ")}`
      });
      return;
    }

    visiting.add(key);
    const nextStack = [...stack, key];

    collectContextDependencies(context[key]).forEach((dependency) => {
      if (!keys.has(dependency)) {
        issues.push({
          code: "invalid_ref",
          path: ["context", key],
          message: `Ref not found: context.${dependency}`
        });
        return;
      }

      visit(dependency, nextStack);
    });

    visiting.delete(key);
    visited.add(key);
  };

  Object.keys(context).forEach((key) => visit(key, []));
}

function collectContextDependencies(value: unknown): string[] {
  return collectConfigRefs(value).flatMap((ref) => {
    const [root, key] = getRefSegments(ref);
    return root === "context" && key ? [key] : [];
  });
}

function validateWidgetParamRefs(
  params: unknown,
  path: Array<string | number>,
  config: DashboardConfig,
  issues: DashboardConfigValidationIssue[]
) {
  const contextKeys = new Set(Object.keys(config.context ?? {}));
  const globalFilterKeys = new Set(Object.keys(config.globalFilters ?? {}));

  collectConfigRefs(params).forEach((ref) => {
    const [root, key] = getRefSegments(ref);

    if (root === "context") {
      validateKnownRefKey(ref, key, contextKeys, path, issues);
    }

    if (root === "globalFilters") {
      validateKnownRefKey(ref, key, globalFilterKeys, path, issues);
    }
  });
}

function validateKnownRefKey(
  ref: string,
  key: string | undefined,
  knownKeys: ReadonlySet<string>,
  path: Array<string | number>,
  issues: DashboardConfigValidationIssue[]
) {
  if (!key || !knownKeys.has(key)) {
    issues.push({
      code: "invalid_ref",
      path,
      message: `Ref not found: ${ref}`
    });
  }
}

function validateI18nText(
  text: I18nText | undefined,
  path: Array<string | number>,
  issues: DashboardConfigValidationIssue[]
) {
  if (text === undefined) {
    return;
  }

  if (typeof text === "string") {
    issues.push({
      code: "missing_i18n_key",
      path,
      message: "User-facing text must use an i18n key object"
    });
    return;
  }

  if (!text.key) {
    issues.push({
      code: "missing_i18n_key",
      path: [...path, "key"],
      message: "I18n text requires key"
    });
  }
}

function containsConfigRef(value: unknown): boolean {
  if (isConfigRef(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsConfigRef(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((item) => containsConfigRef(item));
  }

  return false;
}

function collectConfigRefs(value: unknown): string[] {
  if (isConfigRef(value)) {
    return [value.$ref];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectConfigRefs(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap((item) => collectConfigRefs(item));
  }

  return [];
}

function getRefSegments(ref: string): string[] {
  return ref.split(".").filter(Boolean);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}
