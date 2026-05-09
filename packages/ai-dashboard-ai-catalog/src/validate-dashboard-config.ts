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
    | "invalid_static_params";
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

  if (options.requireI18nKeys ?? true) {
    validateI18nText(config.meta?.name, ["meta", "name"], issues);
    validateI18nText(config.meta?.description, ["meta", "description"], issues);
  }

  config.widgets.forEach((widget, index) => {
    const widgetPath = ["widgets", index];
    validateWidget(widget, widgetPath, config, options, minRefreshIntervalMs, issues);
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
