# Architecture — AI Dashboard Builder

**Slug:** ai-dashboard-builder
**Date:** 2026-05-08
**Status:** draft
**References:** requirements.md, ../../doc.md

## Summary

Build a greenfield TypeScript workspace around a small framework-neutral core first, with Vue 3.3.x as the default UI renderer. The first slice covers schema, registry contracts, `$ref` resolution, runtime data flow, i18n, a Vue renderer adapter, mocked dataSource integration, and a few widgets. The recommended approach is Option B: a core tracer bullet in a monorepo, with package boundaries created where they protect contracts from day one. This proves the end-to-end runtime and AI catalog boundary while leaving room for a future React or other renderer adapter.

## Goals / Non-Goals

Goals:

- A validated DashboardConfig drives a dashboard runtime without executable config.
- Business products can register existing proto generated TS SDK calls through dataSource wrappers.
- Widgets are registered by metadata and schema, then rendered by type.
- AI sees catalogs and prompt contracts, not query implementations, SDK source, auth logic, tokens, or user-sensitive data.
- i18n, formatter utilities, request cancellation, refresh behavior, and widget-level failure isolation exist in the first working slice.
- Generated chart components have a separate safety gate before they can join the registry.

Non-goals:

- No unified backend data warehouse or forced backend API redesign.
- No arbitrary AI-generated Vue app pages or business page logic.
- No `$expr`, eval, user-supplied formatter functions, dynamic imports, or executable JavaScript in dashboard config.
- No full BI semantic layer, dashboard editor, release management, version history, or component marketplace in MVP.
- No `openUrl` / `navigate` event actions in the first implementation stage.

## Codebase Context

This repository is currently document-only:

- `doc.md` — original design document.
- `.idea-to-ship/ai-dashboard-builder/requirements.md` — normalized requirements artifact.
- `/Users/sulinghao/workspaces/dce5/amamba-ui/src/plugins/vue-i18n` — reference host-app locale integration supplied during implementation. It uses Vue I18n composition mode, dynamic locale loading, locale fallback resolution, and external package locale merging.

There is no existing package manager, build system, source tree, test runner, lint setup, frontend app, or monorepo convention to preserve. The architecture therefore treats the implementation as greenfield and records the following assumptions:

- Use `pnpm` workspaces for package management because the scope is a multi-package TypeScript workspace and the existing environment already has `pnpm` available in prior workflows.
- Use TypeScript, Vue 3.3.x, Vite, Vitest, Vue Test Utils, ESLint, Zod, ECharts, and `vue-echarts`.
- Publishable package names use the `@dao-style-viz/*` npm scope.
- A local demo app is required to verify runtime behavior, but it is not a product dashboard editor.
- Proto generated SDK integration is represented by mock static service methods in the demo/tests until a real product repo integrates the packages.
- Keep schema, dataSource, ref resolution, catalog, and validation contracts free of Vue imports so another renderer can be added without rewriting those contracts.
- The Vue renderer should integrate with a host-provided `vue-i18n` composer or `t` function instead of owning global locale installation; standalone demo messages are only a fallback for local verification.

## Alternatives Considered

### Option A — Full Package MVP Up Front

Create all proposed packages immediately:

- `@dao-style-viz/ai-dashboard-schema`
- `@dao-style-viz/ai-dashboard-runtime`
- `@dao-style-viz/ai-dashboard-vue`
- `@dao-style-viz/ai-dashboard-widgets`
- `@dao-style-viz/ai-dashboard-echarts-vue`
- `@dao-style-viz/ai-dashboard-ai-catalog`
- `@dao-style-viz/ai-dashboard-generator`
- `@dao-style-viz/ai-dashboard-sandbox`
- demo app

**Module changes:** Create the full package tree from `doc.md` section 16.

**Data flow:** User or AI produces DashboardConfig -> runtime core validates config -> runtime core resolves refs -> data loader calls dataSource registry -> Vue renderer looks up widget registry -> Vue widget renders ECharts/basic UI -> AI catalog exports metadata for generator/sandbox.

**Interfaces:**

