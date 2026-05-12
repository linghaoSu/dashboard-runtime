# v0.1 Internal Release Gate - ai-dashboard-builder

**Date:** 2026-05-12
**Roadmap Item:** ITS-ai-dashboard-builder-001
**Gate Owner:** Frontend platform team
**Decision Owner:** Platform lead
**Current Evidence Head:** `6d4539d`
**Current Gate Definition Status:** COMPLETE
**Current Release Verdict:** GO for v0.1 internal source/commit evaluation after user-requested sign-off on 2026-05-12

## Release Meaning

v0.1 is an internal platform readiness release for product frontend engineers. It means a product team can evaluate and adopt the dashboard runtime from this repository with documented contracts, a product-style example, objective verification commands, and explicit safety boundaries.

This is not an external package publishing release. All dashboard packages and apps remain `private: true`; registry publishing remains out of scope until a separate release plan defines namespace, access, provenance, versioning, and publish workflow.

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
- Generated chart preview CSP, origin, and postMessage hardening.
- Product integration example using proto-style static TypeScript SDK methods.
- Standalone playground buildability as a host-reference signal.

## Out Of Scope

- Internal or external registry publishing.
- Registry/package-manager consumption of the product SDK pilot outside this workspace.
- External consumer install verification outside this workspace.
- Productized manager-facing workbench UI and local agent bridge implementation.
- Chart extension browser UI and online fetch integration.

## Consolidated Decisions

| Area | v0.1 Decision | Follow-up |
|---|---|---|
| Package consumption | Internal source/commit evaluation only; package manifests stay private. | Registry publishing needs a separate package release plan. |
| Product SDK pilot | `apps/product-integration` pins `@daocloud-proto/ipavo@0.13.0-20` and validates real SDK imports plus live smoke through ignored local env. | Clean checkouts must provide equivalent `PRODUCT_*` values to reproduce live rows. |
| Backend credentials | Backend URL and JWT stay in ignored `.env.local` or local shell env; Vite proxy injects `Authorization` server-side and requires `PRODUCT_API_ALLOWED_HOSTS`. | A productized workbench needs a server-side proxy service and security review. |
| Config-error UX | Product hosts should validate before render; runtime fallback shows detailed errors only in development and concise copy in production. | Product teams can override production copy through runtime props. |
| AI generation | v0.1 uses local-agent-assisted plan -> human approval -> DashboardConfig/locale generation -> validation. | Manager-facing workbench and local agent bridge remain post-v0.1 work. |
| Generated charts | Built-in widgets are preferred. Generated chart widgets require sandbox validation, dependency review, safe preview, and human approval before registration. | Chart browser and online fetch integration are post-v0.1. |
| Playground | `playground/playground-ui` is a standalone DaoStyle host reference; `apps/product-integration` is the canonical dashboard wiring example. | Keep playground buildable, but do not make it the v0.1 integration source. |
| Performance | Current Vite chunk warnings are accepted only while `pnpm run check:bundle-budget` passes. | Lazy loading remains a follow-up if budgets fail. |

## Required Go Criteria

| ID | Criterion | Required Evidence | Current Status |
|---|---|---|---|
| RG-1 | v0.1 scope and non-goals are documented | `requirements.md`, `roadmap.md`, this release gate | PASS |
| RG-2 | Acceptance criteria map to concrete tests, commands, and known gaps | `test-plan.md` | PASS |
| RG-3 | Implementation remains green | `code-review.md`; final-candidate checks | PASS on 2026-05-12 |
| RG-4 | Workspace typecheck, lint, tests, and build pass | `pnpm -r --if-present typecheck`, `lint`, `test`, `build` | PASS on 2026-05-12 |
| RG-5 | Product integration example validates config, SDK wrappers, locale merge, and failure paths | `apps/product-integration` tests/build | PASS on 2026-05-12 |
| RG-6 | Standalone playground remains buildable outside the root workspace | `pnpm --dir playground/playground-ui run build` | PASS with warnings |
| RG-7 | Product-facing adoption guide exists and matches the product example | `docs/ai-dashboard-v0.1-adoption.md` | PASS |
| RG-8 | Safety boundaries are not weakened | Code review, catalog tests, sandbox tests | PASS on 2026-05-12 |
| RG-9 | Known warnings are triaged and assigned to roadmap owners | This release gate, `test-plan.md`, `roadmap.md` | PASS |
| RG-10 | Final release candidate has no unreviewed local changes | `git status --short` before tagging/announcement | PASS on 2026-05-12; final candidate selected as `6d4539d` |

