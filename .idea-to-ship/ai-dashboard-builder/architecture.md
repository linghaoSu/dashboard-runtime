# Architecture — AI Dashboard Builder

**Slug:** ai-dashboard-builder
**Date:** 2026-05-09
**Status:** reviewed
**References:** requirements.md, ../../doc.md

## Summary

Build a TypeScript workspace around a small framework-neutral core first, with Vue 3.3.x as the default UI renderer. The initial slice covers schema, registry contracts, `$ref` resolution, runtime data flow, i18n, a Vue renderer adapter, mocked dataSource integration, ECharts widgets, AI catalog export, and a validation gate. The recommended approach remains Option B: a core tracer bullet in a monorepo, with package boundaries created where they protect contracts from day one. This proves the end-to-end runtime and AI catalog boundary while leaving room for a future React or other renderer adapter.

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

This repository now contains the v0.1 implementation baseline:

- `doc.md` — original design document.
- `.idea-to-ship/ai-dashboard-builder/requirements.md` — normalized requirements artifact.
- `.idea-to-ship/ai-dashboard-builder/code-review.md` — latest review record for design drift and completed verification.
- Root pnpm workspace, TypeScript, Vitest, ESLint, package build configs, and `apps/demo`.
- Implemented packages: `ai-dashboard-schema`, `ai-dashboard-runtime`, `ai-dashboard-vue`, `ai-dashboard-echarts-vue`, and `ai-dashboard-ai-catalog`.
- `playground/playground-ui` — standalone `@dao-style/cli` full-template host app outside the root workspace.
- `/Users/sulinghao/workspaces/dce5/amamba-ui/src/plugins/vue-i18n` — reference host-app locale integration supplied during implementation. It uses Vue I18n composition mode, dynamic locale loading, locale fallback resolution, and external package locale merging.

The implemented package and product-integration contracts should be treated as landed baseline, not design speculation. Future architecture work must preserve the current public package contracts unless `code-review.md` records an explicit accepted deviation.

- Use root `pnpm` workspaces for platform packages and keep the full-template playground standalone.
- Use TypeScript, Vue 3.3.x, Vite, Vitest, Vue Test Utils, ESLint, Zod, ECharts, and `vue-echarts`.
- Publishable package names use the `@dao-style-viz/*` npm scope.
- A local demo app is required to verify runtime behavior, but it is not a product dashboard editor.
- Proto generated SDK integration is represented by mock static service methods in the demo/tests until a real product repo integrates the packages.
- Keep schema, dataSource, ref resolution, catalog, and validation contracts free of Vue imports so another renderer can be added without rewriting those contracts.
- The Vue renderer should integrate with a host-provided `vue-i18n` composer or `t` function instead of owning global locale installation; standalone demo messages are only a fallback for local verification.
- `mcp-echarts` can be used as an optional local MCP helper for AI chart generation. It can generate ECharts option/image artifacts and validate option syntax, but it is not a runtime dependency and cannot bypass schema, registry, or sandbox checks.
- A realistic host playground lives under `playground/playground-ui`, generated from `@dao-style/cli` full template with `@dao-style/core`, `@dao-style/extend`, and `@dao-style/biz`. It stays outside the root pnpm workspace so it behaves like an independent product app.

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