```ts
export type DashboardConfig = { version: string; canvas: CanvasConfig; widgets: WidgetConfig[]; /* ... */ };
export type DataSourceDefinition<TParams, TOutput> = { paramsSchema: z.ZodSchema<TParams>; outputSchema: z.ZodSchema<TOutput>; query(ctx: DataSourceQueryContext<TParams>): Promise<TOutput>; /* ... */ };
export type WidgetDefinition<TData, TProps, TComponent = unknown> = { type: string; framework: string; component: TComponent; dataSchema: z.ZodSchema<TData>; propsSchema: z.ZodSchema<TProps>; /* ... */ };
```

**Pros:**

- Mirrors the target package taxonomy from the source document.
- Makes future package ownership and publishing boundaries visible early.
- Enables separate workstreams once contracts stabilize.

**Cons:**

- High blast radius before the runtime contract has proven itself.
- Encourages horizontal slicing: many packages exist before one dashboard works end-to-end.
- Generator and sandbox interfaces will likely churn after the runtime, registry, and catalog contracts meet real examples.

**Risk:** Medium-high. The first implementation could spend most effort on scaffolding and dependency wiring while still failing to prove the core product behavior.

### Option B — Core Tracer Bullet Monorepo

Create a monorepo with the contract-bearing packages first:

- `@dao-style-viz/ai-dashboard-schema`
- `@dao-style-viz/ai-dashboard-runtime`
- `@dao-style-viz/ai-dashboard-vue`
- `@dao-style-viz/ai-dashboard-ai-catalog`
- `@dao-style-viz/ai-dashboard-echarts-vue`
- `apps/demo`

Keep the first basic widgets inside the Vue package or demo until they prove enough shared behavior to justify `ai-dashboard-widgets`. Represent generator output with pure prompt templates and validation functions before adding a model-backed generator package. Defer generated chart sandbox to a later stage after registry/catalog contracts are stable.

**Module changes:** Create package scaffolding for schema/runtime/vue/catalog/echarts-vue and a demo app. Add shared widgets, alternate renderer adapters, and sandbox packages in later stages once the contracts stop moving.

**Data flow:**

```text
demo DashboardConfig
  -> schema validation
  -> BigScreenRuntime
  -> resolveRefs(runtime context)
  -> loadWidgetData(dataSources)
  -> validate output
  -> Vue WidgetRenderer(widgetRegistry)
  -> Vue ECharts widget/basic widget
  -> AI catalog export hides query/component implementation
```

**Interfaces:**

```ts
export function resolveRefs<T>(value: T, scope: RefScope): T;

export function defineDataSources<T extends DataSourceRegistry>(sources: T): T;

export function createSdkDataSource<TParams, TRequest, TResponse, TOutput>(
  options: CreateSdkDataSourceOptions<TParams, TRequest, TResponse, TOutput>
): DataSourceDefinition<TParams, TOutput>;

export function defineWidget<TData, TProps>(
  definition: WidgetDefinition<TData, TProps>
): WidgetDefinition<TData, TProps>;

export function createDataSourceCatalog(registry: DataSourceRegistry): DataSourceCatalogItem[];
export function createWidgetCatalog(registry: WidgetRegistry): WidgetCatalogItem[];
```

**Pros:**

- Smallest blast radius that still proves the hardest requirement: config -> runtime -> dataSource -> widget -> i18n.
- Produces a working vertical slice before adding breadth.
- Keeps generator and sandbox behind validated contracts, reducing design drift.
- Gives tests a stable seam around schema validation, ref resolution, data loading, and catalog export.

**Cons:**

- The initial package layout does not match the final source-document package list exactly.
- Some basic widgets may move once `ai-dashboard-widgets` or framework-specific widget packages are split out.
- Generator and sandbox are delayed, so AI-generated chart code is not proven in the first stage.

**Risk:** Medium. The biggest risk is underbuilding package boundaries and having to extract widgets later, but that extraction is reversible if public contracts stay in schema/runtime.

### Option C — Product Host Plugin First

Build the dashboard runtime as a Vue host-app integration pattern rather than a platform workspace. Start inside a sample product app under `product-a/src/big-screen`, define local registries, and extract packages only after one product dashboard works.

**Module changes:** Create a product-style app tree with local `data-sources`, `dashboards`, `i18n`, and `screens`, then extract shared packages later.

**Data flow:** Product route renders dashboard screen -> local dashboard config -> local runtime helpers -> local dataSource registry wraps product SDK -> local widgets render.

**Interfaces:**

