# Code Review — ai-dashboard-builder

**Date:** 2026-05-09
**Reviewer:** Runtime-aware adversarial review agents (Lovelace, Ptolemy, Plato, Bacon) + self-review
**Iterations:** 2
**Result:** clean
**Diff size:** 28 files, +635/-55 before this review artifact update

## Issues Raised & Resolution

| # | Severity | File:line | Issue | Resolution |
|---|---|---|---|---|
| 1 | warning | `packages/ai-dashboard-echarts-vue/src/HeatmapChart.vue:65` | `props.palette` allows one color, but Heatmap read `palette[2]` and `palette[3]`, producing undefined visualMap colors for short palettes. | Added visualMap color fallbacks and a regression test for one-color heatmap palettes. |
| 2 | warning | `packages/ai-dashboard-echarts-vue/src/GaugeChart.vue:39` | Healthy gauges started using the first global chart palette color, bypassing the stable semantic `success` color. | Restored semantic success/warning/danger defaults; only explicit `props.palette` overrides healthy gauge color. Added a regression test. |
| 3 | warning | `packages/ai-dashboard-ai-catalog/src/create-layout-catalog.ts:99` | Layout presets exposed width/height but not required `canvas.scaleMode`, forcing AI output to invent a schema-required field. | Added `scaleMode` to layout catalog canvas metadata for every preset and asserted it in catalog tests. |
| 4 | warning | `apps/product-integration/src/dashboards/tenant-capacity.ts:216` | The namespace chart used a multi-color palette, but single-series BarChart colored by series, so every namespace bar used the first color. | Set single-series BarChart to `colorBy: "data"` and covered it in chart option tests. |
| 5 | warning | `apps/product-integration/src/dashboards/tenant-capacity.ts:35` | Product integration intentionally consumes built package exports, but new strict schema keys could fail if package `dist` was stale when running app-local test/dev/build. | Added `build:deps` plus `pretest`, `prebuild`, and `predev` scripts so app-local workflows refresh dependent package dist before running. |
| 6 | warning | `.idea-to-ship/ai-dashboard-builder/test-plan.md:140` | Release-gate evidence still reported 65 tests after two more regression tests were added. | Updated `test-plan.md`, `release-gate.md`, and `implementation-log.md` to 13 files / 67 tests and current build chunk sizes. |

## Out-of-Scope Issues Skipped

None.

## Design Drift

No unresolved design drift.

The layout execution model remains the accepted fixed canvas plus absolute widget slots and `fit` / `fill` / `scroll` scale modes. The new `docs/design.md` and catalog design evidence document how those layouts should be generated and reviewed without changing runtime layout semantics.

## Test Traceability

Covered by `.idea-to-ship/ai-dashboard-builder/test-plan.md`.

New behavior-changing paths have regression coverage:

- `canvas.colors` / `canvas.chartPalette` schema acceptance and empty-palette rejection.
- Global chart palette propagation and chart-level `props.palette` override.
- Short heatmap palette fallback.
- Gauge semantic status color preservation.
- BarChart data-level coloring for single-series categorical bars.
- Product SDK wrapper failure path.
- DataSource params/output validation failures.

Verification run after fixes:

- `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog test` — 1 file / 8 tests
- `pnpm --filter @dao-style-viz/ai-dashboard-echarts-vue test` — 1 file / 13 tests
- `pnpm --filter @dao-style-viz/product-integration-example test` — prebuild deps + 1 file / 7 tests
- `pnpm -r --if-present typecheck`
- `pnpm -r --if-present lint`
- `pnpm -r --if-present test` — 13 files / 69 tests
- `pnpm -r --if-present build` — expected ECharts chunk-size warnings in demo and product integration apps
- `git diff --check`

## Residual Open Issues

None for this review.

Known non-blocking release-gate warnings remain documented in `release-gate.md`: ECharts app chunk-size warnings and standalone playground CSS pseudo-class warnings.

## Final Verdict

LGTM
