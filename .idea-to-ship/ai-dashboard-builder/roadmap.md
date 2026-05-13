---
goal: "doc.md -> AI Dashboard Builder v0.1 planning"
horizon: "0.1"
generated_at: "2026-05-09 14:18 CST"
last_updated: "2026-05-13 16:50 CST"
repo_head: "c5fc6b4"
dirty_worktree: "no"
mode: "slug"
slug: "ai-dashboard-builder"
source_scope: "local"
capacity: "5 frontend engineers"
write_target: ".idea-to-ship/ai-dashboard-builder/roadmap.md"
---

# Roadmap — AI Dashboard Builder v0.1

## Human-Owned Sections

### Strategic Objective

以 `doc.md` 为源目标，在 `0.1` 周期内把 AI Dashboard Builder 从已完成的本地 MVP 实现推进到可评审、可试点、可内部发布的前端平台能力。

### Manual Overrides

用户已批准最终路线图优先级：Now 为 ITS-ai-dashboard-builder-001、ITS-ai-dashboard-builder-008、ITS-ai-dashboard-builder-002；Next 为 ITS-ai-dashboard-builder-010、ITS-ai-dashboard-builder-003、ITS-ai-dashboard-builder-004、ITS-ai-dashboard-builder-007、ITS-ai-dashboard-builder-006；Later 为 ITS-ai-dashboard-builder-005、ITS-ai-dashboard-builder-009。后续用户补充的产品化目标已收敛为 ITS-ai-dashboard-builder-011、ITS-ai-dashboard-builder-012、ITS-ai-dashboard-builder-013：manager-facing web workbench、本地 Codex/OpenCode bridge、server-side backend/JWT proxy、以及 chart extension browser/generated widget promotion。

### Out of Scope / Non-Goals

遵循已接受需求的一阶段边界：不建设统一数据仓库、不强制后端改造、不让 AI 直接调用业务 SDK、不开放任意 Vue 页面生成、不做完整 BI 语义层、不允许不可信配置携带可执行 JavaScript。

<!-- idea-to-ship:roadmap generated:start -->

## What Changed Since Last Roadmap

- Added: final Now / Next / Later lanes based on the approved user priority order.
- Removed: Candidate Brief-only approval blocker from the generated section.
- Promoted: ITS-ai-dashboard-builder-001, ITS-ai-dashboard-builder-008, and ITS-ai-dashboard-builder-002 to Now.
- Demoted: none.
- Completed: ITS-ai-dashboard-builder-008 produced `test-plan.md` with passing verification evidence; ITS-ai-dashboard-builder-001 produced `release-gate.md` with v0.1 go/no-go criteria and source-based internal consumption model; ITS-ai-dashboard-builder-002 produced `docs/ai-dashboard-v0.1-adoption.md`; ITS-ai-dashboard-builder-010 produced `release-gate.md` and fixed the widgets declaration output surface; ITS-ai-dashboard-builder-004 locked the production config-error UX contract; ITS-ai-dashboard-builder-007 defined v0.1 performance and bundle budgets with a local budget check; ITS-ai-dashboard-builder-006 chose the local-agent-assisted generator execution path; ITS-ai-dashboard-builder-005 hardened generated chart preview CSP/origin/message policy; ITS-ai-dashboard-builder-009 validated the full-template playground as a reference-only host surface; ITS-ai-dashboard-builder-011 designed the manager workbench and local agent bridge; ITS-ai-dashboard-builder-012 defined backend proxy and JWT credential handling; ITS-ai-dashboard-builder-013 defined chart extension promotion flow.
- Added: ipavo product dashboard pilot reference and a post-v0.1 manager-facing workbench direction: server-side `/apis` proxy with JWT header injection, generated SDK packages such as `@daocloud-proto/*`, local Codex/OpenCode agent bridge, and chart extension flow through sandboxed generated widgets.
- Added: executable design evidence for the ipavo reference through the `ipavo-console-overview` layout preset and `ipavo-console-light` palette alternative.
- Needs Decision: `c5fc6b4` is selected as the v0.1 release-candidate head with passing review/check evidence; final GO/HOLD still requires platform-lead sign-off.

## Inputs