```ts
export const clusterDataSources = defineDataSources({
  "cluster.cpuUsage": createSdkDataSource({ /* product SDK adapter */ }),
});

// ClusterOverviewDashboard.vue passes config, dataSources, and widgets into
// the Vue BigScreenRuntime component.
```

**Pros:**

- Fastest route to validate product developer ergonomics.
- Forces integration with the proto SDK calling style early.
- Avoids speculative publishing decisions.

**Cons:**

- Platform boundaries become implicit and harder to enforce.
- AI catalog security can leak implementation details if extraction is late.
- Reuse across products becomes a refactor instead of the default path.

**Risk:** Medium-high. This optimizes for one product's first screen at the expense of the multi-product platform goal.

## Recommendation

**We pick Option B.** It is the smallest vertical slice that still exercises the real platform contracts: schema validation, safe config execution, dataSource wrapping, Vue widget rendering through an adapter boundary, i18n, and AI metadata export. The accepted tradeoff is that the final package catalog, alternate renderer adapters, and generated chart sandbox arrive later; that is preferable to building unproven package boundaries and safety gates before the runtime contract works.

## Chosen Design — Detail

### Module Breakdown

- `package.json` — workspace scripts for build, test, lint, typecheck, dev.
- `pnpm-workspace.yaml` — workspace membership for `packages/*` and `apps/*`.
- `tsconfig.base.json` — strict shared TypeScript settings.
- `vitest.config.ts` or per-package Vitest configs — unit and Vue component test setup.
- `packages/ai-dashboard-schema/src/i18n.ts` — `LocaleCode`, `I18nText`, `ConfigRef`, `ConfigValue`, and Zod schemas.
- `packages/ai-dashboard-schema/src/dashboard-config.ts` — `DashboardConfig`, canvas, context, global filters, and schema.
- `packages/ai-dashboard-schema/src/widget-config.ts` — `WidgetConfig`, `DataBindingConfig`, `WidgetEventConfig`, layout, refresh, and schema.
- `packages/ai-dashboard-schema/src/index.ts` — public schema exports.
- `packages/ai-dashboard-runtime/src/ref-resolver.ts` — recursive `$ref` resolution with explicit missing-ref errors.
- `packages/ai-dashboard-runtime/src/data-source.ts` — `DataSourceDefinition`, `defineDataSources`, `createSdkDataSource`, query context.
- `packages/ai-dashboard-runtime/src/widget-registry.ts` — framework-neutral `WidgetDefinition`, `defineWidget`, registry types.
- `packages/ai-dashboard-runtime/src/renderer-adapter.ts` — renderer-independent widget runtime props, emitted event types, and adapter contract.
- `packages/ai-dashboard-runtime/src/i18n-runtime.ts` — `resolveI18nText`, `mergeLocaleMessages`, runtime translator contract, and host i18n adapter boundary.
- `packages/ai-dashboard-runtime/src/formatters.ts` — `Intl`-based number/date/percent formatters.
- `packages/ai-dashboard-runtime/src/data-loader.ts` — params resolution, params validation, query execution, output validation.
- `packages/ai-dashboard-runtime/src/refresh-manager.ts` — interval refresh and cancellation primitives.
- `packages/ai-dashboard-runtime/src/event-dispatcher.ts` — maps widget-emitted events through configured widget event actions.
- `packages/ai-dashboard-runtime/src/index.ts` — public runtime exports.
- `packages/ai-dashboard-vue/src/ScreenCanvas.vue` — fixed canvas and `fit` / `fill` / `scroll` scale modes.
- `packages/ai-dashboard-vue/src/WidgetShell.vue` — title, loading, empty, error, and layout shell.
- `packages/ai-dashboard-vue/src/WidgetErrorBoundary.vue` — widget-level render failure isolation using Vue error capture.
- `packages/ai-dashboard-vue/src/WidgetRenderer.vue` — registry lookup, data loading, event dispatch, widget prop assembly, and dynamic Vue component rendering.
- `packages/ai-dashboard-vue/src/BigScreenRuntime.vue` — validates config and orchestrates canvas/widgets/context for Vue.
- `packages/ai-dashboard-vue/src/define-vue-widget.ts` — typed helper for Vue widget definitions.
- `packages/ai-dashboard-vue/src/index.ts` — public Vue renderer exports.
- `packages/ai-dashboard-echarts-vue/src/LineChart.vue` — first Vue ECharts widget.
- `packages/ai-dashboard-echarts-vue/src/GaugeChart.vue` — first metric-style chart widget.
- `packages/ai-dashboard-echarts-vue/src/DonutChart.vue` — first category distribution widget.
- `packages/ai-dashboard-echarts-vue/src/echarts-widgets.ts` — Vue widget definitions and metadata for the initial charts.
- `packages/ai-dashboard-echarts-vue/src/index.ts` — public Vue chart exports.
- `packages/ai-dashboard-ai-catalog/src/create-data-source-catalog.ts` — metadata-only dataSource export.
- `packages/ai-dashboard-ai-catalog/src/create-widget-catalog.ts` — metadata-only widget export.
- `packages/ai-dashboard-ai-catalog/src/prompt-templates.ts` — MVP prompt text constants.
- `packages/ai-dashboard-ai-catalog/src/index.ts` — public catalog exports.
- `apps/demo/src/mock-sdk.ts` — mock proto-style static service methods.
- `apps/demo/src/data-sources/cluster.ts` — demo `createSdkDataSource` registrations.
- `apps/demo/src/dashboards/cluster-overview.ts` — example DashboardConfig.
- `apps/demo/src/dashboards/cluster-overview.i18n/en-US.json` — dashboard-owned English messages to merge into the host project i18n messages.
- `apps/demo/src/dashboards/cluster-overview.i18n/zh-CN.json` — dashboard-owned Chinese messages to merge into the host project i18n messages.
- `apps/demo/src/dashboards/cluster-overview.i18n/index.ts` — dashboard message export map.
- `apps/demo/src/i18n/messages.ts` — demo project messages plus merged dashboard messages.
- `apps/demo/src/App.vue` — renders the Vue `BigScreenRuntime`.