Final v0.1 GO is recorded for internal source/commit evaluation at `6d4539d`. The required commands have been rerun on the final-candidate diff and owner sign-off was recorded by user request on 2026-05-12. Live ipavo PASS evidence is environment-bound because the real `PRODUCT_*` values live only in ignored `.env.local` or local shell state; a clean checkout must provide equivalent out-of-band inputs before reproducing the live rows.

## No-Go Conditions

The release must not be announced as v0.1 internal-ready if any of these are true:

- Any required command exits nonzero.
- `apps/product-integration` no longer validates or its tests/build fail.
- Product adoption depends on reading implementation internals because the adoption guide is missing or contradicts the example.
- Dashboard config, AI catalog, or prompt outputs expose query functions, source code, product SDK implementations, tokens, cookies, user-sensitive data, or permission logic.
- Generated chart widgets can register without validation, sandbox preview contract evidence, and human approval.
- Runtime/config/dataSource/widget errors silently disappear instead of producing an explicit error or widget-level degraded state.
- Package registry publishing is attempted before a dedicated package release plan is approved.
- New high-risk code review findings remain unresolved.
- New bundle or build warnings appear without an owner and release decision.
- `pnpm run check:bundle-budget` fails after a production build.

## Current Evidence

| Evidence | Result | Notes |
|---|---|---|
| `.idea-to-ship/ai-dashboard-builder/test-plan.md` | PASS with documented warnings | 18 files, 92 tests |
| `docs/ai-dashboard-v0.1-adoption.md` | PASS | Product-facing guide based on `apps/product-integration`; includes SDK, proxy, validation, and generation workflow |
| `docs/design.md` | PASS | Layout/palette guidance and DashboardConfig patterns are documented |
| `docs/mcp-echarts.md` | PASS | Optional chart-generation helper stays generation-time only and cannot bypass sandbox validation |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 92 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo JS 824.27 kB, product integration JS 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | Demo/product app and package JS/CSS assets are under v0.1 hard ceilings |
| `pnpm run check:roadmap-completion` | PASS | Environment-bound PASS after live ipavo backend/JWT smoke closes EB-001 through ignored local env |
| `pnpm --dir playground/playground-ui run build` | PASS with warnings | `input-placeholder` pseudo-class warning; largest JS chunk 576.9 kB |
| `git diff --check` | PASS | No whitespace errors |

## Accepted Warnings For v0.1 Internal

| Warning | Decision | Owner / Follow-up |
|---|---|---|
| Demo and product integration Vite chunks exceed 500 kB after minification | Accepted for internal v0.1 only while `pnpm run check:bundle-budget` passes | ITS-ai-dashboard-builder-007 |
| Standalone playground emits `input-placeholder` pseudo-class warnings | Accepted because ITS-009 confirms the playground is a reference-only host surface and build succeeds | ITS-ai-dashboard-builder-009 |
| Standalone playground largest JS chunk is 576.9 kB | Accepted as a known host-template signal, not a v0.1 package budget | ITS-ai-dashboard-builder-007 / ITS-ai-dashboard-builder-009 |
| Line coverage is not measured | Accepted for v0.1 because coverage tooling is not configured; behavior and traceability coverage are documented in `test-plan.md` | Future test-infra follow-up |

## Final Candidate Runbook

1. Confirm `docs/ai-dashboard-v0.1-adoption.md` still matches `apps/product-integration`.
2. Ensure the working tree contains only intended release candidate changes.
3. Run `pnpm -r --if-present typecheck`.
4. Run `pnpm -r --if-present lint`.
5. Run `pnpm -r --if-present test`.
6. Run `pnpm -r --if-present build`.
7. Run `pnpm run check:bundle-budget`.
8. Run `pnpm --dir playground/playground-ui run build`.
9. Run `git diff --check`.
10. For full roadmap closure, run `pnpm run check:roadmap-completion`; this must pass only after the live ipavo backend/JWT gate is satisfied or explicitly scoped out.
11. Update `test-plan.md` results if any command output or warning changes.
12. Record platform-lead GO/HOLD decision in this file.

## Sign-Off

| Role | Required For GO | Current |
|---|---|---|
| Frontend platform owner | Confirms required checks and docs are complete | Signed off by user request on 2026-05-12; checks and docs confirmed for `6d4539d` |
| Platform lead | Confirms release/consumption model and accepts known warnings | GO by user request on 2026-05-12; internal source/commit consumption and known warnings accepted |
| Product frontend pilot owner | Confirms adoption guide is usable for first pilot | Signed off by user request on 2026-05-12 after adoption guide and live gate evidence |