Keep the first basic widgets inside the Vue package or demo until they prove enough shared behavior to justify `ai-dashboard-widgets`. Represent generator output with pure prompt templates, typed plan/config contracts, and validation functions before adding a model-backed generator package. Defer generated chart sandbox to a later stage after registry/catalog contracts are stable. Before declaring MVP complete, close the chart/widget coverage gap: the final MVP must include the required basic widgets and ECharts chart types listed in `requirements.md`, not only the tracer-bullet chart set.

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
- `packages/ai-dashboard-echarts-vue/src/<Chart>.vue` — later Stage 6 additions for BarChart, AreaChart, PieChart, RadarChart, HeatmapChart, ScatterChart, FunnelChart, and MapChart so MVP chart coverage matches requirements.
- `packages/ai-dashboard-widgets/src/*` — later Stage 6 extraction for Panel, MetricCard, StatusBadge, RankingList, ScrollTable, AlarmList, FilterBar, and TimeRangePicker.
- `packages/ai-dashboard-ai-catalog/src/create-data-source-catalog.ts` — metadata-only dataSource export.
- `packages/ai-dashboard-ai-catalog/src/create-widget-catalog.ts` — metadata-only widget export.
- `packages/ai-dashboard-ai-catalog/src/create-theme-catalog.ts` — later catalog-completeness addition for theme token and palette metadata without renderer internals.
- `packages/ai-dashboard-ai-catalog/src/create-layout-catalog.ts` — later catalog-completeness addition for layout preset metadata.
- `packages/ai-dashboard-ai-catalog/src/create-i18n-catalog.ts` — later catalog-completeness addition for supported locales, namespace conventions, and required dashboard-owned locale resource metadata.
- `packages/ai-dashboard-ai-catalog/src/prompt-templates.ts` — MVP prompt text constants.
- `packages/ai-dashboard-ai-catalog/src/index.ts` — public catalog exports.
- `packages/ai-dashboard-generator/src/mcp-echarts-adapter.ts` — optional future adapter that calls `mcp-echarts` for chart option preview/validation evidence.
- `apps/demo/src/mock-sdk.ts` — mock proto-style static service methods.
- `apps/demo/src/data-sources/cluster.ts` — demo `createSdkDataSource` registrations.
- `apps/demo/src/dashboards/cluster-overview.ts` — example DashboardConfig.
- `apps/demo/src/dashboards/cluster-overview.i18n/en-US.json` — dashboard-owned English messages to merge into the host project i18n messages.
- `apps/demo/src/dashboards/cluster-overview.i18n/zh-CN.json` — dashboard-owned Chinese messages to merge into the host project i18n messages.
- `apps/demo/src/dashboards/cluster-overview.i18n/index.ts` — dashboard message export map.
- `apps/demo/src/i18n/messages.ts` — demo project messages plus merged dashboard messages.
- `apps/demo/src/App.vue` — renders the Vue `BigScreenRuntime`.
- `playground/playground-ui/` — standalone full-template Vue 3.3.x host app for validating package ergonomics in a realistic DaoStyle project shell.

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
DataSourceRegistry + WidgetRegistry + theme metadata + layout presets + i18n metadata
  -> catalog creators strip executable fields
  -> JSON-safe catalog items with curated/mock/redacted examples only
  -> prompt templates / external AI generator
  -> optional mcp-echarts option/image preview using sample data only
  -> DashboardPlan
  -> DashboardConfig
  -> schema + catalog validation before runtime sees it
```

`mcp-echarts` integration boundary:

```text
catalog metadata + sample/mock data
  -> AI proposes chart intent or ECharts option shape
  -> mcp-echarts renders/validates option locally
  -> generator records preview artifact + option feedback
  -> generator maps the result back to DashboardConfig props or chart proposal files
  -> platform schema/sandbox/human review remains authoritative
```

The MCP server must not receive business SDK source, query implementations, auth tokens, cookies, raw user-sensitive data, or unredacted production responses. Catalog `examples` are an opt-in documentation artifact: they must be synthetic, mocked, aggregated, or manually redacted before catalog export. Captured production responses are not allowed in dataSource or widget examples. If object storage output is enabled for chart artifacts, those URLs are review artifacts only and are not stored inside DashboardConfig.

AI generation flow:

```text
user intent + catalog metadata + dashboard locale requirements
  -> DashboardPlan with selected widgets/dataSources, rationale, gaps, and i18n key plan
  -> DashboardConfig candidate + adjacent locale JSON resources
  -> schema validation
  -> catalog validation: known widget/dataSource, compatible widgets, props, static params, layout bounds, i18n keys, refresh minimum
  -> runtime rendering only after validation succeeds
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
  theme?: ThemeConfig;
  i18n?: {
    namespace?: string;
    defaultLocale?: string;
    supportedLocales?: string[];
  };
  context?: Record<string, ConfigValue>;
  globalFilters?: Record<string, unknown>;
  widgets: WidgetConfig[];
};

