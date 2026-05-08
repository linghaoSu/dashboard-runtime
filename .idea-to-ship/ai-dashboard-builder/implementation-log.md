# Implementation Log — ai-dashboard-builder

**Architecture:** architecture.md
**Started:** 2026-05-08

## Stage Status

- [x] Stage 1 — Workspace + Schema Contracts
- [x] Stage 2 — Runtime + Vue Tracer Bullet
- [ ] Stage 3 — Vue ECharts Widget Slice
- [ ] Stage 4 — AI Catalog + Config Validation Gate
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
