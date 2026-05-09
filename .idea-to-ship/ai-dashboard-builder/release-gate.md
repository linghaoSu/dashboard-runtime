# v0.1 Internal Release Gate - ai-dashboard-builder

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-001
**Gate Owner:** Frontend platform team
**Decision Owner:** Platform lead
**Current Evidence Head:** `b499297`
**Current Gate Definition Status:** COMPLETE
**Current Release Verdict:** HOLD until final-candidate checks are rerun on the intended release diff and sign-off is recorded

## Release Meaning

v0.1 is an internal platform readiness release for product frontend engineers. It means a product team can evaluate and adopt the dashboard runtime from this repository with documented contracts, a product-style example, objective verification commands, and explicit safety boundaries.

This is not an external package publishing release. All dashboard packages and apps remain `private: true`; the package surface is reviewed in `.idea-to-ship/ai-dashboard-builder/package-publishing-surface.md`, and registry publishing remains out of scope until its explicit blockers are closed.

## Approved Consumption Model

For v0.1, the supported consumption model is internal source/commit based evaluation:

1. Platform team identifies a release candidate commit or branch in this repository.
2. Product frontend engineers run the workspace checks and inspect `apps/product-integration` as the canonical integration shape.
3. Product teams use the adoption guide and product example to wire real product SDK dataSources in their own pilot branch.
4. Registry package publishing, public npm publishing, and package-manager consumption from outside this repository are not part of the v0.1 gate.

The version marker is `0.1.0` across the workspace packages, but that marker does not imply registry readiness.

## In Scope

- DashboardConfig schema and validation contracts.
- Framework-neutral runtime data loading, ref resolution, event routing, refresh behavior, i18n, and formatting contracts.
- Vue 3 runtime adapter and widget shell behavior.
- Basic widgets and ECharts widgets needed by the MVP dashboards.
- AI catalog export and AI DashboardConfig validation gates.
- Generated chart sandbox validation and approval gate contracts.
- Product integration example using proto-style static TypeScript SDK methods.
- Standalone playground buildability as a host-reference signal.

## Out Of Scope

- Internal or external registry publishing.
- Real product SDK pilot completion.
- External consumer install verification outside this workspace.
- Production config-error UX finalization.
- Quantified performance and bundle budgets.
- Generator execution service/CLI selection.
- Generated chart preview CSP, origin, and postMessage hardening.

## Required Go Criteria

| ID | Criterion | Required Evidence | Current Status |
|---|---|---|---|
| RG-1 | v0.1 scope and non-goals are documented | `requirements.md`, `roadmap.md`, this release gate | PASS |
| RG-2 | Acceptance criteria map to concrete tests, commands, and known gaps | `test-plan.md` | PASS |
| RG-3 | Stage 1-8 implementation remains green | `implementation-log.md`; final-candidate checks | PASS on current evidence |
| RG-4 | Workspace typecheck, lint, tests, and build pass | `pnpm -r --if-present typecheck`, `lint`, `test`, `build` | PASS on 2026-05-09 |
| RG-5 | Product integration example validates config, SDK wrappers, locale merge, and failure paths | `apps/product-integration` tests/build | PASS on 2026-05-09 |
| RG-6 | Standalone playground remains buildable outside the root workspace | `pnpm --dir playground/playground-ui run build` | PASS with warnings |
| RG-7 | Product-facing adoption guide exists and matches the product example | `docs/ai-dashboard-v0.1-adoption.md` | PASS |
| RG-8 | Safety boundaries are not weakened | Code review, catalog tests, sandbox tests | PASS on current evidence |
| RG-9 | Known warnings are triaged and assigned to roadmap owners | This release gate, `test-plan.md`, `roadmap.md` | PASS |
| RG-10 | Final release candidate has no unreviewed local changes | `git status --short` before tagging/announcement | NOT READY in current working tree |

Final v0.1 GO requires every row to be PASS. Rows marked "PASS on current evidence" must be rerun against the final release candidate commit or branch.

## No-Go Conditions

The release must not be announced as v0.1 internal-ready if any of these are true:

- Any required command exits nonzero.
- `apps/product-integration` no longer validates or its tests/build fail.
- Product adoption depends on reading implementation internals because the adoption guide is missing or contradicts the example.
- Dashboard config, AI catalog, or prompt outputs expose query functions, source code, product SDK implementations, tokens, cookies, user-sensitive data, or permission logic.
- Generated chart widgets can register without validation, sandbox preview contract evidence, and human approval.
- Runtime/config/dataSource/widget errors silently disappear instead of producing an explicit error or widget-level degraded state.
- Package registry publishing is attempted before the blockers in `.idea-to-ship/ai-dashboard-builder/package-publishing-surface.md` are closed.
- New high-risk code review findings remain unresolved.
- New bundle or build warnings appear without an owner and release decision.

## Current Evidence

| Evidence | Result | Notes |
|---|---|---|
| `.idea-to-ship/ai-dashboard-builder/test-plan.md` | PASS with documented warnings | 13 files, 69 tests |
| `docs/ai-dashboard-v0.1-adoption.md` | PASS | Product-facing guide based on `apps/product-integration` |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 13 files, 69 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo JS 823.47 kB, product integration JS 907.66 kB |
| `pnpm --dir playground/playground-ui run build` | PASS with warnings | `input-placeholder` pseudo-class warning; largest JS chunk 576.9 kB |
| `git diff --check` | PASS | No whitespace errors |

## Accepted Warnings For v0.1 Internal

| Warning | Decision | Owner / Follow-up |
|---|---|---|
| Demo and product integration Vite chunks exceed 500 kB after minification | Accepted for internal v0.1 only because ECharts is known to dominate the app bundle | ITS-ai-dashboard-builder-007 |
| Standalone playground emits `input-placeholder` pseudo-class warnings | Accepted for release-gate evidence because the build succeeds and the playground is a host-reference surface, not the release artifact | ITS-ai-dashboard-builder-009 |
| Standalone playground largest JS chunk is 576.9 kB | Accepted as a known host-template signal, not a v0.1 package budget | ITS-ai-dashboard-builder-007 / ITS-ai-dashboard-builder-009 |
| Line coverage is not measured | Accepted for v0.1 because coverage tooling is not configured; behavior and traceability coverage are documented in `test-plan.md` | Future test-infra follow-up |

## Final Candidate Runbook

1. Confirm `docs/ai-dashboard-v0.1-adoption.md` still matches `apps/product-integration`.
2. Ensure the working tree contains only intended release candidate changes.
3. Run `pnpm -r --if-present typecheck`.
4. Run `pnpm -r --if-present lint`.
5. Run `pnpm -r --if-present test`.
6. Run `pnpm -r --if-present build`.
7. Run `pnpm --dir playground/playground-ui run build`.
8. Run `git diff --check`.
9. Update `test-plan.md` results if any command output or warning changes.
10. Record platform-lead GO/HOLD decision in this file.

## Sign-Off

| Role | Required For GO | Current |
|---|---|---|
| Frontend platform owner | Confirms required checks and docs are complete | Pending final candidate |
| Platform lead | Confirms release/consumption model and accepts known warnings | Pending final candidate |
| Product frontend pilot owner | Confirms adoption guide is usable for first pilot | Pending final candidate / ITS-ai-dashboard-builder-003 |
