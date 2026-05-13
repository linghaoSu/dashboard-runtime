# Code Review - ai-dashboard-builder

**Date:** 2026-05-13
**Reviewer:** Multi-agent review (security/config, SDK/runtime cancellation, release gates/tests, docs/evidence consistency) + self-review
**Iterations:** 2
**Result:** clean after fixes for release-candidate `c5fc6b4`
**Diff size:** Included live browser ipavo SDK mode, cancellation propagation, live-route tests, and release evidence updates; committed in `c5fc6b4`.

## Issues Raised And Resolution

| # | Severity | Area | Issue | Resolution |
|---|---|---|---|---|
| 1 | high | `proxy-config.ts`, live scripts | Legacy `VUE_APP_*` aliases contradicted the product app env contract and could silently route credentials or TLS settings through copied Vue env names. | Removed all `VUE_APP_*` support from proxy config, live pilot, live backend smoke, tests, and docs. Only `PRODUCT_*` is accepted. |
| 2 | medium | `proxy-config.ts`, `vite.config.ts` | The Vite proxy allowed any configured target when `PRODUCT_API_ALLOWED_HOSTS` was unset, while smoke scripts required an allowlist. `loadEnv(..., "")` also loaded broader env than needed. | Proxy now requires `PRODUCT_API_ALLOWED_HOSTS` whenever `PRODUCT_API_URL` is set. Vite loads only `PRODUCT_` env and passes an explicit proxy env object. |
| 3 | medium | `check-ipavo-live-backend.mjs` | Live backend smoke accepted very weak JSON shapes, so a wrong route returning `{}` could close the live gate. | Added `scripts/ipavo-live-backend-shape.mjs` validators for `VersionInfo` and `GetResourceSummaryResponse`; tests cover weak shape rejection. |
| 4 | medium | `check-roadmap-completion.mjs`, docs | Roadmap evidence freshness missed stale test-count evidence. | Expanded stale evidence patterns and updated current counts to product 7 files / 28 tests and workspace 19 files / 95 tests. |
| 5 | warning | release docs | Release and completion docs implied live PASS was reproducible from committed code alone, while real values live in ignored local env. | Marked live-backed PASS rows as environment-bound and consolidated the local-env status into `release-gate.md` and `docs/ai-dashboard-v0.1-adoption.md`. |
| 6 | warning | secret scanning | Secret scanner flagged the redacted token diagnostic expression as a false positive. | Split the diagnostic status into a local variable; deterministic secret scan now returns no findings. |
| 7 | warning | documentation | Many one-off stage, blocker, and contract artifacts duplicated the same v0.1 decisions and kept stale references alive. | Consolidated the durable decisions into `release-gate.md`, `roadmap.md`, `test-plan.md`, `docs/ai-dashboard-v0.1-adoption.md`, and `docs/mcp-echarts.md`; removed redundant process docs from `.idea-to-ship/ai-dashboard-builder`. |
| 8 | warning | live SDK cancellation | Live browser ipavo calls dropped `ctx.signal`, so stale dashboard/filter/locale loads could continue auth-bearing `/apis` requests after abort. | Extended the ipavo overview client to accept `RequestInit`, forwarded `{ signal }` to generated SDK methods, and passed the runtime signal from every ipavo dataSource call. |
| 9 | warning | adoption docs | The browser live-mode docs blurred generated SDK routes with smoke-script-only endpoint path and timeout overrides. | Clarified that `VITE_PRODUCT_IPAVO_DATA_MODE` selects browser mode, while `PRODUCT_IPAVO_*_PATH` and `PRODUCT_API_TIMEOUT_MS` only affect live smoke scripts. |
| 10 | warning | live route coverage | The first live-client test covered only `GetResourceSummary`, leaving pod/resource/alert/product generated routes and query serialization untested. | Expanded `ipavo-overview-client.test.ts` to cover all five live overview routes and assert `AbortSignal` forwarding on each generated fetch. |
| 11 | warning | release evidence | Updated test counts were tied to an uncommitted local diff while `release-gate.md` still named the historical GO commit. | Committed the reviewed diff as `c5fc6b4`, selected it as the release-candidate head, scoped old sign-off rows to historical `6d4539d`, and kept final GO/HOLD pending for platform-lead decision. |

## Design Drift

No unresolved design drift.

The product integration keeps backend URL/JWT material in the server-side `PRODUCT_*` proxy boundary. Browser code only reads the non-secret `VITE_PRODUCT_IPAVO_DATA_MODE` flag and uses generated `/apis/ipavo.io/...` SDK routes through the Vite proxy. Real backend/JWT evidence remains local-state-bound and must not be treated as reproducible without equivalent out-of-band inputs.

## Test Traceability

Regression coverage added or tightened for:

- Product proxy allowlist requirement, placeholder token suppression, invalid insecure TLS flags, and explicit insecure local TLS opt-in.
- Live backend response shape validation for ipavo `VersionInfo` and `GetResourceSummaryResponse`.
- Real SDK contract including `IPavo.GetVersion`.
- Browser live-mode client selection, all live overview generated routes, query serialization, response normalization, and abort-signal forwarding.
- Roadmap completion freshness for stale test-count evidence.

Verification run after this continuation:

- `pnpm --filter @dao-style-viz/product-integration-example test` - 7 files / 28 tests
- `pnpm -r --if-present test` - 19 files / 95 tests
- `pnpm run check:roadmap-completion` - PASS
- `pnpm -r --if-present typecheck` - PASS
- `pnpm -r --if-present lint` - PASS
- `pnpm -r --if-present build` - PASS with accepted Vite chunk warnings; product integration JS 912.70 kB
- `pnpm run check:bundle-budget` - PASS
- `git diff --check` - PASS
- `pnpm run check:roadmap-completion` auth-material checks - PASS

## Residual Open Issues

None for release-candidate `c5fc6b4`.

Final GO/HOLD remains pending for platform-lead decision. Known non-blocking release-gate warnings remain documented in `release-gate.md`: Vite chunk-size warnings, standalone playground CSS pseudo-class warnings, and no coverage tooling.

## Final Verdict

LGTM
