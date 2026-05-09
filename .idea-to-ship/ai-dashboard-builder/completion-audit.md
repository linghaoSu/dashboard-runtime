# Completion Audit - ai-dashboard-builder roadmap

**Date:** 2026-05-09 19:01 CST
**Objective Audited:** Implement the current roadmap.
**Auditor:** Codex
**Verdict:** Not complete. All repo-local roadmap deliverables are implemented and verified, and the local ipavo pilot is now calibrated against and depends on `@daocloud-proto/ipavo@0.13.0`. The objective cannot be marked complete because ITS-ai-dashboard-builder-003 still requires backend URL/JWT/allowlist access for a live pilot.

## Concrete Success Criteria

The current roadmap is complete only when:

1. Every roadmap item in Now, Next, Later, and user-added productization follow-ups has an artifact or implementation matching its release gate.
2. Every required command in the release gate passes in the current worktree.
3. The ipavo product pilot has moved beyond local SDK-shaped simulation to real `@daocloud-proto/*` package/backend/JWT execution, or the roadmap explicitly scopes that live run out.
4. v0.1 GO blockers are either closed or intentionally held with named external owners.

## Prompt-To-Artifact Checklist

| Requirement / Request | Evidence | Status | Audit Note |
|---|---|---|---|
| Use `doc.md` as local source for slug `ai-dashboard-builder` and horizon `0.1` | `.idea-to-ship/ai-dashboard-builder/requirements.md`, `architecture.md`, `roadmap.md` | Covered | Roadmap source scope remains local-only. |
| Capacity is 5 frontend engineers | `.idea-to-ship/ai-dashboard-builder/roadmap.md` frontmatter and owner fields | Covered | Capacity is recorded in roadmap metadata. |
| Prioritized Now item ITS-001 release gate | `.idea-to-ship/ai-dashboard-builder/release-gate.md` | Covered, final GO held | Gate is defined, but sign-off remains pending. |
| Prioritized Now item ITS-008 acceptance test plan | `.idea-to-ship/ai-dashboard-builder/test-plan.md` | Covered | Current evidence is 18 files / 86 tests. |
| Prioritized Now item ITS-002 adoption guide | `docs/ai-dashboard-v0.1-adoption.md` | Covered | Guide documents dataSources, widgets, i18n, validation, CSS imports, SDK replacement, and proxy boundaries. |
| ITS-010 package publishing surface | `.idea-to-ship/ai-dashboard-builder/package-publishing-surface.md`, package manifests, `packages/ai-dashboard-widgets/tsconfig.build.json` | Covered, registry publish blocked | Internal source/tarball surface is prepared; registry publishing remains intentionally blocked. |
| ITS-003 first real product SDK pilot | `.idea-to-ship/ai-dashboard-builder/ipavo-product-pilot.md`, `.idea-to-ship/ai-dashboard-builder/live-pilot-input-request.md`, `.idea-to-ship/ai-dashboard-builder/external-blockers.md`, `apps/product-integration/package.json`, `apps/product-integration/src/dashboards/ipavo-overview.ts`, `apps/product-integration/src/data-sources/ipavo-overview.ts`, `apps/product-integration/src/product-sdk/generated/ipavo-overview.ts`, `apps/product-integration/src/product-sdk/ipavo-live-contract.ts`, `apps/product-integration/src/__tests__/ipavo-live-contract.test.ts`, `apps/product-integration/src/__tests__/ipavo-live-backend-script.test.ts`, `apps/product-integration/src/__tests__/ipavo-live-pilot-script.test.ts`, `apps/product-integration/src/__tests__/roadmap-completion-script.test.ts`, `scripts/check-ipavo-live-pilot.mjs`, `scripts/check-ipavo-live-backend.mjs`, `scripts/check-roadmap-completion.mjs` | Partially covered | Local ipavo-style dashboard and dataSources are calibrated against `@daocloud-proto/ipavo@0.13.0` signatures, including optional fields, string sample pairs, and `displayType`. Real SDK dependency/import contract, preflight, live-run input request, external blocker register, opt-in backend smoke, no-network script guard tests, markdown/source auth-material safety, and an executable roadmap-completion blocker gate exist; backend/JWT live execution is still missing. |
| ITS-004 production config-error UX contract | `.idea-to-ship/ai-dashboard-builder/config-error-ux-contract.md`, `packages/ai-dashboard-vue/src/BigScreenRuntime.vue`, `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts` | Covered | Development shows schema details; production redacts raw validation details. |
| ITS-007 performance and bundle budgets | `.idea-to-ship/ai-dashboard-builder/performance-bundle-budget.md`, `scripts/check-bundle-budget.mjs`, root `check:bundle-budget` script | Covered | Budget script passes against current build artifacts. |
| ITS-006 generator execution path | `.idea-to-ship/ai-dashboard-builder/generator-execution-path.md`, `.idea-to-ship/ai-dashboard-builder/generator-sample-plan.json`, `packages/ai-dashboard-ai-catalog/src/prompt-templates.ts` | Covered | v0.1 uses local-agent-assisted workflow; no hosted LLM. |
| ITS-005 generated chart preview security | `.idea-to-ship/ai-dashboard-builder/generated-chart-preview-security-policy.md`, `packages/ai-dashboard-sandbox/src/preview-contract.ts`, `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts` | Covered | CSP/origin/session/message validation is implemented and tested. |
| ITS-009 full-template playground stance | `.idea-to-ship/ai-dashboard-builder/playground-host-integration.md`, `playground/playground-ui` build | Covered | Playground is validated as standalone reference-only host. |
| Manager-facing web UI direction | `.idea-to-ship/ai-dashboard-builder/workbench-agent-bridge-architecture.md` | Covered as architecture | Actual UI implementation is post-v0.1/productization work. |
| Connect to local Codex/OpenCode rather than create own LLM | `generator-execution-path.md`, `workbench-agent-bridge-architecture.md` | Covered as contract | Bridge protocol and permission model are documented; implementation deferred. |
| Product SDK packages are shaped like `@daocloud-proto/*` | `docs/ai-dashboard-v0.1-adoption.md`, `ipavo-product-pilot.md`, `apps/product-integration/package.json`, `apps/product-integration/src/data-sources/ipavo-overview.ts` | Covered | `@daocloud-proto/ipavo@0.13.0` is installed for the product integration example. |
| Real backend URL/token entered through UI/server proxy, JWT auth header server-side | `.idea-to-ship/ai-dashboard-builder/backend-proxy-credential-contract.md`, `apps/product-integration/src/proxy-config.ts`, `apps/product-integration/src/__tests__/proxy-config.test.ts` | Covered locally | Local Vite proxy helper is implemented and tested with fake backend/JWT; production workbench proxy is deferred. |
| Dashboard layout design should use design.md evidence/current best practice | `docs/design.md`, `generator-execution-path.md`, `generator-sample-plan.json`, layout catalog references | Covered | `design.md` defines layout principles, fixed canvas guidance, and the `ipavo-console-overview` preset now exported by the layout catalog. |
| Charts should support global palettes plus per-chart override palettes | `docs/design.md`, schema/chart tests, `apps/product-integration/src/dashboards/ipavo-overview.ts` | Covered | Regression tests cover global palette, per-widget override, short palette fallback, semantic gauge colors, and the `ipavo-console-light` palette alternative. |
| Pre-generate aesthetically useful palettes | `docs/design.md` | Covered | Prebuilt palette starting points are documented. |
| Chart insufficiency flow can fetch ECharts charts and generate widgets after approval | `.idea-to-ship/ai-dashboard-builder/chart-extension-promotion-flow.md`, `docs/mcp-echarts.md`, sandbox tests | Covered as workflow/security contract | Actual chart browser UI and online fetch integration are future work. |
| Target can configure a dashboard similar to the supplied ipavo screenshot | `apps/product-integration/src/dashboards/ipavo-overview.ts`, product-owned ipavo widgets, product dev server | Covered locally | Render target is available locally; live backend data remains blocked. |

