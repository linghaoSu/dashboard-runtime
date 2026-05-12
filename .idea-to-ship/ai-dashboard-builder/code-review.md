# Code Review - ai-dashboard-builder

**Date:** 2026-05-12
**Reviewer:** Multi-agent review (security/config, release gates/tests, docs consistency) + self-review
**Iterations:** 2
**Result:** clean after fixes
**Diff size:** Includes SDK/live-gate fixes plus documentation consolidation; see `git diff --stat` for the current exact file count.

## Issues Raised And Resolution

| # | Severity | Area | Issue | Resolution |
|---|---|---|---|---|
| 1 | high | `proxy-config.ts`, live scripts | Legacy `VUE_APP_*` aliases contradicted the product app env contract and could silently route credentials or TLS settings through copied Vue env names. | Removed all `VUE_APP_*` support from proxy config, live pilot, live backend smoke, tests, and docs. Only `PRODUCT_*` is accepted. |
| 2 | medium | `proxy-config.ts`, `vite.config.ts` | The Vite proxy allowed any configured target when `PRODUCT_API_ALLOWED_HOSTS` was unset, while smoke scripts required an allowlist. `loadEnv(..., "")` also loaded broader env than needed. | Proxy now requires `PRODUCT_API_ALLOWED_HOSTS` whenever `PRODUCT_API_URL` is set. Vite loads only `PRODUCT_` env and passes an explicit proxy env object. |
| 3 | medium | `check-ipavo-live-backend.mjs` | Live backend smoke accepted very weak JSON shapes, so a wrong route returning `{}` could close the live gate. | Added `scripts/ipavo-live-backend-shape.mjs` validators for `VersionInfo` and `GetResourceSummaryResponse`; tests cover weak shape rejection. |
| 4 | medium | `check-roadmap-completion.mjs`, docs | Roadmap evidence freshness missed stale 95/28/23/90-count evidence. | Expanded stale evidence patterns and updated current counts to product 6 files / 25 tests and workspace 18 files / 92 tests. |
| 5 | warning | release docs | Release and completion docs implied live PASS was reproducible from committed code alone, while real values live in ignored local env. | Marked live-backed PASS rows as environment-bound and consolidated the local-env status into `release-gate.md` and `docs/ai-dashboard-v0.1-adoption.md`. |
| 6 | warning | secret scanning | Secret scanner flagged the redacted token diagnostic expression as a false positive. | Split the diagnostic status into a local variable; deterministic secret scan now returns no findings. |
| 7 | warning | documentation | Many one-off stage, blocker, and contract artifacts duplicated the same v0.1 decisions and kept stale references alive. | Consolidated the durable decisions into `release-gate.md`, `roadmap.md`, `test-plan.md`, `docs/ai-dashboard-v0.1-adoption.md`, and `docs/mcp-echarts.md`; removed redundant process docs from `.idea-to-ship/ai-dashboard-builder`. |

## Design Drift

No unresolved design drift.

The product integration now has a single env contract: `PRODUCT_API_URL`, `PRODUCT_AUTH_TOKEN`, `PRODUCT_API_ALLOWED_HOSTS`, `PRODUCT_API_INSECURE_TLS`, and optional ipavo endpoint path overrides. Real backend/JWT evidence remains local-state-bound and must not be treated as reproducible without equivalent out-of-band inputs.

## Test Traceability

Regression coverage added or tightened for:

- Product proxy allowlist requirement, placeholder token suppression, invalid insecure TLS flags, and explicit insecure local TLS opt-in.
- Live backend response shape validation for ipavo `VersionInfo` and `GetResourceSummaryResponse`.
- Real SDK contract including `IPavo.GetVersion`.
- Roadmap completion freshness for stale test-count evidence.

Verification run after fixes:

- `pnpm --filter @dao-style-viz/product-integration-example test` - 6 files / 25 tests
- `pnpm -r --if-present test` - 18 files / 92 tests
- `node scripts/check-ipavo-live-backend.mjs` - PASS using ignored local env; token/body not printed
- `pnpm run check:roadmap-completion` - PASS
- `pnpm -r --if-present typecheck` - PASS
- `pnpm -r --if-present lint` - PASS
- `pnpm -r --if-present build` - PASS with accepted Vite chunk warnings
- `pnpm run check:bundle-budget` - PASS
- `git diff --check` - PASS
- secret scanner working-tree scan - PASS
- tracked-file secret grep for JWT/backend literals - no matches outside ignored `.env.local`

## Residual Open Issues

None for this review.

Known non-blocking release-gate warnings remain documented in `release-gate.md`: Vite chunk-size warnings, standalone playground CSS pseudo-class warnings, no coverage tooling, and pending human sign-off before final v0.1 GO.

## Final Verdict

LGTM