| Source | Budget / Freshness | Evidence Role |
|---|---|---|
| User intake | Current request | Goal: `doc.md`; horizon: `0.1`; mode: single slug; source scope: local only; capacity: 5 frontend engineers |
| User priority approval | Current request | Final Now / Next / Later lane order |
| `doc.md` | Full local design source | Strategic goal, module taxonomy, non-goals, i18n and AI safety constraints |
| `.idea-to-ship/ai-dashboard-builder/requirements.md` | Full slug requirements | Accepted requirements, success criteria, non-goals, touch points |
| `.idea-to-ship/ai-dashboard-builder/architecture.md` | Full reviewed architecture | Chosen design, staged plan, rollout, test hooks, open decisions |
| `.idea-to-ship/ai-dashboard-builder/code-review.md` | Full latest code review | Multi-agent review outcome and residual risk |
| Workspace manifests | Root/package/app `package.json`, `pnpm-workspace.yaml` | Release surface, scripts, package privacy, workspace shape |

- Repo HEAD: `c5fc6b4`.
- Dirty worktree: no at candidate selection time. `c5fc6b4` contains live ipavo browser mode, abort-signal propagation, expanded live-route tests, release-gate/test-plan/roadmap updates, and adoption-guide cleanup; final GO requires platform-lead sign-off.
- Excluded sources: git history beyond HEAD/status, TODO/FIXME mining, GitHub issues/PRs/milestones, and network/package registry data.

## Now

### ITS-ai-dashboard-builder-001 — Cut v0.1 internal release gate
**Status:** Completed - gate definition complete; `c5fc6b4` selected as release-candidate head and awaiting platform-lead GO/HOLD
**Work Type:** Release
**Evidence Class:** Explicit
**Confidence:** High
**Source Anchors:** user statement: approved Now priority; user statement: horizon `0.1`; `.idea-to-ship/ai-dashboard-builder/release-gate.md`; `.idea-to-ship/ai-dashboard-builder/code-review.md`; `package.json:3`; `packages/ai-dashboard-schema/package.json:3`
**Why Now / Why Next / Why Later:** Why Now: v0.1 needs an explicit acceptance boundary before package publishing, product pilots, or additional feature work can be judged as release-ready.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead
**Release Gate:** Entry: Stage 1-8 implementation and verification remain green; exit: v0.1 exit criteria, consumption model, required checks, owners, and no-go conditions are documented; evidence required: roadmap, test plan, and command output references; no-go conditions: failing root checks, unresolved high-risk safety gaps, or no approved distribution model.
**Evidence Required:** `.idea-to-ship/ai-dashboard-builder/roadmap.md`; `.idea-to-ship/ai-dashboard-builder/test-plan.md`; `.idea-to-ship/ai-dashboard-builder/release-gate.md`; `pnpm -r --if-present typecheck`; `pnpm -r --if-present lint`; `pnpm -r --if-present test`; `pnpm -r --if-present build`; internal source/commit-based distribution model.
**Dependencies:** ITS-ai-dashboard-builder-008 for objective acceptance evidence.
**Risk:** medium - without a written release gate, v0.1 can ship with unclear quality, consumption, or no-go criteria.

### ITS-ai-dashboard-builder-008 — Produce v0.1 acceptance test plan artifact
**Status:** Completed
**Work Type:** Maintenance
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: approved Now priority; `.idea-to-ship/ai-dashboard-builder/requirements.md:121`; `.idea-to-ship/ai-dashboard-builder/requirements.md:137`; `.idea-to-ship/ai-dashboard-builder/architecture.md`; `.idea-to-ship/ai-dashboard-builder/code-review.md`
**Why Now / Why Next / Why Later:** Why Now: the release gate depends on verifiable acceptance coverage, and the requirements already list success criteria that need to be mapped to concrete commands, tests, and gaps.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead
**Release Gate:** Entry: requirements, architecture, implementation log, and existing tests are available; exit: every success criterion is mapped to an existing check, a new required check, or a documented v0.1 gap; evidence required: `test-plan.md`; no-go conditions: unowned critical acceptance gaps or commands that cannot be run in CI/local verification.
**Evidence Required:** `.idea-to-ship/ai-dashboard-builder/test-plan.md`; existing test files and command results; explicit list of uncovered acceptance criteria.
**Dependencies:** None.
**Risk:** medium - hidden test gaps can make the release gate subjective and let regressions pass through plausible local demos.

