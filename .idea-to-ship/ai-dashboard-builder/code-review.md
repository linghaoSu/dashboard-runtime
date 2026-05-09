# Code Review — ai-dashboard-builder

**Date:** 2026-05-09
**Reviewer:** Codex main-context adversarial reviewer fallback + self-review
**Iterations:** 2
**Result:** accepted-with-open-issues
**Diff size:** 21 files, +1264/-1 before this review artifact update

## Issues Raised & Resolution

| # | Severity | File:line | Issue | Resolution |
|---|---|---|---|---|
| 1 | warning | `apps/product-integration/src/dashboards/tenant-capacity.ts:47` | The product example claimed locale switching, but FilterBar options, Panel body text, and MetricCard data labels were still hard-coded English through widget props/data. That violates the i18n-first runtime contract and makes the integration example misleading. | Moved namespace options and SLO note into locale-aware SDK-style dataSources, made CPU/memory dataSources depend on locale, and added a regression test for zh-CN data-driven text. |
| 2 | warning | `apps/product-integration/src/dashboards/tenant-capacity.ts:57` | The namespace filter emitted `setFilter` and then an explicit `refreshWidget` for the chart. The runtime already reloads data-bound widgets when `globalFilters` changes, so the target chart was being asked to reload twice for one click. | Removed the redundant `refreshWidget` action and made namespace option active state derive from the filter dataSource. |
| 3 | warning | `.idea-to-ship/ai-dashboard-builder/implementation-log.md:678` | Review fixes changed product bundle size and test count, but the implementation log still recorded the pre-review values. Stale verification logs are design drift bait. | Updated Stage 8 notes with the locale-aware dataSource decision, duplicate-refresh decision, product bundle size, and 59-test total. |

## Out-of-Scope Issues Skipped

- Existing catalog/widget example metadata does not yet carry the `sensitivity` marker described in the reviewed architecture. That contract predates this Stage 8 diff and should be handled as a separate catalog hardening change, not buried inside the product integration review.
- The demo and product app still emit the known ECharts chunk-size warning. It is documented in `implementation-log.md` and is now a roadmap item for v0.1 budget decisions.

## Design Drift

No unresolved Stage 8 design drift after fixes.

The accepted Stage 8 deviation remains documented: the product-style integration lives under `apps/product-integration` instead of wiring the generated full-template `playground/playground-ui`.

## Test Traceability

`test-plan.md` is still absent. That is a formal traceability gap for the broader slug, even though this review added/verified focused product integration coverage.

Verification run after fixes:

- `pnpm --filter @dao-style-viz/product-integration-example typecheck`
- `pnpm --filter @dao-style-viz/product-integration-example lint`
- `pnpm --filter @dao-style-viz/product-integration-example test` — 1 file / 4 tests
- `pnpm --filter @dao-style-viz/product-integration-example build` — expected ECharts chunk-size warning
- `pnpm -r --if-present typecheck`
- `pnpm -r --if-present lint`
- `pnpm -r --if-present test` — 13 files / 59 tests
- `pnpm -r --if-present build` — expected ECharts chunk-size warnings in demo and product integration apps
- `git diff --check`

## Residual Open Issues

- Formal `.idea-to-ship/ai-dashboard-builder/test-plan.md` is missing. This should be handled by `$idea-to-ship:test` or the roadmap item `ITS-ai-dashboard-builder-008`.

## Final Verdict

LGTM for the current code diff after fixes; accepted with the documented missing test-plan artifact.
