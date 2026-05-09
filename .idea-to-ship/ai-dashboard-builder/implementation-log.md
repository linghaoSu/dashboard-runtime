# Implementation Log — ai-dashboard-builder

**Architecture:** architecture.md
**Started:** 2026-05-08

## Stage Status

- [x] Stage 1 — Workspace + Schema Contracts
- [x] Stage 2 — Runtime + Vue Tracer Bullet
- [x] Stage 3 — Vue ECharts Widget Slice
- [x] Stage 4 — AI Catalog + Config Validation Gate
- [x] Stage 5 — Runtime Event + Refresh Hardening
- [x] Stage 6 — Chart + Basic Widget Coverage
- [x] Stage 7 — Generated Chart Sandbox Gate
- [x] Stage 8 — Product Integration Example

## Stage 1 Pre-Stage Notes

### Sanity Check

- The repository currently has no package manager files, source tree, tests, or generated implementation.
- Existing tracked content is only `doc.md`; idea-to-ship artifacts are untracked design outputs.
- Stage 1 matches the architecture's expected greenfield state.

### Assumptions

- Use plain `pnpm` workspace scripts, not Turborepo, for Stage 1. The architecture leaves this open and plain scripts are the smallest working setup.
- Use package scope `@dao-style-viz/*`.
- Keep Stage 1 limited to `@dao-style-viz/ai-dashboard-schema`; runtime, catalog, ECharts, and demo app wait for later stages.
- The runtime/UI direction changed during Stage 1 to Vue 3.3.x with framework-neutral core contracts. Stage 1 remains schema-only and will not add Vue yet; Stage 2 will introduce the Vue renderer package.
- Use Zod v3-compatible APIs for schemas. This avoids relying on newer Zod behavior before the package baseline is proven.
- Use Vitest for schema tests and TypeScript `tsc --noEmit` for typecheck.
- Use flat ESLint config because a greenfield setup can start on the current ESLint format without legacy config migration.
- Host locale reference for later stages: `/Users/sulinghao/workspaces/dce5/amamba-ui/src/plugins/vue-i18n` uses Vue I18n composition mode, dynamic locale loading from `src/locales`, locale fallback resolution, and external package locale merging. Stage 1 does not depend on it.

## Stage 1 — Workspace + Schema Contracts

**Completed:** 2026-05-08 18:19 CST

### Files touched

- `.gitignore` — ignores dependency, build, coverage, and local OS artifacts.
- `package.json` — defines the private pnpm workspace and root verification scripts.
- `pnpm-workspace.yaml` — includes `packages/*` and `apps/*`.
- `pnpm-lock.yaml` — locks Stage 1 dependencies.
- `tsconfig.base.json` — adds strict shared TypeScript settings.
- `eslint.config.js` — adds flat ESLint config for TypeScript source.
- `vitest.config.ts` — adds Vitest defaults for workspace and package test runs.
- `packages/ai-dashboard-schema/package.json` — defines schema package scripts and Zod dependency.
- `packages/ai-dashboard-schema/tsconfig.json` — typecheck config for schema package.
- `packages/ai-dashboard-schema/tsconfig.build.json` — build config excluding tests and fixtures.
- `packages/ai-dashboard-schema/src/i18n.ts` — adds locale, i18n text, config ref, and config value schemas.
- `packages/ai-dashboard-schema/src/widget-config.ts` — adds widget, layout, data binding, refresh, and event schemas.
- `packages/ai-dashboard-schema/src/dashboard-config.ts` — adds dashboard, canvas, meta, and i18n config schemas.
- `packages/ai-dashboard-schema/src/index.ts` — exports schema package public API.
- `packages/ai-dashboard-schema/src/__fixtures__/cluster-overview.ts` — adds a valid dashboard config fixture.
- `packages/ai-dashboard-schema/src/__tests__/dashboard-config.test.ts` — covers valid config and invalid schema cases.
- `doc.md` — updates the design source to Vue 3.3.x / renderer-adapter direction and `@dao-style-viz/*` scope.
- `.idea-to-ship/ai-dashboard-builder/requirements.md` — updates requirements for Vue 3.3.x and renderer-switchable contracts.
- `.idea-to-ship/ai-dashboard-builder/architecture.md` — updates architecture for Vue 3.3.x, framework-neutral runtime core, Vue renderer package, and host i18n reference.
- `.idea-to-ship/ai-dashboard-builder/implementation-log.md` — records Stage 1 assumptions and completion.

### Decisions made during implementation

- Use NodeNext module output with explicit `.js` relative imports: keeps emitted package files consumable as ESM without a bundler.
- Keep schema package framework-neutral: Vue starts in Stage 2 because Stage 1 only owns contracts.
- Use Zod strict object schemas: executable functions and unknown config fields should fail at the schema boundary.
- Keep `openUrl` / `navigate` out of `WidgetEventAction`: they are explicitly not MVP runtime actions.
- Point package tests at `src/__tests__`: the first script variant found zero tests, so the command now fails if tests disappear.

### Deviations from architecture.md

- None for Stage 1. The architecture was updated during this stage to reflect the user's Vue 3.3.x direction before implementation continued.

### Adjacent issues noticed (NOT fixed here)

- `pnpm install` reported ignored `esbuild` build scripts. Current Stage 1 verification passes without approving builds; Vite/Vue stages may need an explicit build-script approval decision if native optimizer behavior matters.
- The host i18n reference uses Rspack/Webpack-style `require.context` and dynamic imports. Stage 2 should adapt to that as an integration boundary, not copy it directly into framework-neutral runtime code.

### Verification