### ITS-ai-dashboard-builder-002 — Convert product integration example into v0.1 adoption guide
**Status:** Completed
**Work Type:** Docs
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: approved Now priority; `.idea-to-ship/ai-dashboard-builder/requirements.md:107`; `docs/ai-dashboard-v0.1-adoption.md`; `apps/product-integration`
**Why Now / Why Next / Why Later:** Why Now: the product integration app already proves the intended file layout and SDK wrapper shape, but v0.1 needs a product-front-end-facing guide so adoption does not depend on reading implementation details.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** None
**Release Gate:** Entry: `apps/product-integration` compiles and its smoke tests pass; exit: adoption guide documents dataSource wrapper shape, dashboard config layout, dashboard-owned i18n merge, widget registry, package CSS imports, validation gate, and mocked-SDK replacement steps; evidence required: guide plus command output; no-go conditions: guide contradicts product example or omits i18n/validation wiring.
**Evidence Required:** `docs/ai-dashboard-v0.1-adoption.md`; `apps/product-integration` typecheck/lint/test/build commands; source links to product integration files.
**Dependencies:** None.
**Risk:** low - the main failure mode is product teams copying incomplete wiring and bypassing validation or locale packaging.

## Next

### ITS-ai-dashboard-builder-010 — Prepare package publishing surface
**Status:** Completed - internal tarball/package surface prepared; registry publish remains blocked by explicit blockers
**Work Type:** Release
**Evidence Class:** Repo
**Confidence:** High
**Source Anchors:** user statement: approved Next priority; `release-gate.md`; `package.json:4`; `packages/ai-dashboard-runtime/package.json:4`; `packages/ai-dashboard-runtime/package.json:8`; `packages/ai-dashboard-vue/package.json:15`; `packages/ai-dashboard-echarts-vue/package.json:15`; `packages/ai-dashboard-widgets/package.json:15`; `packages/ai-dashboard-sandbox/package.json:14`; `packages/ai-dashboard-widgets/tsconfig.build.json`
**Why Now / Why Next / Why Later:** Why Next: package manifests expose exports and dist files, but all packages are still private; publishing work should follow the v0.1 release gate so packaging decisions do not outrun acceptance criteria.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead
**Release Gate:** Entry: ITS-ai-dashboard-builder-001 defines distribution model; exit: package privacy, exports, CSS exports, files, build order, and internal source/tarball QA path are documented and verified; evidence required: package manifest review, widgets declaration-output fix, and pack output; no-go conditions: package entrypoints fail after clean build, Vue package CSS imports are missing, or registry publishing is attempted before the blockers in `release-gate.md` are closed.
**Evidence Required:** `release-gate.md`; `packages/ai-dashboard-widgets/tsconfig.build.json`; `pnpm --filter @dao-style-viz/ai-dashboard-widgets build`; `pnpm --filter <package> pack --json --pack-destination /tmp/ai-dashboard-packs` for each publishable package.
**Dependencies:** ITS-ai-dashboard-builder-001 for the approved distribution model.
**Risk:** medium - premature publishing can lock unstable package entrypoints or expose private packages with incomplete peer dependency and consumer install contracts.

### ITS-ai-dashboard-builder-003 — Choose and execute first real product SDK pilot
**Status:** Completed - ipavo-style local pilot is calibrated against `@daocloud-proto/ipavo@0.13.0-20`; live backend/JWT smoke passes through ignored local env with redacted output
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** High for local pilot shape; Medium for real backend execution
**Source Anchors:** user statement: approved Next priority; user-provided screenshot; `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/App.vue`; `docs/ai-dashboard-v0.1-adoption.md`; `apps/product-integration/package.json`; `apps/product-integration/src/product-sdk/ipavo-live-contract.ts`
**Why Now / Why Next / Why Later:** Why Next: ipavo is now the concrete product reference, and the screenshot/dashboard source proves the target should be expressible as DashboardConfig plus product-owned dataSources/widgets before broader manager-facing generation is built.
**Owner:** Frontend platform team (5 engineers) plus selected product frontend owner
**Decision Owner:** Product/platform lead
**Release Gate:** Entry: ipavo reference source, screenshot, and adoption guide exist; exit: one product dashboard registers SDK-shaped dataSources, renders through runtime, merges dashboard locale resources, passes validation, documents real `@daocloud-proto/*` replacement, and keeps JWT/backend proxy outside DashboardConfig; evidence required: pilot artifact and product app commands; no-go conditions: SDK auth/business logic leaks into AI catalog or dashboard config.
**Evidence Required:** `docs/ai-dashboard-v0.1-adoption.md`; product source links; validation output; product app typecheck/lint/test/build; review confirming no query implementation leaks into catalog.
**Dependencies:** ITS-ai-dashboard-builder-002 for adoption guidance; ignored local backend URL, JWT, and allowlist values for live execution.
**Risk:** high - real SDK integration can expose undocumented request/auth/i18n assumptions that the mocked example does not cover.

