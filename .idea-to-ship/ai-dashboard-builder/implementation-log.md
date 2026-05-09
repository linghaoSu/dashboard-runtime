# Implementation Log — ai-dashboard-builder

**Architecture:** architecture.md
**Started:** 2026-05-08

## Stage Status

- [x] Stage 1 — Workspace + Schema Contracts
- [x] Stage 2 — Runtime + Vue Tracer Bullet
- [x] Stage 3 — Vue ECharts Widget Slice
- [x] Stage 4 — AI Catalog + Config Validation Gate
- [ ] Stage 5 — Runtime Event + Refresh Hardening
- [ ] Stage 6 — Basic Widgets Extraction
- [ ] Stage 7 — Generated Chart Sandbox Gate
- [ ] Stage 8 — Product Integration Example

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