## Current Verification Evidence

Commands rerun in the current worktree on 2026-05-09:

| Command | Result | Notes |
|---|---|---|
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with accepted warnings | Demo JS 824.27 kB, product integration JS 909.69 kB; Vite chunk warnings are accepted while budget passes |
| `pnpm run check:bundle-budget` | PASS | Product integration total JS 889.4 KiB raw / 284.2 KiB gzip <= 950 KiB; all app/package JS/CSS ceilings pass |
| `pnpm --dir playground/playground-ui run build` | PASS with accepted warnings | Known `input-placeholder` warnings; largest JS chunk 576.9 kB |
| `pnpm run check:ipavo-live-pilot` | FAIL as expected | SDK package passes; blocks on missing backend URL, JWT, and allowlist |
| `pnpm run check:ipavo-live-backend` | FAIL as expected | Blocks before network call because backend URL, JWT, and allowlist are not configured |
| `pnpm run check:roadmap-completion` | FAIL as expected | Artifact/source/script/product-SDK/env-example placeholder/external-blocker/status/evidence-freshness/markdown-and-source auth-material/audit-verdict surface passes; blocks on live ipavo backend/JWT gate |
| `PRODUCT_IPAVO_VERSION_PATH=https://evil.example pnpm run check:ipavo-live-backend` | FAIL as expected | Blocks before network because endpoint overrides must be backend paths, not full URLs |
| `PRODUCT_API_TIMEOUT_MS=0 pnpm run check:ipavo-live-backend` | FAIL as expected | Blocks before network because timeout must be positive |
| secret scan, working tree | PASS after triage | One likely false-positive redacted token-diagnostic assignment; no confirmed leak |
| `git diff --check` | PASS | No whitespace errors |
| local preview health check | PASS, then stopped | Product integration dev server returned HTTP 200 during verification; port 5174 is no longer left listening |