### ITS-ai-dashboard-builder-004 — Lock production config-error UX contract
**Status:** Completed
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: approved Next priority; `.idea-to-ship/ai-dashboard-builder/requirements.md:115`; `.idea-to-ship/ai-dashboard-builder/architecture.md:689`; `.idea-to-ship/ai-dashboard-builder/architecture.md:691`; `docs/ai-dashboard-v0.1-adoption.md`
**Why Now / Why Next / Why Later:** Why Next: failure handling exists as a requirement and architecture rule, but the production UX ownership remains open and should be resolved before broader product pilots.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead plus product lead
**Release Gate:** Entry: release gate and test plan identify config validation failures as release-critical; exit: runtime-vs-host error ownership is documented and covered by tests/examples; evidence required: docs/tests and product integration behavior; no-go conditions: production UI exposes raw developer-only errors or silently hides config failures.
**Evidence Required:** `docs/ai-dashboard-v0.1-adoption.md`; `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts`; `apps/product-integration/src/screens/TenantCapacityScreen.vue`; targeted typecheck/lint/test results.
**Dependencies:** ITS-ai-dashboard-builder-008 for acceptance criteria mapping.
**Risk:** medium - inconsistent failure UX can make invalid generated dashboards hard to diagnose in product hosts.

### ITS-ai-dashboard-builder-007 — Define v0.1 performance and bundle budgets
**Status:** Completed
**Work Type:** Maintenance
**Evidence Class:** Artifact
**Confidence:** Medium
**Source Anchors:** user statement: approved Next priority; `.idea-to-ship/ai-dashboard-builder/requirements.md:113`; `.idea-to-ship/ai-dashboard-builder/requirements.md:114`; `release-gate.md`; `scripts/check-bundle-budget.mjs`
**Why Now / Why Next / Why Later:** Why Next: ECharts bundle warnings are known and currently accepted, but v0.1 needs explicit thresholds so bundle growth and widget scale do not remain anecdotal.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead
**Release Gate:** Entry: current demo and product builds are green with known warnings; exit: v0.1 documents max dashboard/widget assumptions, acceptable chunk warnings, and any required lazy-loading follow-up; evidence required: build output and budget check; no-go conditions: `pnpm run check:bundle-budget` fails or no owner exists for a required optimization.
**Evidence Required:** `release-gate.md`; `scripts/check-bundle-budget.mjs`; `pnpm -r --if-present build`; `pnpm run check:bundle-budget`.
**Dependencies:** ITS-ai-dashboard-builder-001 for release no-go integration.
**Risk:** medium - bundle growth can become release-blocking late if no threshold is agreed early.

### ITS-ai-dashboard-builder-006 — Decide v0.1 generator execution path
**Status:** Completed
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: approved Next priority; user statement: connect to local Codex/OpenCode rather than self-hosting an LLM; `docs/ai-dashboard-v0.1-adoption.md`; `.idea-to-ship/ai-dashboard-builder/generator-sample-plan.json`; `packages/ai-dashboard-ai-catalog/src/prompt-templates.ts`
**Why Now / Why Next / Why Later:** Why Next: the model-agnostic plan-before-config contract exists, but v0.1 still needs an operational path for who runs generation and how outputs enter validation.
**Owner:** Frontend platform team (5 engineers)
**Decision Owner:** Platform lead
**Release Gate:** Entry: catalogs, prompt templates, and validation gate exist; exit: v0.1 chooses manual prompt workflow, local CLI, internal service, or host orchestration and documents required validation before runtime; evidence required: generator workflow doc and sample output; no-go conditions: generated config bypasses plan, locale resources, schema validation, or catalog validation.
**Evidence Required:** `docs/ai-dashboard-v0.1-adoption.md`; `.idea-to-ship/ai-dashboard-builder/generator-sample-plan.json`; `apps/product-integration/src/dashboards/ipavo-overview.ts`; product validation/test output.
**Dependencies:** ITS-ai-dashboard-builder-008 for acceptance mapping.
**Risk:** medium - without an execution path, AI support remains a contract and prompt set rather than an adoptable workflow.