### Data Flow

```text
DashboardConfig input
  -> dashboardConfigSchema.parse(config)
  -> create base runtime input(locale, timezone, route, user, messages)
  -> resolve config.globalFilters against base scope
  -> resolve config.context against base scope + globalFilters
  -> create resolved runtime context
  -> ScreenCanvas computes scale and absolute layout
  -> WidgetRenderer per widget:
       - resolve visible
       - resolve title/description i18n
       - find WidgetDefinition by type
       - resolve data.params via ref-resolver
       - validate params with dataSource.paramsSchema
       - call dataSource.query({ params, runtime, signal })
       - validate output with dataSource.outputSchema
       - validate output against widget.dataSchema
       - validate widget props with widget.propsSchema
       - render WidgetShell + widget component
  -> widget emits low-level event
  -> event dispatcher matches WidgetConfig.events by trigger
  -> runtime executes configured setFilter / refreshWidget / emit action
```

AI catalog flow:

```text
DataSourceRegistry + WidgetRegistry
  -> catalog creators strip executable fields
  -> JSON-safe catalog items
  -> prompt templates / external AI generator
  -> DashboardPlan
  -> DashboardConfig
  -> schema + catalog validation before runtime sees it
```

Dashboard config packaging flow:

```text
dashboard config file
  + dashboard-owned locale JSON files
  -> project imports dashboard messages
  -> mergeLocaleMessages(projectMessages, dashboardMessages)
  -> host vue-i18n composer / runtime t function sees dashboard keys
```

Generated chart flow, later stage:

```text
chart proposal
  -> generated package files
  -> manifest/schema validation
  -> TypeScript check + ESLint
  -> AST and dependency allowlist scan
  -> bundle build
  -> iframe preview with sample data
  -> human approval
  -> generated widget registry
```

### Interfaces

Schema:

```ts
export type I18nText =
  | string
  | {
      key: string;
      defaultMessage?: string;
      values?: Record<string, ConfigValue>;
    };

export type ConfigRef = { $ref: string };
export type ConfigValue<T = unknown> = T | ConfigRef;

export type DashboardConfig = {
  version: string;
  meta?: {
    id?: string;
    name?: I18nText;
    description?: I18nText;
    owner?: string;
    tags?: string[];
  };
  canvas: {
    width: number;
    height: number;
    scaleMode: "fit" | "fill" | "scroll";
    theme: string;
    background?: string;
  };
  i18n?: {
    namespace?: string;
    defaultLocale?: string;
    supportedLocales?: string[];
  };
  context?: Record<string, ConfigValue>;
  globalFilters?: Record<string, unknown>;
  widgets: WidgetConfig[];
};
```

Runtime:

