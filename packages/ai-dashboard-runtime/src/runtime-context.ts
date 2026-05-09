import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import {
  DashboardRuntimeError,
  RefCycleError,
  RefResolutionError
} from "./errors.js";
import {
  getRefSegments,
  getRefValue,
  isConfigRef,
  resolveRefs
} from "./ref-resolver.js";
import type { RefScope, RuntimeContext, RuntimeInput } from "./renderer-adapter.js";

export type CreateRuntimeContextOptions = {
  globalFilterOverrides?: Record<string, unknown>;
};

export function createRuntimeContext(
  config: DashboardConfig,
  runtime: RuntimeInput,
  options: CreateRuntimeContextOptions = {}
): RuntimeContext {
  const runtimeScope = pickRuntimeScope(runtime);
  const baseScope: RefScope = {
    runtime: runtimeScope,
    context: {},
    globalFilters: {}
  };
  const globalFiltersInput = config.globalFilters ?? {};

  assertGlobalFiltersDoNotDependOnConfig(globalFiltersInput);

  const configuredGlobalFilters = resolveRefs(
    globalFiltersInput,
    baseScope
  );
  const globalFilters = {
    ...configuredGlobalFilters,
    ...options.globalFilterOverrides
  };

  const context = resolveContextRecord(
    config.context ?? {},
    runtimeScope,
    globalFilters
  );

  return {
    ...runtime,
    context,
    globalFilters
  };
}

export function createRefScope(runtime: RuntimeContext): RefScope {
  return {
    runtime: pickRuntimeScope(runtime),
    context: runtime.context,
    globalFilters: runtime.globalFilters
  };
}

function pickRuntimeScope(runtime: RuntimeInput) {
  return {
    locale: runtime.locale,
    timezone: runtime.timezone,
    route: runtime.route,
    user: runtime.user
  };
}

type RuntimeScope = ReturnType<typeof pickRuntimeScope>;

function assertGlobalFiltersDoNotDependOnConfig(
  value: Record<string, unknown>
) {
  walkConfigRefs(value, (ref) => {
    const root = getRefSegments(ref)[0];

    if (root === "context" || root === "globalFilters") {
      throw new DashboardRuntimeError(
        `globalFilters cannot reference ${root} because globalFilters resolve before context`,
        { ref }
      );
    }
  });
}

function resolveContextRecord(
  input: Record<string, unknown>,
  runtime: RuntimeScope,
  globalFilters: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  const resolving: string[] = [];

  const resolveKey = (key: string): unknown => {
    if (Object.prototype.hasOwnProperty.call(resolved, key)) {
      return resolved[key];
    }

    if (!Object.prototype.hasOwnProperty.call(input, key)) {
      throw new RefResolutionError(`context.${key}`);
    }

    const cycleStart = resolving.indexOf(key);
    if (cycleStart >= 0) {
      const path = [...resolving.slice(cycleStart), key].map(
        (segment) => `context.${segment}`
      );
      throw new RefCycleError(path);
    }

    resolving.push(key);
    try {
      const value = resolveContextValue(input[key], {
        runtime,
        globalFilters,
        resolvedContext: resolved,
        resolveContextKey: resolveKey
      });
      resolved[key] = value;
      return value;
    } finally {
      resolving.pop();
    }
  };

  Object.keys(input).forEach((key) => {
    resolveKey(key);
  });

  return resolved;
}

type ResolveContextValueOptions = {
  runtime: RuntimeScope;
  globalFilters: Record<string, unknown>;
  resolvedContext: Record<string, unknown>;
  resolveContextKey: (key: string) => unknown;
};

function resolveContextValue(
  value: unknown,
  options: ResolveContextValueOptions
): unknown {
  if (isConfigRef(value)) {
    const [root, topLevelKey, ...rest] = getRefSegments(value.$ref);

    if (root === "context") {
      if (!topLevelKey) {
        throw new DashboardRuntimeError("context refs must include a key", {
          ref: value.$ref
        });
      }

      const topLevelValue = options.resolveContextKey(topLevelKey);
      return rest.length
        ? getNestedRefValue(value.$ref, topLevelValue, rest)
        : topLevelValue;
    }

    return getRefValue(value.$ref, {
      runtime: options.runtime,
      context: options.resolvedContext,
      globalFilters: options.globalFilters
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveContextValue(item, options));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveContextValue(item, options)
      ])
    );
  }

  return value;
}

function getNestedRefValue(
  ref: string,
  value: unknown,
  segments: string[]
): unknown {
  let current = value;

  for (const segment of segments) {
    if (!isRecord(current) || !(segment in current)) {
      throw new RefResolutionError(ref);
    }

    current = current[segment];
  }

  return current;
}

function walkConfigRefs(value: unknown, visit: (ref: string) => void) {
  if (isConfigRef(value)) {
    visit(value.$ref);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => walkConfigRefs(item, visit));
    return;
  }

  if (isPlainObject(value)) {
    Object.values(value).forEach((item) => walkConfigRefs(item, visit));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && !Array.isArray(value);
}