## Later

### ITS-ai-dashboard-builder-005 — Harden generated chart preview execution policy
**Status:** Completed
**Work Type:** Spike
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: approved Later priority; `release-gate.md`; `packages/ai-dashboard-sandbox/src/preview-contract.ts`; `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts`
**Why Now / Why Next / Why Later:** Why Later: Stage 7 already defines deterministic validation and preview contracts; full CSP/origin/postMessage policy matters before generated widget publishing, but it is not required for v0.1 runtime/product integration readiness.
**Owner:** Unassigned
**Decision Owner:** Security/platform lead
**Release Gate:** Entry: generated chart publishing becomes part of a release target; exit: CSP, preview origin checks, message envelope, CLI/UI host ownership, and approval evidence are documented and tested; evidence required: spike result and security review; no-go conditions: preview executes generated code without origin/CSP/message constraints.
**Evidence Required:** `release-gate.md`; `packages/ai-dashboard-sandbox/src/preview-contract.ts`; `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts`; sandbox package typecheck/lint/test output.
**Dependencies:** None.
**Risk:** high - generated preview execution is a safety boundary and cannot be improvised once arbitrary chart code is enabled.

### ITS-ai-dashboard-builder-009 — Validate full-template playground as host integration surface
**Status:** Completed
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** Medium
**Source Anchors:** user statement: approved Later priority; `doc.md:198`; `doc.md:204`; `release-gate.md`; `playground/playground-ui/package.json`; `playground/playground-ui/src/plugins/vue-i18n/index.ts`
**Why Now / Why Next / Why Later:** Why Later: the standalone playground is useful host evidence, but the workspace product integration app is already the leaner v0.1 integration surface and easier to keep in root verification.
**Owner:** Unassigned
**Decision Owner:** Platform lead
**Release Gate:** Entry: product integration app is stable and adoption guide exists; exit: full-template playground either wires one dashboard or is explicitly documented as a host reference only; evidence required: standalone build and integration notes; no-go conditions: playground modifications break its standalone dependency model.
**Evidence Required:** `release-gate.md`; `pnpm --dir playground/playground-ui run build`; adoption guide reference.
**Dependencies:** ITS-ai-dashboard-builder-002 for adoption guidance.
**Risk:** low - deferring playground wiring may leave some DaoStyle host ergonomics untested, but it does not block the v0.1 core platform release gate.

### ITS-ai-dashboard-builder-011 — Design manager-facing dashboard workbench and local agent bridge
**Status:** Completed
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** Medium
**Source Anchors:** user statement: manager-facing web UI with chat generation, adjustment UI, local Codex/OpenCode connection; `roadmap.md`; `docs/ai-dashboard-v0.1-adoption.md`
**Why Now / Why Next / Why Later:** Why Later: it is the productized direction after v0.1 proves DashboardConfig, product SDK dataSources, and validation; building it before the pilot path is stable would create a UI over moving contracts.
**Owner:** Unassigned
**Decision Owner:** Platform/product lead
**Release Gate:** Entry: product pilot and generator workflow are documented; exit: workbench architecture defines chat flow, preview, edit controls, validation, local agent bridge protocol, file-write permissions, and approval checkpoints; no-go conditions: management UI stores LLM provider keys or bypasses local agent/user approval.
**Evidence Required:** `roadmap.md`; future implementation spike before productization.
**Dependencies:** ITS-ai-dashboard-builder-003 and ITS-ai-dashboard-builder-006.
**Risk:** high - an agent bridge can edit product workspaces and must be explicitly permissioned, observable, and reversible.

