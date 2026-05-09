# Design Review — AI Dashboard Builder

**Slug:** ai-dashboard-builder
**Date:** 2026-05-09
**Reviewer:** Codex self-review fallback (`codex:codex-rescue` unavailable in this session)
**Iterations:** 2
**Result:** clean

## Issues Raised & Resolution

| # | Severity | Issue | Resolution |
|---|---|---|---|
| 1 | warning | `architecture.md` still described the repo as document-only even though Stages 1-4 have landed. That would mislead the next engineer and create design drift. | Fixed in `architecture.md` Codebase Context, Rollout, and Staged Implementation Plan by making Stages 1-4 the landed baseline and Stage 5 the next work. |
| 2 | warning | The event design exposed runtime events but did not define the configurable `WidgetEventConfig` shape or target/default semantics for `setFilter`, `refreshWidget`, and `emit`. | Fixed in `architecture.md` Interfaces and Stage 5 by adding action-specific config types, default target behavior, target validation, and targeted refresh requirements. |
| 3 | warning | `$ref` lifecycle said cycles were invalid but did not specify how to detect them or which scopes can create cycles. | Fixed in `architecture.md` by adding the ref dependency graph rule, cycle error behavior, and Stage 5 tests for context/globalFilter refs. |
| 4 | critical | MVP chart and basic widget coverage in the staged plan underdelivered the requirements. The plan stopped at Line/Gauge/Donut and omitted required widgets/charts. | Fixed in `architecture.md` Option B, Module Breakdown, Stage 6, Rollout, and Test Strategy by making full widget/chart coverage a pre-MVP requirement. |
| 5 | warning | AI catalog scope only covered dataSources/widgets, but requirements also require theme, layout preset, and i18n metadata. | Fixed in `architecture.md` catalog flow, module breakdown, catalog interfaces, validation checks, Stage 6, and catalog tests. |
| 6 | warning | Catalog examples were allowed without a concrete sensitivity marker, leaving room for production data leakage through AI-facing metadata. | Fixed in `architecture.md` by requiring synthetic/mock/aggregated/redacted sensitivity markers on dataSource and widget examples and adding catalog failure/test coverage. |
| 7 | warning | AI generation was described as prompt templates, but requirements require a plan-before-config generation flow. | Fixed in `architecture.md` by adding `DashboardPlan`, `DashboardGenerationResult`, adjacent locale resources, and model-agnostic acceptance rules. |
| 8 | warning | Refresh minimum behavior was still open between reject and clamp. That is not a useful ambiguity for runtime validation. | Fixed in `architecture.md` by setting default minimum refresh interval to `5000ms`, allowing hosts to raise it, and rejecting below-minimum config. |

## Residual Open Issues

The remaining open questions are implementation choices, not blockers for the current architecture:

- Production UI handling for config-level validation errors.
- Whether MVP layout remains raw pixel coordinates or reserves a grid abstraction.
- Whether catalog schema summaries stay custom or move to `zod-to-json-schema`.
- Whether model-backed generation is local CLI, internal service, or host-provided orchestration.
- Whether `mcp-echarts` integration is local CLI only or exposed as an internal service.
- Whether generated chart sandbox starts as local CLI or management UI.
- CSP and `postMessage` protocol details for iframe preview before Stage 7.

## Reviewer's Final Verdict

LGTM

## Self-Review Notes

Option B still makes sense after the revisions. The tracer bullet has already proven the core path, and the document now clearly separates landed baseline from remaining work. The staged plan is independently shippable as long as Stage 6 is treated as a coverage/completeness stage, not a nice-to-have cleanup.