- install: ok — `pnpm install`
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build`
- tests: ok — `pnpm -r --if-present test` ran 1 file / 5 tests, 0 failed

## Stage 2 Pre-Stage Notes

### Sanity Check

- Stage 1 is checked off and the workspace/schema package exists.
- There is no `ai-dashboard-runtime`, `ai-dashboard-vue`, or demo app implementation yet.
- The architecture now expects Vue 3.3.x as the default renderer and a framework-neutral runtime core.

### Assumptions

- Use Vue `3.3.13` for the Stage 2 renderer and demo.
- Stage 2 will not add ECharts or `vue-echarts`; those remain Stage 3.
- Use a single simple Vue widget in the demo (`MetricValue`) to prove dataSource -> runtime -> widget rendering.
- Implement interval refresh only at a basic widget-renderer level in Stage 2; deeper refresh/event hardening remains Stage 5.
- Integrate host i18n through a runtime `t` function boundary. The demo uses local messages, while the `amamba-ui` vue-i18n plugin remains a Stage 2/3 integration reference rather than a direct dependency.
- Use Vite library builds for the Vue package and the Vite app build for the demo.

## Stage 2 — Runtime + Vue Tracer Bullet

**Completed:** 2026-05-08 18:39 CST

### Files touched

- `package.json` — adds Vue/Vite/Vue Test Utils/jsdom/eslint parser tooling.
- `pnpm-lock.yaml` — locks Stage 2 Vue/Vite dependencies.
- `tsconfig.base.json` — adds workspace path aliases for schema/runtime/vue packages.
- `eslint.config.js` — enables Vue SFC lint parsing and disables noisy template formatting rules.
- `packages/ai-dashboard-runtime/package.json` — adds runtime package scripts and dependencies.
- `packages/ai-dashboard-runtime/tsconfig.json` — runtime typecheck config.
- `packages/ai-dashboard-runtime/tsconfig.build.json` — runtime build config using built schema declarations.
- `packages/ai-dashboard-runtime/src/*` — adds ref resolver, runtime context, dataSource helper, widget registry, data loader, i18n runtime, formatters, event dispatcher, refresh primitives, and public exports.
- `packages/ai-dashboard-runtime/src/__tests__/*` — adds unit tests for refs, dataSource helper, and data loader/widget dataSchema compatibility.
- `packages/ai-dashboard-vue/package.json` — adds Vue renderer package scripts and dependencies.
- `packages/ai-dashboard-vue/tsconfig.json` — Vue renderer typecheck config.
- `packages/ai-dashboard-vue/tsconfig.build.json` — Vue renderer declaration build config using built runtime/schema declarations.
- `packages/ai-dashboard-vue/vite.config.ts` — library build config for Vue renderer.
- `packages/ai-dashboard-vue/src/*` — adds Vue `BigScreenRuntime`, `ScreenCanvas`, `WidgetRenderer`, `WidgetShell`, `WidgetErrorBoundary`, `defineVueWidget`, and exports.
- `apps/demo/package.json` — adds Vite demo app scripts and dependencies.
- `apps/demo/tsconfig.json` — demo typecheck config.
- `apps/demo/vite.config.ts` — demo Vite config.
- `apps/demo/index.html` — demo HTML entry.
- `apps/demo/src/*` — adds mocked SDK, dataSource registration, dashboard config, messages, simple MetricValue widget, app shell, and main entry.

### Decisions made during implementation

- Split runtime core from Vue rendering: runtime has no Vue imports; Vue package owns component rendering and error boundaries.
- Use `RuntimeInput.t` as the host i18n seam, with `messages` as a demo/local fallback. This matches the provided `amamba-ui` vue-i18n reference without copying its global installer.
- Keep the demo widget non-ECharts (`MetricValue`) because Stage 3 owns ECharts.
- Make `DataSourceRegistry` and `WidgetRegistry` maps use `Definition<any, any>` internally. Zod-backed definitions are strongly typed at creation time, but registry maps must accept heterogeneous definitions.
- Build Vue package declarations with `vue-tsc` and bundle JS/CSS with Vite.

### Deviations from architecture.md

- None. Stage 2 follows the updated Vue 3.3.x architecture.

### Adjacent issues noticed (NOT fixed here)

- `pnpm install` still reports ignored `esbuild` build scripts, but Stage 2 Vite builds pass without approving them.
- The demo dev server required escalated permission to bind `127.0.0.1:5173` in this sandbox.
- A sandboxed `curl` check could not reach the escalated dev server, but Vite reported it ready at `http://127.0.0.1:5173/`.

### Verification

- install: ok — `pnpm install`
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build`
- tests: ok — `pnpm -r --if-present test` ran 4 files / 11 tests, 0 failed
- demo server: started — `pnpm --dir apps/demo exec vite --host 127.0.0.1 --port 5173`

## Stage 2 Follow-up — Dashboard i18n JSON Resources

**Completed:** 2026-05-08 18:52 CST

### Files touched

- `packages/ai-dashboard-runtime/src/i18n-runtime.ts` — adds nested JSON-compatible `LocaleMessages`, deep merge, and dot-path fallback lookup.
- `packages/ai-dashboard-runtime/src/renderer-adapter.ts` — types runtime `messages` through the shared locale message contract.
- `packages/ai-dashboard-runtime/src/__tests__/i18n-runtime.test.ts` — covers dashboard message merge and translator lookup.
- `apps/demo/src/dashboards/cluster-overview.ts` — uses dashboard-namespaced i18n keys.
- `apps/demo/src/dashboards/cluster-overview.i18n/*` — adds per-locale dashboard JSON resources.
- `apps/demo/src/i18n/messages.ts` — merges project messages with dashboard messages.
- `apps/demo/src/App.vue` — reuses runtime translator for the demo header.
- `packages/ai-dashboard-schema/src/__fixtures__/cluster-overview.ts` — aligns fixture keys with the dashboard namespace convention.
- `tsconfig.base.json` — enables JSON module imports for dashboard locale resources.
- `doc.md`, `requirements.md`, `architecture.md` — document the config-plus-locale-resource packaging contract.

### Decisions made during implementation

- Keep dashboard locale resources adjacent to the dashboard config under `<dashboard>.i18n/`.
- Support nested vue-i18n-style JSON objects, not only flat string maps, because the referenced host locale loader builds nested message objects from JSON files.
- Keep generated keys under the dashboard namespace to reduce merge collisions with project messages.

### Deviations from architecture.md

- None. The architecture was updated to make the i18n resource packaging contract explicit.

### Adjacent issues noticed (NOT fixed here)

- None.

### Verification

- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build`
- tests: ok — `pnpm -r --if-present test` ran 5 files / 13 tests, 0 failed

## Stage 3 Pre-Stage Notes

### Sanity Check

- Stage 2 and the dashboard i18n follow-up are complete.
- `packages/ai-dashboard-echarts-vue` does not exist yet.
- The demo dashboard currently proves a single non-ECharts widget and mocked SDK dataSource.
- The architecture expects Stage 3 to add `LineChart`, `GaugeChart`, `DonutChart`, ECharts widget metadata, ECharts locale/theme adapter, and demo dashboard updates.

### Assumptions

- Implement only the Stage 3 chart set from `architecture.md`: `LineChart`, `GaugeChart`, and `DonutChart`. `BarChart` and other chart breadth remain later work from `doc.md`, not this staged slice.
- Use `echarts` `^5.5.1` and `vue-echarts` `^6.7.3`, matching Vue 3.3.x and the ECharts 5 integration pattern.
- Keep chart components presentation-only. Data remains loaded and normalized by registered dataSources.
- Use ECharts core imports and `vue-echarts` `VChart` instead of importing all of ECharts globally.
- Use dashboard-namespaced i18n keys in the demo chart titles and keep locale-dependent pod status labels in the mocked dataSource transform.

## Stage 3 — Vue ECharts Widget Slice

**Completed:** 2026-05-09 09:50 CST

### Files touched

- `packages/ai-dashboard-echarts-vue/package.json` — adds the Vue ECharts package and dependencies.
- `packages/ai-dashboard-echarts-vue/tsconfig.json` — typecheck config for the chart package.
- `packages/ai-dashboard-echarts-vue/tsconfig.build.json` — declaration build config against built workspace packages.
- `packages/ai-dashboard-echarts-vue/vite.config.ts` — library build config for the chart package.
- `packages/ai-dashboard-echarts-vue/src/register-echarts.ts` — registers the ECharts core renderer, chart types, and components used by this slice.
- `packages/ai-dashboard-echarts-vue/src/echarts-adapter.ts` — adds ECharts init, locale normalization, palette, text, and axis adapters.
- `packages/ai-dashboard-echarts-vue/src/schemas.ts` — adds data and props schemas for line, gauge, and donut charts.
- `packages/ai-dashboard-echarts-vue/src/LineChart.vue` — adds the trend chart component.
- `packages/ai-dashboard-echarts-vue/src/GaugeChart.vue` — adds the bounded metric chart component.
- `packages/ai-dashboard-echarts-vue/src/DonutChart.vue` — adds the category distribution chart component.
- `packages/ai-dashboard-echarts-vue/src/option-utils.ts` — adds shared field reading and value formatting helpers.
- `packages/ai-dashboard-echarts-vue/src/echarts-widgets.ts` — exports widget definitions and metadata.
- `packages/ai-dashboard-echarts-vue/src/index.ts` — exports the public chart package API.
- `apps/demo/package.json` — depends on the chart package.
- `apps/demo/src/mock-sdk.ts` — adds mocked CPU trend and pod status SDK methods.
- `apps/demo/src/data-sources/cluster.ts` — registers chart-compatible dataSources.
- `apps/demo/src/dashboards/cluster-overview.ts` — renders GaugeChart, LineChart, and DonutChart from config.
- `apps/demo/src/dashboards/cluster-overview.i18n/*` — adds chart title messages.
- `apps/demo/src/widgets/index.ts` — merges chart widgets into the demo widget registry.
- `packages/ai-dashboard-vue/vite.config.ts` — preserves emitted declarations during library builds.
- `tsconfig.base.json` — adds the chart package path alias.
- `pnpm-lock.yaml` — locks the new ECharts dependencies.

### Decisions made during implementation

- The chart props schemas keep defaults, while the exported props types describe DashboardConfig input shape. Components still apply explicit fallbacks so authored configs can omit defaulted fields.
- ECharts options may contain formatter functions authored by the package code, but dashboard config still cannot inject executable option functions.
- The demo keeps the Stage 2 `MetricValue` widget registered, but the dashboard config now uses the Stage 3 chart widgets.
- Vite package builds now set `emptyOutDir: false` so `vue-tsc` declaration output is not deleted by the subsequent Vite bundle step.

### Deviations from architecture.md

- None.

### Adjacent issues noticed (NOT fixed here)

- `pnpm install` warns that `vue-demi` and `vue-echarts` build scripts are ignored. Current typecheck/build/test verification passes without approving them.
- Demo production build warns that the generated JS chunk is larger than 500 kB after adding ECharts. This is expected for the MVP chart engine and can be addressed later with code splitting if needed.

### Verification

- install: ok — `pnpm install`
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- tests: ok — `pnpm -r --if-present test` ran 5 files / 13 tests, 0 failed
- whitespace: ok — `git diff --check`

## Stage 3 Follow-up — ECharts Nonzero Container Init

**Completed:** 2026-05-09 09:55 CST

### Files touched

- `packages/ai-dashboard-echarts-vue/src/EchartsContainer.vue` — delays `VChart` mount until its container reports nonzero width and height.
- `packages/ai-dashboard-echarts-vue/src/LineChart.vue` — renders through the guarded ECharts container.
- `packages/ai-dashboard-echarts-vue/src/GaugeChart.vue` — renders through the guarded ECharts container.
- `packages/ai-dashboard-echarts-vue/src/DonutChart.vue` — renders through the guarded ECharts container.
- `packages/ai-dashboard-echarts-vue/src/index.ts` — exports the guarded container.
- `packages/ai-dashboard-vue/src/WidgetShell.vue` — makes the widget body a flex, overflow-hidden sizing context for chart children.
- `packages/ai-dashboard-vue/package.json` — exports package CSS for consumers that use built package output.
- `packages/ai-dashboard-echarts-vue/package.json` — exports package CSS for consumers that use built package output.
- `apps/demo/vite.config.ts` — aliases workspace packages to source during demo development so Vue SFC styles are injected.

### Decisions made during implementation

- Fix the root cause at the chart mount boundary instead of suppressing the ECharts warning. `VChart` now mounts only after `ResizeObserver` or the first animation frame confirms a nonzero container.
- Keep the guard inside the ECharts package so non-chart widgets do not inherit chart-specific lifecycle behavior.
- Playwright showed the initial blank UI was caused by the demo resolving built package JS without loading package CSS; `.dao-widget-shell` was `display: block` / `position: static`, so chart bodies had height `0`.
- The demo now resolves workspace package source files in Vite dev/build, while package consumers can import `@dao-style-viz/ai-dashboard-vue/style.css` and `@dao-style-viz/ai-dashboard-echarts-vue/style.css`.

### Deviations from architecture.md

- None.

### Adjacent issues noticed (NOT fixed here)

- Playwright console still reports only a missing `favicon.ico` 404 from the demo app.

### Verification

- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- tests: ok — `pnpm -r --if-present test` ran 5 files / 13 tests, 0 failed
- Playwright: ok — dashboard renders charts; measured chart canvases have nonzero width and height
- whitespace: ok — `git diff --check`

## Stage 4 Planning Follow-up — Optional mcp-echarts Assist

**Completed:** 2026-05-09 10:14 CST

### Files touched

- `docs/mcp-echarts.md` — documents optional MCP server config, use cases, data boundary, and output handling.
- `.idea-to-ship/ai-dashboard-builder/requirements.md` — records `mcp-echarts` as generation-time assistance, not a runtime or validation bypass.
- `.idea-to-ship/ai-dashboard-builder/architecture.md` — adds the optional `mcp-echarts` flow and Stage 4 adapter boundary.
- `doc.md` — updates the source design with MCP-assisted ECharts preview/validation rules.

### Decisions made during implementation

- Treat `mcp-echarts` as optional generator tooling. It can produce option/image preview and validation feedback, but final artifacts still pass DashboardConfig schema, registry compatibility checks, generated chart sandbox, and human review.
- Do not add `mcp-echarts` as a runtime dependency. Local MCP clients can run it via `npx -y mcp-echarts`; managed workflows can use SSE/streamable transport behind a generator adapter.
- Restrict MCP inputs to catalog metadata and sample/mock/aggregated data.

### Deviations from architecture.md

- None. This updates the architecture before the Stage 4 implementation.

### Verification

- docs/config: ok — source docs, requirements, and architecture agree on the MCP boundary

## Stage 4 Pre-Stage Notes

### Sanity Check

- Stage 3 renders the Vue ECharts demo after the chart container sizing and CSS resolution fixes.
- The optional `mcp-echarts` boundary is documented as generation-time assistance only.
- `packages/ai-dashboard-ai-catalog` does not exist yet, and the demo does not expose catalog exports or a config validation gate.

### Assumptions

- Use a narrow custom Zod schema summarizer instead of a full JSON Schema converter for the MVP catalog. The catalog only needs AI-readable constraints, not a complete validator replacement.
- Config validation should run after `DashboardConfig` schema parsing and before runtime rendering.
- Static `params` can be checked against dataSource schemas immediately; params containing `$ref` are deferred to runtime because their final values depend on route, locale, filters, and context.
- Enforce i18n key objects for user-facing text in AI-generated config by default. Trusted hand-written config can opt out with `requireI18nKeys: false` if needed.

## Stage 4 — AI Catalog + Config Validation Gate

**Completed:** 2026-05-09 10:46 CST

### Files touched

- `packages/ai-dashboard-ai-catalog/package.json` — adds the AI catalog package.
- `packages/ai-dashboard-ai-catalog/tsconfig.json` — package typecheck config.
- `packages/ai-dashboard-ai-catalog/tsconfig.build.json` — declaration/build config against built workspace packages.
- `packages/ai-dashboard-ai-catalog/src/schema-summary.ts` — converts Zod schemas into JSON-safe summaries for AI prompts.
- `packages/ai-dashboard-ai-catalog/src/create-data-source-catalog.ts` — exports dataSource metadata without `query`.
- `packages/ai-dashboard-ai-catalog/src/create-widget-catalog.ts` — exports widget metadata without Vue components or renderer implementation.
- `packages/ai-dashboard-ai-catalog/src/validate-dashboard-config.ts` — validates config against registered widgets, dataSources, layout bounds, i18n rules, props schemas, static params, compatibility, and refresh minimums.
- `packages/ai-dashboard-ai-catalog/src/prompt-templates.ts` — adds dashboard plan, DashboardConfig, and chart component prompt templates with the `mcp-echarts` boundary.
- `packages/ai-dashboard-ai-catalog/src/index.ts` — exports the package API.
- `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` — covers catalog stripping and validation failures.
- `apps/demo/src/catalog.ts` — exports demo dataSource/widget catalogs and validation result.
- `apps/demo/package.json` — depends on the catalog package.
- `apps/demo/vite.config.ts` — aliases the catalog package source for demo development.
- `tsconfig.base.json` — adds the catalog package path alias.
- `pnpm-lock.yaml` — locks the catalog package workspace entry.

### Decisions made during implementation

- Keep catalog exports JSON-safe and metadata-only. DataSource `query` functions and widget `component` references are omitted by construction.
- Keep prompt templates in the catalog package for now because they depend directly on catalog shape and validation rules. A model-backed generator package can import or move them later.
- Validate AI output against both the schema package and live registries so unknown widget/dataSource keys fail before runtime.
- Reject interval refresh below `5000ms` by default, matching the requirements and architecture assumptions.
- Treat `mcp-echarts` output as preview evidence in prompts; it still maps back to registered widget props or generated chart package files before platform gates.

### Deviations from architecture.md

- The MVP schema summarizer is intentionally narrower than complete JSON Schema generation. This is enough for prompt/catalog use and avoids overpromising validator-grade schema fidelity.

### Adjacent issues noticed (NOT fixed here)

- Zod internals are inspected in the schema summarizer. That is acceptable for the first catalog slice but should be replaced or hardened if catalog schema fidelity becomes a public contract.
- Runtime-level validation for `$ref`-resolved params remains in the data loader; the catalog validation gate only checks static params that contain no refs.

### Verification

- install: ok — `pnpm install`
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- tests: ok — `pnpm -r --if-present test` ran 7 files / 17 tests, 0 failed
- whitespace: ok — `git diff --check`

## Stage 4 Follow-up — Full Template Playground Host

**Completed:** 2026-05-09 10:53 CST

### Files touched

- `playground/playground-ui/` — generated standalone app from `@dao-style/cli@0.4.1` full template with `@dao-style/core`, `@dao-style/extend`, and `@dao-style/biz`.
- `.idea-to-ship/ai-dashboard-builder/requirements.md` — records the full-template playground as the realistic host-app integration surface.
- `.idea-to-ship/ai-dashboard-builder/architecture.md` — records the playground as a standalone host app outside the root pnpm workspace.
- `doc.md` — documents the playground in the source design and MVP plan.

### Decisions made during implementation

- Keep the generated app under `playground/playground-ui` instead of `apps/playground-ui` so it does not become part of the root workspace's `apps/*` package set.
- Remove the generated nested `.git` directory so the app remains part of this repository's working tree.
- Install playground dependencies with `CI=true pnpm --dir playground/playground-ui install --ignore-workspace` because the CLI-generated postinstall/prepare hooks assume a standalone app.
- Preserve the generated `src/plugins/vue-i18n` structure as the realistic host locale integration reference.

### Deviations from architecture.md

- Product integration scaffolding starts earlier than Stage 8 because the full-template host app is useful for validating package ergonomics before the later product-style example is complete.

### Adjacent issues noticed (NOT fixed here)

- `@dao-style/cli create` initially failed its automatic install when run inside this root workspace because the workspace Node engine check conflicted with the npx process. A standalone `pnpm --dir ... install --ignore-workspace` with `CI=true` succeeded.
- The playground build emits CSS warnings about `input-placeholder` pseudo-class syntax from the generated template/dependencies. The build still succeeds.

### Verification

- playground install: ok — `CI=true pnpm --dir playground/playground-ui install --ignore-workspace`
- playground build: ok — `pnpm --dir playground/playground-ui run build` with non-blocking generated CSS warnings
- whitespace: ok — `git diff --check`

## Stage 5 Pre-Stage Notes

### Sanity Check

- Stage 4 and the full-template playground follow-up are complete.
- `packages/ai-dashboard-runtime/src/event-dispatcher.ts` maps configured widget events, but `event.payload.*` refs are not yet part of the ref root and `refreshWidget` targets are not validated.
- `packages/ai-dashboard-vue/src/BigScreenRuntime.vue` applies `setFilter` events and forwards runtime events, but it does not route `refreshWidget` events back to target widget renderers.
- `packages/ai-dashboard-vue/src/WidgetRenderer.vue` reloads on widget/runtime changes and aborts previous requests, but the async guard reads the mutable controller reference after newer loads can replace it.
- `createRuntimeContext` resolves refs directly and does not detect config ref cycles before widgets start dataSource queries.
- `validateDashboardConfig` checks catalog, i18n, layout, props, static params, and refresh minimums, but it does not validate event targets or config ref cycles.

### Assumptions

- Keep Stage 5 inside the existing schema/runtime/Vue/catalog packages; do not add new packages or change public package names.
- Preserve the current `WidgetRuntimeEvent` union. `refreshWidget` remains a targeted reload signal and does not carry custom payload yet.
- Validate `refreshWidget.target` against dashboard widget ids in the AI catalog gate and again at runtime for trusted configs that bypass validation.
- Add `event.payload` to the `$ref` root for event dispatch; continue to resolve event payloads through the existing `$ref` resolver rather than adding an expression engine.
- Detect cycles in `context.*` refs and disallow `globalFilters.*` refs that point back into `context.*`, because the architecture says global filters resolve before context.
- Keep locale-change reload behavior conservative: widgets reload when runtime context changes, and dataSources that declare `dependsOnLocale` or params that reference locale continue to be covered by that runtime change.

## Stage 5 — Runtime Event + Refresh Hardening

**Completed:** 2026-05-09 12:33 CST

### Files touched

- `packages/ai-dashboard-runtime/src/errors.ts` — adds a typed ref-cycle runtime error.
- `packages/ai-dashboard-runtime/src/ref-resolver.ts` — exposes ref collection/segment helpers and includes `event.payload` in event ref resolution.
- `packages/ai-dashboard-runtime/src/runtime-context.ts` — resolves context refs through other context keys and fails cycles before widget queries start.
- `packages/ai-dashboard-runtime/src/event-dispatcher.ts` — validates targeted `refreshWidget` events when known widget ids are supplied.
- `packages/ai-dashboard-runtime/src/__tests__/event-dispatcher.test.ts` — covers event payload refs and unknown refresh targets.
- `packages/ai-dashboard-runtime/src/__tests__/runtime-context.test.ts` — covers context ref chaining, cycle failures, and globalFilter back-ref rejection.
- `packages/ai-dashboard-vue/package.json` — adds the Vue package test script and package-local Zod dev dependency for test schemas.
- `packages/ai-dashboard-vue/src/BigScreenRuntime.vue` — routes `refreshWidget` runtime events to target widget reload keys.
- `packages/ai-dashboard-vue/src/WidgetRenderer.vue` — reloads on targeted refresh keys, validates event dispatch against known widget ids, and guards stale aborted requests.
- `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts` — covers targeted refresh routing and locale-param reload behavior.
- `packages/ai-dashboard-ai-catalog/src/validate-dashboard-config.ts` — rejects unknown refresh targets, invalid config refs, and context ref cycles in the AI validation gate.
- `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` — covers event-target and ref-cycle validation failures.
- `pnpm-lock.yaml` — records the Vue package test-only Zod dependency.
- `.idea-to-ship/ai-dashboard-builder/implementation-log.md` — records Stage 5 assumptions and completion.

### Decisions made during implementation

- Keep `refreshWidget` as a reload signal with the existing `WidgetRuntimeEvent` shape; custom refresh payloads remain future work.
- Resolve `event.payload.*` through the existing `$ref` resolver so event handling stays declarative and does not introduce an expression engine.
- Validate refresh targets in both catalog validation and runtime dispatch. Catalog validation catches AI output early; runtime dispatch gives trusted configs a widget-level failure if they bypass the gate.
- Validate `setFilter` event payload shape in the catalog gate so malformed AI output fails before user interaction.
- Keep the small ref-walk helper local in the catalog validator so catalog tests do not depend on built runtime output order.
- Add focused package tests for the Stage 5 behavioral contract because the stage explicitly calls out event/ref validation coverage.

### Deviations from architecture.md

- None.

### Adjacent issues noticed (NOT fixed here)

- Demo production build still emits the expected ECharts chunk-size warning.

### Verification

- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- tests: ok — `pnpm -r --if-present test` ran 9 files / 27 tests, 0 failed
- whitespace: ok — `git diff --check`

## Stage 6 Pre-Stage Notes

### Sanity Check

- Stage 5 is complete and the worktree is clean before Stage 6 starts.
- `packages/ai-dashboard-widgets` does not exist yet.
- `packages/ai-dashboard-echarts-vue` currently provides `LineChart`, `GaugeChart`, and `DonutChart`; Stage 6 expects the remaining MVP chart types.
- `packages/ai-dashboard-ai-catalog` exports dataSource/widget catalogs and config validation, but not theme, layout, or i18n catalog helpers.
- The Vue renderer currently treats widgets without data bindings as empty. Stage 6 basic filter/layout widgets need no dataSource, so the renderer needs to render data-less widgets instead of forcing an empty state.

### Assumptions

- Keep Stage 6 as one stage, but implement the narrowest useful version of each required widget/chart/catalog item.
- Add `@dao-style-viz/ai-dashboard-widgets` as a Vue widget package with the same Vite/vue-tsc pattern as `ai-dashboard-vue` and `ai-dashboard-echarts-vue`.
- Basic widgets are presentation/control widgets only; they do not fetch data or own business behavior. Control widgets emit standard widget events and dashboard config decides how those events map to filters or host events.
- Reuse existing ECharts option helpers and schemas where possible. Stage 6 adds chart breadth, not a full BI chart grammar.
- MapChart will render coordinate data on an ECharts coordinate plane instead of bundling map geojson. Product hosts can provide richer map layers in a later generated/sandboxed chart path.
- Theme, layout, and i18n catalog exports are static JSON-safe metadata helpers for AI prompts; they do not change runtime theming or layout semantics in this stage.

## Stage 6 — Chart + Basic Widget Coverage

**Completed:** 2026-05-09 13:09 CST

### Files touched

- `packages/ai-dashboard-widgets/*` — adds the basic Vue widget package, build config, schemas, registry, tests, and components for panels, metrics, status, rankings, tables, alarms, filters, and time range controls.
- `packages/ai-dashboard-echarts-vue/src/*` — adds Bar, Area, Pie, Radar, Heatmap, Scatter, Funnel, and Map chart components, schemas, exports, registry metadata, option tests, and ECharts registration.
- `packages/ai-dashboard-ai-catalog/src/create-theme-catalog.ts` — adds a JSON-safe default theme catalog helper.
- `packages/ai-dashboard-ai-catalog/src/create-layout-catalog.ts` — adds a JSON-safe layout pattern catalog helper.
- `packages/ai-dashboard-ai-catalog/src/create-i18n-catalog.ts` — adds a JSON-safe locale/key catalog helper.
- `packages/ai-dashboard-ai-catalog/src/index.ts`, `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` — exports and tests the new catalog helpers.
- `packages/ai-dashboard-vue/src/WidgetRenderer.vue` — renders widgets without data bindings instead of forcing an empty state.
- `apps/demo/package.json`, `apps/demo/vite.config.ts`, `apps/demo/src/widgets/index.ts` — wires the basic widget registry into the demo source aliases and package dependencies.
- `tsconfig.base.json` — adds the basic widget package path alias.
- `pnpm-lock.yaml` — records the workspace package dependency updates.
- `.idea-to-ship/ai-dashboard-builder/implementation-log.md` — records Stage 6 assumptions and completion.

### Decisions made during implementation

- Keep `@dao-style-viz/ai-dashboard-widgets` as a separate Vue package so non-chart widgets can evolve independently from ECharts integrations.
- Treat filter and time range widgets as event emitters only. Dashboard config still owns how emitted payloads map to `setFilter`, `refreshWidget`, or host events.
- Let data-less widgets render by passing `undefined` data through to components. Empty-state behavior remains for widgets that declare a data binding and receive no result rows/value.
- Put static Panel content, FilterBar options, and TimeRangePicker options in props as well as optional data so layout/filter widgets can work without a dataSource.
- Reuse the existing ECharts container, adapter, and option merge helpers so new chart components stay thin and registry-backed.
- Add theme, layout, and i18n catalogs as static metadata helpers for generation prompts; runtime styling and layout behavior remain governed by existing dashboard config.

### Deviations from architecture.md

- `MapChart` renders coordinate points on an ECharts x/y coordinate plane and does not bundle map geojson or provide choropleth layers. Rich geo maps should be handled by host-supplied assets or the later generated chart sandbox path.

### Adjacent issues noticed (NOT fixed here)

- The demo production build still emits the expected ECharts bundle-size warning, now at about `821.42 kB` for the main JS chunk.
- The new chart/widget registries increase demo bundle breadth because the demo imports the full registry eagerly. A later product slice may want lazy widget loading.

### Verification

- install: ok — `pnpm install`
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- tests: ok — `pnpm -r --if-present test` ran 11 files / 42 tests, 0 failed
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- whitespace: ok — `git diff --check`

## Stage 7 Pre-Stage Notes

### Sanity Check

- Stage 6 is complete and the worktree is clean before Stage 7 starts.
- `packages/ai-dashboard-sandbox` does not exist yet.
- The architecture calls for a generated chart package schema, dependency allowlist, AST safety scan, type/lint/build hooks, iframe preview contract, fixture tests, and a disabled-by-default generated registry.
- The open architecture questions still defer exact CSP and UI-hosted `postMessage` details. Stage 7 should therefore define a preview contract and gate helpers, not build a full management UI.

### Assumptions

- Add `@dao-style-viz/ai-dashboard-sandbox` as a framework-neutral TypeScript package. It validates generated Vue chart package artifacts but does not render them in the main runtime.
- Represent generated chart files as an in-memory file map for the gate. This keeps tests deterministic and avoids executing arbitrary generated code.
- Implement AST scanning with the existing TypeScript compiler API instead of adding a new parser dependency.
- Treat typecheck, lint, and bundle build as hook command contracts plus result aggregation. Stage 7 defines the commands and validation result shape; a host/CLI can execute them in a controlled process.
- Keep the generated widget registry disabled by default. A caller must explicitly pass human approval and a completed approval-gate result before generated widgets are exposed.
- Define iframe preview as a serializable contract with sandbox attributes, sample data, and a strict message envelope. Exact CSP strings and UI wiring remain product-host decisions.

## Stage 7 — Generated Chart Sandbox Gate

**Completed:** 2026-05-09 13:23 CST

### Files touched

- `packages/ai-dashboard-sandbox/package.json` — adds the sandbox package scripts and runtime dependencies.
- `packages/ai-dashboard-sandbox/tsconfig.json`, `packages/ai-dashboard-sandbox/tsconfig.build.json` — add package typecheck/build config.
- `packages/ai-dashboard-sandbox/src/schemas.ts` — defines strict generated chart manifest, package.json, file map, and package Zod schemas.
- `packages/ai-dashboard-sandbox/src/dependency-allowlist.ts` — checks manifest/package dependencies against an explicit allowlist.
- `packages/ai-dashboard-sandbox/src/ast-scan.ts` — scans generated TypeScript, Vue script blocks, and Vue template expressions for forbidden imports, dynamic import, and forbidden browser/network APIs.
- `packages/ai-dashboard-sandbox/src/hooks.ts` — defines typecheck, lint, and bundle build hook command contracts plus result aggregation.
- `packages/ai-dashboard-sandbox/src/preview-contract.ts` — defines iframe preview sandbox attributes and strict preview message schemas.
- `packages/ai-dashboard-sandbox/src/gate.ts` — combines schema validation, required-file checks, dependency scan, AST scan, hook plan creation, and preview contract generation.
- `packages/ai-dashboard-sandbox/src/generated-registry.ts` — adds a disabled-by-default generated widget registry gate requiring validation and approval.
- `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts` — covers allowed and blocked generated chart fixtures, hook/preview contracts, and registry approval behavior.
- `packages/ai-dashboard-sandbox/src/index.ts` — exports the sandbox package API.
- `tsconfig.base.json` — adds the sandbox package path alias.
- `pnpm-lock.yaml` — records the new workspace package.
- `.idea-to-ship/ai-dashboard-builder/implementation-log.md` — records Stage 7 assumptions and completion.

### Decisions made during implementation

- Keep validation in-process and deterministic. The gate accepts an in-memory generated package file map and does not execute arbitrary generated code.
- Use TypeScript's compiler API for AST safety scanning. This avoids adding a parser dependency and supports `.ts` plus Vue SFC script blocks.
- Scan Vue template expressions as generated code too. Template event handlers and bindings can execute browser/network APIs just like `<script>` blocks.
- Keep generated package schemas strict so lifecycle scripts such as `postinstall` fail validation instead of being silently stripped.
- Allow subpath imports from allowlisted packages, such as `echarts/charts`, by normalizing imports to package names before checking the allowlist.
- Reject generated package `devDependencies` by default. The host sandbox should supply toolchain binaries instead of letting generated packages choose arbitrary tooling.
- Represent typecheck, lint, and build as command hooks, not direct subprocess execution. This keeps the package usable from either a CLI or a management UI host.
- Keep generated widget registration opt-in. Disabled returns an empty registry; enabled registration requires explicit human approval, a passing validation gate, and a completed approval-gate result that includes hook and preview status.

### Deviations from architecture.md

- Stage 7 defines an iframe preview contract and message envelope but does not implement a concrete preview frame UI. The architecture's CSP and `postMessage` protocol details are still open questions, so the product host should own the final UI wiring.
- Stage 7 defines type/lint/build hooks but does not execute them inside `validateGeneratedChartPackage`. Hook execution must happen in a controlled host/CLI process and feed results into `evaluateGeneratedChartApprovalGate`.

### Adjacent issues noticed (NOT fixed here)

- Exact CSP policy, preview origin checks, and management UI review flow remain undecided architecture questions.
- The demo production build still emits the expected ECharts bundle-size warning at about `821.42 kB` for the main JS chunk.

### Verification

- install: ok — `pnpm install`
- sandbox typecheck/lint/test/build: ok — package-local checks passed
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- tests: ok — `pnpm -r --if-present test` ran 12 files / 55 tests, 0 failed
- build: ok — `pnpm -r --if-present build` with the expected ECharts bundle-size warning in the demo app
- whitespace: ok — `git diff --check`

## Stage 8 Pre-Stage Notes

### Sanity Check

- Stage 7 is complete and review fixes are staged. There are no unrelated unstaged implementation changes before Stage 8 starts.
- `apps/demo` proves the runtime with mock SDK data, but it is still a demo surface rather than a product-style integration tree.
- The standalone `playground/playground-ui` host exists outside the root workspace, but it does not yet contain the dashboard product integration example.
- The architecture expects a product-style example tree with real-world dataSource file layout, proto generated SDK wrapper shape, dashboard config, dashboard-owned i18n messages, host screen integration, and package CSS imports.

### Assumptions

- Add `apps/product-integration` as a root workspace app so the product-style integration compiles under the same `pnpm -r` verification path.
- Consume dashboard packages as workspace package dependencies without Vite source aliases. This better represents a product host consuming built package exports and makes package CSS imports explicit.
- Use a local `src/product-sdk/generated/*` folder to model proto generated TypeScript SDK static service methods. It remains mocked data, but the call shape matches generated static methods.
- Keep the product example focused on one tenant capacity screen with dashboard-owned locale JSON resources, dataSource wrappers, widget registry, config validation, and host runtime wiring.
- Do not integrate the dashboard into `playground/playground-ui` in Stage 8. The generated full-template app remains the external host reference, while this stage adds a smaller product-style workspace app that is easy to typecheck/build.

## Stage 8 — Product Integration Example

**Completed:** 2026-05-09 13:41 CST

### Files touched

- `apps/product-integration/package.json` — adds the product-style workspace app scripts and dashboard package dependencies.
- `apps/product-integration/tsconfig.json`, `apps/product-integration/vite.config.ts`, `apps/product-integration/index.html` — add product app TypeScript and Vite wiring.
- `apps/product-integration/src/main.ts`, `apps/product-integration/src/App.vue`, `apps/product-integration/src/style.css`, `apps/product-integration/src/env.d.ts` — add app entry, package CSS imports, and host page baseline styles.
- `apps/product-integration/src/product-sdk/generated/tenant-capacity.ts` — models proto generated static SDK service methods and request/response types.
- `apps/product-integration/src/data-sources/tenant-capacity.ts` — wraps generated SDK static methods with `createSdkDataSource`.
- `apps/product-integration/src/dashboards/tenant-capacity.ts` — adds the product dashboard config with filters, metrics, alert list, and chart widgets.
- `apps/product-integration/src/dashboards/tenant-capacity.i18n/*` — adds dashboard-owned English and Chinese locale resources.
- `apps/product-integration/src/i18n/messages.ts` — merges host product messages with dashboard-owned locale messages.
- `apps/product-integration/src/widgets/index.ts` — registers ECharts and basic widget packages for the product host.
- `apps/product-integration/src/dashboard-validation.ts` — runs the product dashboard through the catalog validation gate.
- `apps/product-integration/src/screens/TenantCapacityScreen.vue` — adds the host screen integration with runtime route context and locale switching.
- `apps/product-integration/src/__tests__/tenant-capacity.test.ts` — verifies catalog validation, dataSource SDK wrapper output, and locale merge behavior.
- `pnpm-lock.yaml` — records the new workspace app dependencies.
- `.idea-to-ship/ai-dashboard-builder/implementation-log.md` — records Stage 8 assumptions and completion.

### Decisions made during implementation

- Keep the product example as a workspace app so root verification covers the integration without modifying the standalone generated playground.
- Consume package exports directly rather than Vite source aliases. This better matches product usage and exercises built package CSS exports.
- Use dashboard-owned locale JSON adjacent to the dashboard config and merge it into host product messages before passing runtime messages into `BigScreenRuntime`.
- Use `validateDashboardConfig` in the product app so registry/dataSource/layout/i18n issues surface before runtime rendering.
- Add a focused smoke test despite this being an implementation stage because Stage 8's value is proving integration wiring, not just compiling source files.
- Keep visible widget text that comes through widget `data` locale-aware at the product dataSource layer. This avoids adding product-specific i18n behavior to generic widget prop schemas while still proving locale-sensitive MetricCard, Panel, FilterBar, and AlarmList output.
- Let namespace filter changes update `globalFilters.namespace` only. The runtime reloads data-bound widgets from the filter change, so an extra `refreshWidget` action would duplicate the target chart reload.

### Deviations from architecture.md

- None. The product-style tree is implemented as `apps/product-integration` rather than inside `playground/playground-ui`; this matches the pre-stage assumption and keeps the generated full-template host untouched.

### Adjacent issues noticed (NOT fixed here)

- Both demo and product integration production builds emit the expected ECharts bundle-size warning. Product integration main JS is about `887.52 kB`.
- The product example uses mocked SDK responses with real generated-SDK call shape. A real product repo still needs to replace `src/product-sdk/generated/*` with generated service imports.

### Verification

- install: ok — `pnpm install`
- product app typecheck/lint/test/build: ok — package-local checks passed
- typecheck: ok — `pnpm -r --if-present typecheck`
- lint: ok — `pnpm -r --if-present lint`
- tests: ok — `pnpm -r --if-present test` ran 13 files / 59 tests, 0 failed
- build: ok — `pnpm -r --if-present build` with expected ECharts bundle-size warnings in demo and product integration apps
- whitespace: ok — `git diff --check`
- dev server: started — `http://127.0.0.1:5174/`