### ITS-ai-dashboard-builder-012 — Define backend proxy and credential handling for real SDK previews
**Status:** Completed
**Work Type:** Security
**Evidence Class:** Artifact
**Confidence:** High
**Source Anchors:** user statement: backend URL/token entered in UI, server-side proxy, JWT auth header; `docs/ai-dashboard-v0.1-adoption.md`; `apps/product-integration/src/proxy-config.ts`; `docs/ai-dashboard-v0.1-adoption.md`
**Why Now / Why Next / Why Later:** Why Later: v0.1 can document proxy knobs, but a real management UI must have a server-side credential boundary before users enter backend URLs and JWTs.
**Owner:** Unassigned
**Decision Owner:** Security/platform lead
**Release Gate:** Entry: live backend preview is planned; exit: proxy service contract defines URL allowlist, JWT storage/lifetime, header injection, audit logging, request limits, and redaction; no-go conditions: DashboardConfig or AI prompt payloads contain tokens, cookies, or backend auth headers.
**Evidence Required:** `docs/ai-dashboard-v0.1-adoption.md`; `apps/product-integration/src/__tests__/proxy-config.test.ts`; product integration test output using a fake backend/JWT.
**Dependencies:** ITS-ai-dashboard-builder-003.
**Risk:** high - mishandled JWTs would turn a dashboard generator into a credential leak vector.

### ITS-ai-dashboard-builder-013 — Build chart extension browser and generated widget promotion flow
**Status:** Completed
**Work Type:** Feature
**Evidence Class:** Artifact
**Confidence:** Medium
**Source Anchors:** user statement: fetch/select additional ECharts charts, auto-generate new chart widgets when built-ins are insufficient; `docs/mcp-echarts.md`; `docs/ai-dashboard-v0.1-adoption.md`; `packages/ai-dashboard-sandbox`
**Why Now / Why Next / Why Later:** Why Later: built-in charts should be preferred first; dynamic chart extension should only ship after sandbox preview and approval policy hardening.
**Owner:** Unassigned
**Decision Owner:** Platform lead plus security lead
**Release Gate:** Entry: generated chart preview policy is hardened; exit: chart browser can select approved ECharts or other visualization patterns, generate a widget package, run sandbox gates, preview safely, and register only after human approval; no-go conditions: arbitrary chart dependencies or code execute without validation.
**Evidence Required:** `docs/mcp-echarts.md`; existing sandbox pass/fail evidence; future browser UI implementation.
**Dependencies:** ITS-ai-dashboard-builder-005.
**Risk:** high - chart generation combines remote code patterns, package dependencies, and preview execution.

## Milestones

### Milestone 1 — v0.1 Readiness Definition
**Target:** v0.1 readiness gate
**Scope:** ITS-ai-dashboard-builder-001, ITS-ai-dashboard-builder-008, ITS-ai-dashboard-builder-002
**Owner:** Frontend platform team (5 engineers)
**Dependencies:** ITS-ai-dashboard-builder-008 must complete before ITS-ai-dashboard-builder-001 exits.
**Release Gate:** Entry: user-approved Now priorities; exit: release gate, acceptance test plan, and adoption guide are complete; required evidence: markdown artifacts plus root/product verification commands; no-go conditions: unowned acceptance gaps, failing verification, or missing distribution decision.
**Risk Level:** medium

### Milestone 2 — v0.1 Product Trial Preparation
**Target:** after Milestone 1
**Scope:** ITS-ai-dashboard-builder-010, ITS-ai-dashboard-builder-003, ITS-ai-dashboard-builder-004, ITS-ai-dashboard-builder-007, ITS-ai-dashboard-builder-006
**Owner:** Frontend platform team (5 engineers) plus selected product owner
**Dependencies:** ITS-ai-dashboard-builder-001 controls release/publishing decisions; ITS-ai-dashboard-builder-002 supports product pilot onboarding.
**Release Gate:** Entry: v0.1 readiness definition is complete; exit: package consumption path, product pilot target, production error UX, performance budget, and generator workflow are decided and documented; required evidence: product pilot checks and package/build verification; no-go conditions: real SDK integration leaks business code into AI-facing metadata or package entrypoints fail consumer builds.
**Risk Level:** high