```ts
export type RuntimeInput = {
  locale: string;
  fallbackLocale?: string;
  timezone?: string;
  route?: unknown;
  user?: unknown;
  messages?: LocaleMessages;
  t?: (key: string, values?: Record<string, unknown>) => string;
};

export type LocaleMessages = Record<string, LocaleMessageObject>;
export type LocaleMessage =
  | string
  | number
  | boolean
  | null
  | LocaleMessageObject
  | LocaleMessage[];
export type LocaleMessageObject = { [key: string]: LocaleMessage };

export function mergeLocaleMessages(
  ...sources: Array<LocaleMessages | undefined>
): LocaleMessages;

export type RuntimeContext = RuntimeInput & {
  context: Record<string, unknown>;
  globalFilters: Record<string, unknown>;
};

export type RefScope = {
  runtime: Pick<RuntimeContext, "locale" | "timezone" | "route" | "user">;
  context: Record<string, unknown>;
  globalFilters: Record<string, unknown>;
};

export type EventRefScope = RefScope & {
  event: {
    payload?: Record<string, unknown>;
  };
};

export type BigScreenRuntimeProps = {
  config: DashboardConfig;
  widgets: WidgetRegistry;
  dataSources: DataSourceRegistry;
  runtime: RuntimeInput;
  minRefreshIntervalMs?: number;
  onEvent?: (event: WidgetRuntimeEvent) => void;
};
```

Dashboard-owned i18n files are not embedded in `DashboardConfig`; the config only references i18n keys. The adjacent JSON resources are build-time artifacts owned by the dashboard package and are merged into the host application's existing i18n message source. Generated keys should stay under the dashboard namespace to avoid collisions with existing project messages.

`globalFilters` are resolved before `context`; `context` may reference `runtime.*` and `globalFilters.*`; widget params may reference `runtime.*`, `context.*`, and `globalFilters.*`. MVP does not support refs from `globalFilters` back into `context`, and cyclic refs are invalid.

DataSource:

```ts
export type DataSourceQueryContext<TParams = unknown> = {
  params: TParams;
  runtime: RuntimeContext;
  signal?: AbortSignal;
};

export type DataSourceDefinition<TParams, TOutput> = {
  name: string;
  description?: string;
  category?: string;
  paramsSchema: z.ZodSchema<TParams>;
  outputSchema: z.ZodSchema<TOutput>;
  compatibleWidgets?: string[];
  examples?: Array<{ params: TParams; output: TOutput }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredWidgets?: string[];
  };
  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
  dependsOnLocale?: boolean;
  query: (ctx: DataSourceQueryContext<TParams>) => Promise<TOutput>;
};
```

Widget:

```ts
export type WidgetRuntimeProps<TData = unknown, TProps = unknown> = {
  id: string;
  title?: string;
  data: TData;
  props: TProps;
  theme: DashboardTheme;
  locale: string;
  timezone?: string;
  t: (key: string, values?: Record<string, unknown>) => string;
  format: ReturnType<typeof createFormatters>;
  loading?: boolean;
  error?: Error | null;
  width?: number;
  height?: number;
  emit?: (event: WidgetEmittedEvent) => void;
};

export type WidgetFramework = "vue" | string;

export type WidgetRendererAdapter<TComponent = unknown> = {
  framework: WidgetFramework;
  render: (component: TComponent, props: WidgetRuntimeProps) => unknown;
};

export type WidgetDefinition<TData, TProps, TComponent = unknown> = {
  type: string;
  name: string;
  description?: string;
  category: "metric" | "chart" | "table" | "layout" | "filter";
  framework: WidgetFramework;
  component: TComponent;
  dataSchema: z.ZodSchema<TData>;
  propsSchema: z.ZodSchema<TProps>;
  examples?: Array<{ title: string; data: TData; props: TProps }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredDataShape?: string;
  };
  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
};
```

The runtime core owns `WidgetRuntimeProps` and registry metadata, but not a concrete UI framework. The Vue package supplies `defineVueWidget<TData, TProps>()`, whose component type is a Vue 3.3 component that receives `WidgetRuntimeProps<TData, TProps>`-compatible props and emits `WidgetEmittedEvent`.

Events:

