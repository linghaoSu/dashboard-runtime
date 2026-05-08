# Design Review — AI Dashboard Builder

**Slug:** ai-dashboard-builder
**Date:** 2026-05-08
**Reviewer:** Codex self-review (codex:codex-rescue not spawned; delegation was not explicitly requested)
**Iterations:** 2
**Result:** clean

## Issues Raised & Resolution

| # | Severity | Issue | Resolution |
|---|---|---|---|
| 1 | warning | Runtime context and `$ref` lifecycle were underspecified. `context`, `globalFilters`, `runtime`, and widget params could be resolved in conflicting orders, and cycles were not called out. | Fixed in `architecture.md` by adding `RuntimeInput`, `RuntimeContext`, `RefScope`, explicit resolution order, cyclic-ref failure handling, and Stage 2 implementation requirements. |
| 2 | warning | Data compatibility relied on dataSource output validation only. A dataSource could return valid output for itself but still be incompatible with the selected widget's `dataSchema`. | Fixed in `architecture.md` data flow, runtime-only validation, failure modes, test hooks, and Stage 2 plan by requiring validation against widget `dataSchema`. |
| 3 | warning | Widget events conflated low-level component triggers with runtime actions like `setFilter` and `refreshWidget`, which would couple reusable widgets to dashboard behavior. | Fixed in `architecture.md` by adding `event-dispatcher.ts`, `WidgetEmittedEvent`, `EventRefScope`, event mapping semantics, event failure modes, and Stage 5 requirements. |
| 4 | warning | Package scope was still treated as an open placeholder after the user specified `@dao-style-viz`. | Updated `doc.md`, `requirements.md`, and `architecture.md` to use `@dao-style-viz/*` and removed the obsolete package-scope open question. |
| 5 | nit | After splitting event types, `WidgetRuntimeProps.emit` still referenced the runtime action type. | Fixed `WidgetRuntimeProps.emit` to accept `WidgetEmittedEvent`. |

## Residual Open Issues

The remaining open questions in `architecture.md` are implementation choices rather than design blockers:

- package manager orchestration: plain pnpm scripts vs Turborepo
- exact minimum refresh interval
- reject vs clamp behavior for trusted hand-written configs under the refresh minimum
- production handling for config-level validation errors
- raw pixel layout vs future grid abstraction
- JSON schema conversion library choice
- generated chart sandbox CLI vs management UI
- iframe preview CSP and `postMessage` protocol

## Reviewer's Final Verdict

LGTM

## Self-Review Notes

Option B still makes sense after the fixes. The core tracer bullet remains the lowest-blast-radius path, but the document now gives implementers enough detail to avoid design drift around refs, data compatibility, and event behavior. The staged plan remains independently shippable: Stage 1 establishes contracts, Stage 2 proves runtime execution, Stage 3 adds ECharts breadth, and later stages harden catalog, events, widgets, and sandboxing.