### Milestone 3 — Generated Extension Hardening
**Target:** post-v0.1 extension readiness
**Scope:** ITS-ai-dashboard-builder-005, ITS-ai-dashboard-builder-009
**Owner:** Unassigned
**Dependencies:** Generated chart publishing must become an explicit release target before ITS-ai-dashboard-builder-005 is promoted.
**Release Gate:** Entry: v0.1 core runtime/product adoption path is stable; exit: generated chart preview policy and optional full-template playground integration are validated; required evidence: security review, preview host tests, and playground build notes; no-go conditions: generated code preview lacks CSP/origin/message constraints.
**Risk Level:** medium

## Dependency Order

1. ITS-ai-dashboard-builder-008 -> ITS-ai-dashboard-builder-001: the release gate needs objective acceptance evidence.
2. ITS-ai-dashboard-builder-001 -> ITS-ai-dashboard-builder-010: package publishing must follow the approved distribution model.
3. ITS-ai-dashboard-builder-002 -> ITS-ai-dashboard-builder-003: the product pilot should start from the documented integration path.
4. ITS-ai-dashboard-builder-008 -> ITS-ai-dashboard-builder-004 and ITS-ai-dashboard-builder-006: acceptance criteria should frame production error UX and generator workflow decisions.

## Dependency Hypotheses

- A real product pilot may require internal package publishing before SDK integration. This is not a hard dependency until the product owner chooses a consumption model.
- Lazy widget loading may be required if v0.1 bundle budgets reject the current ECharts chunk warning. Current evidence only shows the warning; it does not prove user-facing performance failure.
- Full-template playground wiring may be required by a specific product host. Current evidence supports it as a reference host, not a v0.1 blocker.

## Critical Path

For v0.1 readiness, the Now lane artifacts are complete: ITS-ai-dashboard-builder-008, ITS-ai-dashboard-builder-001, and ITS-ai-dashboard-builder-002. `c5fc6b4` is the reviewed release-candidate head; final GO now depends on platform-lead sign-off.

## Risks / Spikes

- Real product SDK pilot risk: mocked SDKs may hide authentication, generated-type, or request-shaping constraints.
- Bundle/performance risk: ECharts bundle warnings are known but not yet budgeted.
- Generated chart safety risk: preview execution policy is documented and tested; the chart browser UI and online fetch integration remain future work.
- Error UX risk: config-level failures must not become silent production failures or raw developer stack traces.

## Status By Feature

| Slug/ID | Status | Next Action | Blockers | Evidence |
|---|---|---|---|---|
| ITS-ai-dashboard-builder-001 | Completed | Record platform-lead GO/HOLD for `c5fc6b4` | Platform-lead sign-off | `release-gate.md`; test-plan command evidence |
| ITS-ai-dashboard-builder-008 | Completed | Keep results current if checks change | None | `test-plan.md`; 19 files / 95 tests |
| ITS-ai-dashboard-builder-002 | Completed | Use guide for first product pilot | Product owner and SDK access | `docs/ai-dashboard-v0.1-adoption.md`; product integration example |
| ITS-ai-dashboard-builder-010 | Completed | Internal package surface and pack evidence documented; registry publish remains blocked | `release-gate.md` | Registry blockers remain explicit |
| ITS-ai-dashboard-builder-003 | Completed | ipavo-style local pilot implemented and calibrated to `@daocloud-proto/ipavo@0.13.0-20`; live backend run passes through ignored local env | Product owner and backend access | Product integration ipavo dashboard, real SDK dependency/import test/preflight, pilot artifact, `docs/ai-dashboard-v0.1-adoption.md`, `release-gate.md`, and `pnpm run check:roadmap-completion` |
| ITS-ai-dashboard-builder-004 | Completed | Hybrid contract: host validation gate plus runtime fallback; production hides raw details | `docs/ai-dashboard-v0.1-adoption.md` | Runtime tests and product example |
| ITS-ai-dashboard-builder-007 | Completed | v0.1 hard ceilings and local budget script are defined | `release-gate.md` | `pnpm run check:bundle-budget` |
| ITS-ai-dashboard-builder-006 | Completed | Use local-agent-assisted plan -> approval -> config/i18n -> validation workflow | `docs/ai-dashboard-v0.1-adoption.md` | Codex/OpenCode-style local agent bridge remains later work |
| ITS-ai-dashboard-builder-005 | Completed | CSP/origin/session-bound preview policy is documented and tested | `release-gate.md` | Sandbox preview host implementation remains host-owned |
| ITS-ai-dashboard-builder-009 | Completed | Playground remains standalone host reference; canonical dashboard wiring stays in product integration app | `release-gate.md` | Build passes with accepted generated CSS warnings |
| ITS-ai-dashboard-builder-011 | Completed | Productize only after v0.1 pilot contracts are stable | `roadmap.md` | Workbench UI implementation remains future work |
| ITS-ai-dashboard-builder-012 | Completed | Promote local proxy contract into productized workbench/server service later | `docs/ai-dashboard-v0.1-adoption.md`; product proxy tests | Real backend URL/JWT access remains external to this repo |
| ITS-ai-dashboard-builder-013 | Completed | Implement chart browser UI only after sandboxed promotion flow is accepted | `docs/mcp-echarts.md` | Online chart search and generated widget UI remain future work |