```ts
export type WidgetEmittedEvent = {
  trigger: string;
  sourceWidgetId: string;
  payload?: Record<string, unknown>;
};

export type WidgetRuntimeEvent =
  | {
      type: "setFilter";
      sourceWidgetId: string;
      payload: { key: string; value: unknown };
    }
  | {
      type: "refreshWidget";
      sourceWidgetId: string;
      targetWidgetId: string;
    }
  | {
      type: "emit";
      sourceWidgetId: string;
      name: string;
      payload?: Record<string, unknown>;
    };
```

Widget components only emit `WidgetEmittedEvent`. They do not decide whether a click sets a filter, refreshes another widget, or emits a host event. `event-dispatcher.ts` maps `WidgetEmittedEvent.trigger` to that widget's `WidgetConfig.events[]`, resolves configured payload refs against `runtime.*`, `context.*`, `globalFilters.*`, and `event.payload.*`, then produces a `WidgetRuntimeEvent`.

Catalog:

```ts
export type DataSourceCatalogItem = Omit<
  DataSourceDefinition<unknown, unknown>,
  "paramsSchema" | "outputSchema" | "query"
> & {
  key: string;
  paramsSchema: JsonSchema;
  outputSchema: JsonSchema;
};

export type WidgetCatalogItem = Omit<
  WidgetDefinition<unknown, unknown>,
  "component" | "dataSchema" | "propsSchema"
> & {
  dataSchema: JsonSchema;
  propsSchema: JsonSchema;
};
```

### Data / Schema Changes

No database or server-side schema changes in MVP.

Runtime schema changes are TypeScript/Zod contracts only:

- `dashboardConfigSchema`
- `widgetConfigSchema`
- `dataBindingConfigSchema`
- `widgetEventConfigSchema`
- `i18nTextSchema`
- `configRefSchema`
- `generatedChartManifestSchema` in the sandbox stage

Runtime-only validation also checks cross-registry constraints that Zod cannot know alone:

- every `widget.type` exists in `WidgetRegistry`
- every `widget.data.source` exists in `DataSourceRegistry`
- dataSource output is compatible with the selected widget `dataSchema`
- `widget.props` satisfy the selected widget `propsSchema`
- widget layouts stay within canvas bounds
- refresh intervals satisfy the configured minimum

Dashboard config storage, version history, release approval, and persistence are deferred.

### Failure Modes & Handling

- Invalid DashboardConfig: `BigScreenRuntime` renders a config-level error with Zod issue details in development and a concise error in production.
- Unknown widget type: widget shell renders an error for that widget only.
- Unknown dataSource key: widget shell renders an error for that widget only.
- Missing `$ref`: data loading fails before query and reports the missing path.
- Cyclic or invalid `$ref` scope usage: config validation fails before any dataSource query runs.
- Invalid params: data loading fails before query and reports schema issues.
- Query failure: widget shell renders data error and keeps sibling widgets alive.
- Invalid output: widget shell renders schema error and logs source key for diagnosis.
- DataSource output incompatible with widget dataSchema: widget shell renders a compatibility error naming source key and widget type.
- Empty data: widget shell shows configured empty fallback or default empty state.
- Widget component throws: ErrorBoundary isolates the widget.
- Locale changes: runtime recomputes i18n text and formatters; sources with `dependsOnLocale` or locale refs reload.
- Refresh interval below minimum: config validation rejects AI-generated config or runtime clamps and warns for trusted hand-written config; implementation should prefer rejection in validation utilities.
- Stale requests: AbortController aborts previous request when widget params, filters, locale, dashboard, or component lifecycle changes.
- Widget emits an event with no configured action: runtime ignores it unless `onEvent` is configured for raw observation; no implicit filter mutation occurs.
- Event payload ref cannot be resolved: configured action is skipped and the widget shell reports an event error in development.
- Catalog export accidentally includes executable fields: tests assert `query`, `component`, and function-valued fields are absent.
- Generated chart contains forbidden API: AST scan fails with exact identifier/member expression and file location.
- Generated chart uses unapproved dependency: dependency scan fails before bundle/preview.
- Sandbox preview crashes: generated widget is not registrable; preview error is attached to review output.

### Rollout / Migration

There is no production migration because the repository has no implementation yet.

Rollout path:

1. Land package scaffolding, schema, runtime contracts, and tests without publishing.
2. Land a demo dashboard using mocked proto-style SDK calls.
3. Replace mock SDK in one product integration branch with real generated SDK wrappers.
4. Keep generated chart publishing disabled until sandbox validation and human approval are implemented.
5. Publish packages internally only after a product integration confirms the runtime contracts.