export type ThemeConfig = {
  key: string;
  tokens?: Record<string, string | number>;
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

Ref resolution is not a general graph engine. Config validation must build a dependency graph for `context` refs and static widget params that point at `context.*` / `globalFilters.*`, then fail cycles with the full path chain before any dataSource query starts. Refs into `runtime.*` and `event.payload.*` are leaf inputs and cannot introduce config cycles. Runtime-only refs that depend on route, locale, user, or event payload are resolved at use time and still fail explicitly if the path is missing.

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
  examples?: Array<{
    params: TParams;
    output: TOutput;
    sensitivity: "synthetic" | "mock" | "aggregated" | "redacted";
  }>;
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

DataSource keys use the `domain.resource.metric` convention inside one registry. Cross-product collisions are handled by registry namespace, not by stuffing product names into every source key. A host can register `{ namespace: "product-a", sources }`; catalog export must include the namespace and use a stable fully-qualified id such as `product-a:cluster.cpuUsage` when multiple registries are combined for AI generation.

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
  examples?: Array<{
    title: string;
    data: TData;
    props: TProps;
    sensitivity: "synthetic" | "mock" | "aggregated" | "redacted";
  }>;
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
export type WidgetEventConfig =
  | {
      trigger: string;
      action: "setFilter";
      payload: {
        key: string | ConfigRef;
        value: ConfigValue;
      };
    }
  | {
      trigger: string;
      action: "refreshWidget";
      target?: string;
      payload?: Record<string, ConfigValue>;
    }
  | {
      trigger: string;
      action: "emit";
      target?: string;
      payload?: Record<string, ConfigValue>;
    };

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

Widget components only emit `WidgetEmittedEvent`. They do not decide whether a click sets a filter, refreshes another widget, or emits a host event. `event-dispatcher.ts` maps `WidgetEmittedEvent.trigger` to that widget's `WidgetConfig.events[]`, resolves configured payload refs against `runtime.*`, `context.*`, `globalFilters.*`, and `event.payload.*`, then produces a `WidgetRuntimeEvent`. `setFilter` requires a resolved string `payload.key`; `refreshWidget.target` defaults to the source widget id; `emit.target` defaults to the emitted trigger name. Unknown targets are validation errors for AI-generated config and widget-level runtime errors for trusted config that bypasses the validation utility.

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

export type ThemeCatalogItem = {
  key: string;
  name: string;
  description?: string;
  tokens: Record<string, string | number>;
  aiHints?: { goodFor?: string[]; notGoodFor?: string[] };
};

export type LayoutPresetCatalogItem = {
  key: string;
  name: string;
  canvas: { width: number; height: number; scaleMode: "fit" | "fill" | "scroll" };
  slots: Array<{ x: number; y: number; w: number; h: number; role?: string }>;
  aiHints?: { goodFor?: string[]; maxWidgets?: number };
};

export type I18nCatalogItem = {
  defaultLocale: string;
  supportedLocales: string[];
  dashboardNamespacePattern: string;
  requiredResourceFiles: string[];
};
```

Generator:

```ts
export type DashboardPlan = {
  intent: string;
  widgets: Array<{
    id: string;
    widgetType: string;
    dataSourceKey?: string;
    rationale: string;
    i18nKeys: string[];
  }>;
  globalFilters?: Array<{ key: string; rationale: string }>;
  missingCapabilities?: string[];
};

export type DashboardGenerationResult = {
  plan: DashboardPlan;
  config: DashboardConfig;
  localeMessages: LocaleMessages;
};
```

The MVP generator contract is model-agnostic. A hosted model, local agent, or manual prompt workflow can produce the result, but the platform only accepts it after the plan exists, dashboard-owned locale JSON is present, and validation passes. This avoids hard-coding a model service before the catalog and runtime contracts are stable while still satisfying the required plan-before-config flow.

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
- every selected `canvas.theme` exists in the theme catalog unless the host explicitly provides a trusted theme override
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
- Locale changes: runtime recomputes i18n text and formatters; a widget dataSource reloads only when the dataSource declares `dependsOnLocale`, widget params reference `runtime.locale`, or the host explicitly refreshes that widget. This prevents both stale locale-sensitive data and unnecessary dashboard-wide refetches.
- Refresh interval below minimum: config validation rejects it. The default minimum is `5000ms`; hosts may raise the minimum, but should not lower it for AI-generated configs.
- Stale requests: AbortController aborts previous request when widget params, filters, locale, dashboard, or component lifecycle changes.
- Widget emits an event with no configured action: runtime ignores it unless `onEvent` is configured for raw observation; no implicit filter mutation occurs.
- Event payload ref cannot be resolved: configured action is skipped and the widget shell reports an event error in development.
- Catalog export accidentally includes executable fields: tests assert `query`, `component`, and function-valued fields are absent.
- Catalog example leaks sensitive data: catalog validation fails when an example is not explicitly marked synthetic/mock/aggregated/redacted by the dataSource owner. The catalog creator must not automatically sample production query output.
- Generated chart contains forbidden API: AST scan fails with exact identifier/member expression and file location.
- Generated chart uses unapproved dependency: dependency scan fails before bundle/preview.
- Sandbox preview crashes: generated widget is not registrable; preview error is attached to review output.

### Rollout / Migration

There is no production migration yet because no package has been published or integrated into a production host. The repository now has an unpublished local implementation for Stages 1-4.

Rollout path:

1. Finish Stage 5 runtime event/refresh hardening and keep all package tests green.
2. Close Stage 6 widget, chart, and catalog coverage so MVP functionality matches requirements, not only the tracer bullet.
3. Keep generated chart publishing disabled until sandbox validation and human approval are implemented.
4. Add the product integration example with real generated SDK wrapper shape and dashboard-owned locale JSON.
5. Publish packages internally only after one product-style integration confirms runtime contracts, host i18n wiring, package CSS imports, and standalone playground build behavior.

### Test Strategy Hooks

- Schema package: pure unit tests for valid/invalid config fixtures.
- Ref resolver: pure unit tests for nested object/array refs, root scopes, missing refs, and no `$expr` behavior.
- DataSource helper: unit tests with mocked static service methods and Zod parse failures.
- Data loader: unit tests for params resolution, output validation, abort propagation, and error surfacing.
- Runtime core: unit tests for refs, cycle detection, data loading, event dispatch, refresh, locale reload policy, host i18n adapter fallback behavior, and validation without Vue imports.
- i18n merge: unit tests for merging dashboard locale JSON into project messages without overwriting unrelated project keys.
- Vue renderer: Vue Test Utils tests for multiple widgets, error boundaries, loading/error/empty states, targeted `refreshWidget`, locale switch, widget dataSchema compatibility, and event dispatch mapping.
- Vue ECharts widgets: component tests can mock `vue-echarts` and assert option inputs, not canvas pixels. Stage 6 must add coverage for BarChart, AreaChart, PieChart, RadarChart, HeatmapChart, ScatterChart, FunnelChart, and MapChart before MVP acceptance.
- Catalog: snapshot/structural tests ensuring no function fields or implementation source are exported, plus tests that only curated/mock/redacted examples appear in catalog output and that theme/layout/i18n catalog entries are JSON-safe.
- Generator MCP adapter: contract tests or fixtures proving `mcp-echarts` output is treated as preview/validation evidence only and cannot skip DashboardConfig/sandbox validation.
- Demo app: smoke test verifies one config renders multiple widget shells and locale toggle changes text.
- Playground app: standalone install/build verifies the generated full-template host remains independent from the root workspace and can host future product-style integration tests.
- Sandbox stage: fixture tests for allowed and blocked generated chart packages.

## Staged Implementation Plan

1. **Stage 1 — Workspace + Schema Contracts**: Create pnpm workspace, TypeScript/Vitest/ESLint setup, schema package, config fixtures, and schema tests. No runtime rendering yet. Completed.
2. **Stage 2 — Runtime + Vue Tracer Bullet**: Implement framework-neutral ref resolver with explicit scope order, i18n runtime, formatters, dataSource registry/helper, widget registry, data loader, widget dataSchema compatibility validation, renderer adapter contracts, Vue `ScreenCanvas`, Vue `WidgetShell`, Vue `WidgetRenderer`, Vue `BigScreenRuntime`, and a demo with mocked SDK and one simple non-ECharts Vue widget. Completed.
3. **Stage 3 — Vue ECharts Widget Slice**: Add `ai-dashboard-echarts-vue` with LineChart, GaugeChart, DonutChart, widget metadata, ECharts locale/theme adapter, and demo dashboard updates. Completed.
4. **Stage 4 — AI Catalog + Config Validation Gate**: Add catalog package, dataSource/widget schema summaries, prompt templates, optional `mcp-echarts` generation-assist contract, validation helpers for unknown dataSource/widget, i18n text enforcement, layout bounds, minimum refresh interval, and a standalone `@dao-style/cli` full-template playground host. Completed for the dataSource/widget catalog slice.
5. **Stage 5 — Runtime Event + Refresh Hardening**: Implement event dispatcher mapping from widget-emitted triggers to configured `setFilter`, `refreshWidget`, and `emit` actions; implement targeted `refreshWidget` routing, request cancellation on filter/locale/dashboard changes, cycle detection for config refs, and reload tests for `dependsOnLocale` and `runtime.locale` param refs.
6. **Stage 6 — Chart + Basic Widget Coverage**: Extract reusable Vue Panel, MetricCard, StatusBadge, RankingList, ScrollTable, AlarmList, FilterBar, and TimeRangePicker into `ai-dashboard-widgets`; add BarChart, AreaChart, PieChart, RadarChart, HeatmapChart, ScatterChart, FunnelChart, and MapChart to `ai-dashboard-echarts-vue`; complete theme/layout/i18n catalog exports; keep component internals behind the framework marker so future renderer packages can provide equivalents.
7. **Stage 7 — Generated Chart Sandbox Gate**: Add generated chart package schema, dependency allowlist, AST safety scan, type/lint/build hooks, iframe preview contract, fixture tests, and a disabled-by-default generated registry.
8. **Stage 8 — Product Integration Example**: Add a product-style example tree showing real-world dataSource file layout, proto generated SDK wrapper shape, dashboard config, dashboard-owned i18n messages, host screen integration, and package CSS imports.

Each stage is independently shippable: the build and tests should pass, and the demo app should remain runnable from Stage 2 onward.

## Open Questions

- Decide if config-level validation errors should render in production UI or be handled by the host application.
- Decide whether widget layout uses raw pixel coordinates only for MVP or should reserve a future grid abstraction.
- Decide whether catalog JSON schema conversion uses `zod-to-json-schema` or a narrower custom schema serializer.
- Decide whether the model-backed generator is a local CLI workflow, an internal service, or host-provided orchestration. The package contract stays model-agnostic either way.
- Decide whether the `mcp-echarts` adapter is CLI-only for local agent runs or exposed behind an internal service for managed generation workflows.
- Decide whether generated chart sandbox runs as a local CLI first or inside a management UI.
- Decide CSP and `postMessage` protocol details for iframe preview before implementing Stage 7.