## Candidate Backlog

None. All approved candidate items are assigned to Now, Next, or Later.

## Open Decisions

| Decision | Options | Recommended Option | Decision Owner | Needed By | Impact If Delayed |
|---|---|---|---|---|---|
| v0.1 distribution model | Source-only workspace; internal npm registry; publish after pilot | Internal package release only after acceptance plan and one pilot are green | Platform lead | ITS-ai-dashboard-builder-001 | Packages remain private and product consumption path stays ambiguous. |
| First pilot product | Keep mocked app only; wire full-template playground; integrate one real product SDK | Integrate one real product SDK in a bounded pilot while preserving `apps/product-integration` as a testable example | Product/platform lead | ITS-ai-dashboard-builder-003 | Runtime contracts may pass locally but fail product ergonomics. |
| Generator execution path | Manual prompt workflow; local CLI; internal service; host-provided orchestration | For v0.1, use local-agent-assisted file workflow through Codex/OpenCode-style tools; defer manager workbench and bridge implementation | Platform lead | ITS-ai-dashboard-builder-006 | Closed for v0.1 by `docs/ai-dashboard-v0.1-adoption.md`; workbench bridge is ITS-011. |
| Generated chart preview host | CLI first; management UI first; defer generated chart preview | CLI first with strict CSP/origin/session-bound postMessage contract | Security/platform lead | ITS-ai-dashboard-builder-005 | Closed for v0.1 sandbox gate; concrete host UI remains product/CLI owned. |
| Production config-error UX ownership | Runtime renders; host renders; hybrid typed errors plus dev detail | Hybrid: host blocks invalid dashboards before runtime; runtime fallback shows details only in development and concise copy in production | Platform lead plus product lead | ITS-ai-dashboard-builder-004 | Closed for v0.1 by `docs/ai-dashboard-v0.1-adoption.md`. |
| Bundle/performance budget | Accept warnings; lazy-load widgets; split charts by renderer; defer budget | Accept current warning for v0.1 only while explicit hard ceilings pass | Platform lead | ITS-ai-dashboard-builder-007 | Closed for v0.1 by `release-gate.md`; lazy loading remains a follow-up. |

## Rejected / Not Roadmap-Relevant

- Unified data warehouse / data middle platform is out of scope for this v0.1 roadmap (`doc.md:39`, `.idea-to-ship/ai-dashboard-builder/requirements.md:44`).
- Forced backend API redesign is out of scope (`doc.md:40`, `.idea-to-ship/ai-dashboard-builder/requirements.md:45`).
- Complete BI semantic layer, dashboard editor, version management, release management, and component marketplace are not first-stage deliverables (`.idea-to-ship/ai-dashboard-builder/requirements.md:49`, `.idea-to-ship/ai-dashboard-builder/requirements.md:54`).
- `openUrl` / `navigate` event actions are excluded from MVP default capability (`.idea-to-ship/ai-dashboard-builder/requirements.md:53`, `.idea-to-ship/ai-dashboard-builder/architecture.md:29`).
- A model-specific AI service is not required by the reviewed architecture; the v0.1 contract remains model-agnostic (`.idea-to-ship/ai-dashboard-builder/architecture.md:661`).

<!-- idea-to-ship:roadmap generated:end -->