## Missing Or Weakly Verified Requirements

1. **ITS-ai-dashboard-builder-003 live SDK/backend execution remains incomplete.**
   - `@daocloud-proto/ipavo@0.13.0` is installed and passes preflight.
   - Missing real backend URL.
   - Missing real JWT/token.
   - `pnpm run check:ipavo-live-pilot` is now the executable blocker check.
   - `pnpm run check:ipavo-live-backend` is now the opt-in live backend smoke once env values exist.
   - Optional smoke endpoint overrides exist as path-only env values and cannot bypass the backend host allowlist.
   - Current evidence verifies only the local SDK-shaped ipavo pilot with fake/local data.
   - External owner handoff is tracked as EB-001 in `external-blockers.md`.

2. **Final v0.1 GO is still held by release process, not by tests.**
   - `release-gate.md` requires final-candidate review and platform-lead sign-off.
   - EB-002 and EB-003 in `external-blockers.md` track sign-off and release-candidate cleanliness.
   - The worktree is intentionally dirty with roadmap implementation changes and has not been turned into a reviewed release candidate.

3. **Productized workbench and chart browser are architecture/workflow complete, not implemented UI.**
   - This matches the current roadmap status, but it is not a shipped productized manager UI.

## Next Required Action

To actually complete the roadmap objective, choose one of these:

1. Provide real product inputs for ITS-ai-dashboard-builder-003:
   - real backend URL,
   - JWT/token suitable for local preview,
   - `PRODUCT_API_ALLOWED_HOSTS` entry matching the backend host,
   - expected endpoint/method mapping if it differs from the local SDK-shaped pilot.
   - See `.idea-to-ship/ai-dashboard-builder/live-pilot-input-request.md` for the exact handoff checklist and approved local commands.

2. Or explicitly revise the roadmap so ITS-ai-dashboard-builder-003's live backend run is out of scope for the current objective, leaving only the local pilot artifact as the v0.1 completion criterion.

Until one of those happens, the active goal should remain open.
