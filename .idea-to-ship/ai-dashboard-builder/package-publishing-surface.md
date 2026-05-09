# Package Publishing Surface - AI Dashboard Builder v0.1

**Date:** 2026-05-09 16:04 CST
**Roadmap Item:** ITS-ai-dashboard-builder-010
**Owner:** Frontend platform team
**Decision Owner:** Platform lead
**Current Verdict:** Prepared for internal source and tarball evaluation; not ready for registry publishing

## Decision

Keep v0.1 on the approved source/commit consumption model. The package surface is now reviewed enough for internal package tarball QA, but registry publishing remains blocked until a later release decision removes `private: true`, defines peer dependency policy, and runs a clean external consumer install.

This preserves the v0.1 release gate boundary: product frontend engineers can adopt from the workspace and product integration guide, while the platform team has a concrete package checklist for the first publishable candidate.

## Package Matrix

| Package | v0.1 Role | Entry Export | CSS Export | Internal Dependencies | Current Publish Stance |
|---|---|---|---|---|---|
| `@dao-style-viz/ai-dashboard-schema` | DashboardConfig, widget config, i18n schemas | `.` -> `dist/index.js`, `dist/index.d.ts` | None | none | Tarball QA ready; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-runtime` | Framework-neutral runtime contracts and loaders | `.` -> `dist/index.js`, `dist/index.d.ts` | None | schema | Tarball QA ready; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-vue` | Vue 3 runtime adapter and widget shell | `.` -> `dist/index.js`, `dist/index.d.ts` | `./style.css` | runtime, schema | Tarball QA ready; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-widgets` | Basic Vue widgets | `.` -> `dist/index.js`, `dist/index.d.ts` | `./style.css` | runtime, vue | Tarball QA ready after declaration output fix; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-echarts-vue` | ECharts Vue widgets | `.` -> `dist/index.js`, `dist/index.d.ts` | `./style.css` | runtime, vue | Tarball QA ready; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-ai-catalog` | AI-facing catalogs, prompts, config validation | `.` -> `dist/index.js`, `dist/index.d.ts` | None | runtime, schema | Tarball QA ready; registry blocked by `private: true` |
| `@dao-style-viz/ai-dashboard-sandbox` | Generated widget sandbox contracts and gates | `.` -> `dist/index.js`, `dist/index.d.ts` | None | runtime | Tarball QA ready as internal tooling; registry blocked by `private: true` |

Non-publishable workspace projects remain the root workspace, `apps/demo`, `apps/product-integration`, and `playground/playground-ui`.

## Build And Pack Order

The package build must respect internal dependencies:

1. `@dao-style-viz/ai-dashboard-schema`
2. `@dao-style-viz/ai-dashboard-runtime`
3. `@dao-style-viz/ai-dashboard-ai-catalog`, `@dao-style-viz/ai-dashboard-sandbox`, `@dao-style-viz/ai-dashboard-vue`
4. `@dao-style-viz/ai-dashboard-widgets`, `@dao-style-viz/ai-dashboard-echarts-vue`
5. Host apps after packages

The product integration app now runs this package build order through `build:deps` before dev, build, and test. Full workspace verification can still use `pnpm -r --if-present build`, which builds packages before app verification.

## Consumer Import Contract

Vue consumers must import package CSS explicitly from the app entry:

```ts
import "@dao-style-viz/ai-dashboard-vue/style.css";
import "@dao-style-viz/ai-dashboard-echarts-vue/style.css";
import "@dao-style-viz/ai-dashboard-widgets/style.css";
```

Runtime code imports come from package roots only:

```ts
import { BigScreenRuntime } from "@dao-style-viz/ai-dashboard-vue";
import { createTranslator } from "@dao-style-viz/ai-dashboard-runtime";
import { validateDashboardConfig } from "@dao-style-viz/ai-dashboard-ai-catalog";
```

No package currently exposes deep source entrypoints, and product-facing docs should not teach deep imports.

## Pack Evidence

Commands run on 2026-05-09:

```sh
pnpm -r --if-present typecheck
pnpm -r --if-present lint
pnpm -r --if-present test
pnpm -r --if-present build
pnpm --filter @dao-style-viz/ai-dashboard-widgets build
pnpm --filter @dao-style-viz/ai-dashboard-schema pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-runtime pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-vue pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-widgets pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-echarts-vue pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog pack --json --pack-destination /tmp/ai-dashboard-packs
pnpm --filter @dao-style-viz/ai-dashboard-sandbox pack --json --pack-destination /tmp/ai-dashboard-packs
git diff --check
```

Results:

- Workspace typecheck passed.
- Workspace lint passed.
- Workspace tests passed: 13 files / 69 tests.
- Workspace build passed with the existing ECharts chunk-size warnings in demo and product integration.
- All seven package tarballs were created under `/tmp/ai-dashboard-packs`.
- `pnpm pack` rewrote internal `workspace:*` dependencies to `0.1.0` in tarball `package.json` files.
- Tarball `package.json` files still contain `private: true`, which intentionally blocks registry publishing.
- Package contents are constrained by `files: ["dist"]`.
- CSS tarball entries exist for `ai-dashboard-vue`, `ai-dashboard-widgets`, and `ai-dashboard-echarts-vue`.
- `ai-dashboard-widgets` no longer packs nested declaration copies from `ai-dashboard-schema`, `ai-dashboard-runtime`, or `ai-dashboard-vue`.

`npm pack --dry-run --json` was not used because the local npm cache is blocked by an ownership error under `~/.npm/_cacache`. `pnpm pack` is the relevant workspace pack command for this repo and validates the workspace dependency rewrite behavior.

## Fix Applied

`packages/ai-dashboard-widgets/tsconfig.build.json` now mirrors the package-bound declaration strategy used by `ai-dashboard-echarts-vue`:

- `rootDir` is pinned to `src`.
- Internal package type paths point at built `dist/index.d.ts` files for runtime and Vue.

Before this fix, widgets declaration emit could place nested declarations from other workspace packages under `dist/ai-dashboard-*`, polluting the tarball surface.

## Registry Publish Blockers

Do not publish these packages to an internal or public registry until these blockers are closed:

- Decide whether `vue`, `echarts`, and `vue-echarts` remain regular dependencies or move to peer dependencies for registry consumers.
- Remove or override `private: true` only after platform-lead approval.
- Add registry-specific `publishConfig` once the registry target is known.
- Run a clean external consumer install from tarballs or registry packages outside this workspace.
- Run the final release-candidate verification commands from `release-gate.md`.
- Confirm package versioning and changelog/release-note ownership.

## No-Go Conditions

The package surface is not releaseable if any of these happen:

- A package tarball includes source files or unrelated workspace package declarations.
- A Vue package loses its `./style.css` export.
- `pnpm pack` no longer rewrites internal workspace dependencies to concrete versions.
- A host app must import package internals or source paths.
- Product teams are instructed to registry-install v0.1 before a real consumer install has been verified.
