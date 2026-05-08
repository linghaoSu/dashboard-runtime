import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import { resolveRefs } from "./ref-resolver.js";
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

  const configuredGlobalFilters = resolveRefs(
    config.globalFilters ?? {},
    baseScope
  );
  const globalFilters = {
    ...configuredGlobalFilters,
    ...options.globalFilterOverrides
  };

  const context = resolveRefs(config.context ?? {}, {
    runtime: runtimeScope,
    context: {},
    globalFilters
  });

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