### Test Strategy Hooks

- Schema package: pure unit tests for valid/invalid config fixtures.
- Ref resolver: pure unit tests for nested object/array refs, root scopes, missing refs, and no `$expr` behavior.
- DataSource helper: unit tests with mocked static service methods and Zod parse failures.
- Data loader: unit tests for params resolution, output validation, abort propagation, and error surfacing.
- Runtime core: unit tests for refs, data loading, event dispatch, refresh, host i18n adapter fallback behavior, and validation without Vue imports.
- i18n merge: unit tests for merging dashboard locale JSON into project messages without overwriting unrelated project keys.
- Vue renderer: Vue Test Utils tests for multiple widgets, error boundaries, loading/error/empty states, locale switch, widget dataSchema compatibility, and event dispatch mapping.
- Vue ECharts widgets: component tests can mock `vue-echarts` and assert option inputs, not canvas pixels.
- Catalog: snapshot/structural tests ensuring no function fields or implementation source are exported.
- Demo app: smoke test verifies one config renders multiple widget shells and locale toggle changes text.
- Sandbox stage: fixture tests for allowed and blocked generated chart packages.

## Staged Implementation Plan

1. **Stage 1 — Workspace + Schema Contracts**: Create pnpm workspace, TypeScript/Vitest/ESLint setup, schema package, config fixtures, and schema tests. No runtime rendering yet.
2. **Stage 2 — Runtime + Vue Tracer Bullet**: Implement framework-neutral ref resolver with explicit scope order, i18n runtime, formatters, dataSource registry/helper, widget registry, data loader, widget dataSchema compatibility validation, renderer adapter contracts, Vue `ScreenCanvas`, Vue `WidgetShell`, Vue `WidgetRenderer`, Vue `BigScreenRuntime`, and a demo with mocked SDK and one simple non-ECharts Vue widget.
3. **Stage 3 — Vue ECharts Widget Slice**: Add `ai-dashboard-echarts-vue` with LineChart, GaugeChart, DonutChart, widget metadata, ECharts locale/theme adapter, and demo dashboard updates.
4. **Stage 4 — AI Catalog + Config Validation Gate**: Add catalog package, JSON schema conversion, prompt templates, validation helpers for unknown dataSource/widget, i18n text enforcement, layout bounds, and minimum refresh interval.
5. **Stage 5 — Runtime Event + Refresh Hardening**: Implement event dispatcher mapping from widget-emitted triggers to configured `setFilter`, `refreshWidget`, and `emit` actions; finish interval refresh behavior, request cancellation on filter/locale/dashboard changes, and dependsOnLocale reload tests.
6. **Stage 6 — Basic Widgets Extraction**: Extract reusable Vue MetricCard, RankingList, ScrollTable, AlarmList, FilterBar, and TimeRangePicker into `ai-dashboard-widgets` once the runtime widget shell contract is stable; keep component internals behind the framework marker so future renderer packages can provide equivalents.
7. **Stage 7 — Generated Chart Sandbox Gate**: Add generated chart package schema, dependency allowlist, AST safety scan, type/lint/build hooks, iframe preview contract, fixture tests, and a disabled-by-default generated registry.
8. **Stage 8 — Product Integration Example**: Add a product-style example tree showing real-world dataSource file layout, dashboard config, i18n messages, and host screen integration.

Each stage is independently shippable: the build and tests should pass, and the demo app should remain runnable from Stage 2 onward.

## Open Questions

- Confirm whether `pnpm` is the desired package manager and whether this repo should use Turborepo, plain pnpm scripts, or another build orchestrator.
- Decide the exact minimum refresh interval. The design assumes `5000ms` because the source document used it as an example.
- Decide whether trusted hand-written configs below the refresh minimum should be rejected or clamped; AI output should be rejected.
- Decide if config-level validation errors should render in production UI or be handled by the host application.
- Decide whether widget layout uses raw pixel coordinates only for MVP or should reserve a future grid abstraction.
- Decide whether catalog JSON schema conversion uses `zod-to-json-schema` or a narrower custom schema serializer.
- Decide whether generated chart sandbox runs as a local CLI first or inside a management UI.
- Decide CSP and `postMessage` protocol details for iframe preview before implementing Stage 7.
