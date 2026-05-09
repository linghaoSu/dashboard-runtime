# Code Review — ai-dashboard-builder

**Date:** 2026-05-09
**Reviewer:** Codex self-review fallback (`codex:codex-rescue` unavailable in this session)
**Iterations:** 2
**Result:** clean
**Diff size:** 14 tracked files, +538/-7, plus new Stage 6 package/component/test files

## Issues Raised & Resolution

| # | Severity | File:line | Issue | Resolution |
|---|---|---|---|---|
| 1 | warning | `packages/ai-dashboard-widgets/src/schemas.ts:19` | Stage 6 claims basic Panel/FilterBar/TimeRangePicker can work without a dataSource, but their content/options only lived in widget data. With `WidgetRenderer` now passing `undefined` for data-less widgets, these controls rendered empty and were not actually configurable from DashboardConfig props. | Added static props for Panel subtitle/content and FilterBar/TimeRangePicker options, updated the components and registry examples, and added Vue tests for data-less rendering/emits. |
| 2 | warning | `.idea-to-ship/ai-dashboard-builder/architecture.md:734` | The architecture says Stage 6 chart/widget coverage needs component-level verification before MVP acceptance. The initial implementation only relied on typecheck/lint/build/existing tests, leaving the new chart option builders and static basic widgets untested. | Added ECharts option tests covering Bar, Area, Pie, Radar, Heatmap, Scatter, Funnel, and Map; added basic widget tests; added catalog tests for theme/layout/i18n JSON-safe exports. |

## Out-of-Scope Issues Skipped

- The demo production build still reports the known ECharts chunk-size warning. It is recorded in the implementation log and remains a bundle strategy issue for a later product slice.
- `MapChart` is a coordinate scatter implementation rather than a geojson-backed choropleth. This is documented in the implementation log as an accepted Stage 6 limitation.

## Design Drift

None after fixes. The remaining `MapChart` limitation is documented as an explicit Stage 6 deviation, and the missing component/catalog coverage was closed.

## Residual Open Issues

None.

## Final Verdict

LGTM
