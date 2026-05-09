# External Blockers - ai-dashboard-builder roadmap

**Date:** 2026-05-09
**Objective:** Implement the current roadmap.
**Status:** Open. Repo-local implementation is ready, but full roadmap closure is blocked by product-owned live backend inputs and final release sign-off.

## Blocker Register

| ID | Blocks | Owner | Needed Decision Or Input | Current Evidence | Close Condition |
|---|---|---|---|---|---|
| EB-001 | ITS-ai-dashboard-builder-003 live product SDK pilot | Product frontend pilot owner + product/backend access owner | Provide `PRODUCT_API_URL`, `PRODUCT_AUTH_TOKEN`, and `PRODUCT_API_ALLOWED_HOSTS` out of band; optionally provide endpoint path overrides if product backend paths differ | `live-pilot-input-request.md`, `apps/product-integration/.env.example`, `scripts/check-ipavo-live-pilot.mjs`, `scripts/check-ipavo-live-backend.mjs` | `pnpm run check:ipavo-live-pilot`, `pnpm run check:ipavo-live-backend`, and `pnpm run check:roadmap-completion` pass without committing secrets |
| EB-002 | v0.1 internal GO announcement | Platform lead | Confirm final candidate branch/commit, accepted warnings, and consumption model | `release-gate.md` | `release-gate.md` sign-off table is updated after final-candidate checks pass |
| EB-003 | Final release candidate cleanliness | Frontend platform owner | Review current dirty working tree and decide release-candidate diff | `git status --short`, `release-gate.md` RG-10 | Working tree contains only intended release candidate changes, or a clean branch/commit is selected |
| EB-004 | Registry/package-manager publishing | Frontend platform owner + package registry owner | Decide registry namespace, package access, provenance, versioning, and publish workflow | `package-publishing-surface.md` | Registry blockers in `package-publishing-surface.md` are closed; not required for v0.1 internal source consumption |
| EB-005 | Productized manager workbench and chart browser UI | Product/platform planning owner | Decide post-v0.1 productization scope and staffing | `workbench-agent-bridge-architecture.md`, `chart-extension-promotion-flow.md` | Future roadmap item is created; not required for v0.1 internal source readiness |

## Handling Rules

- Do not commit real backend URLs, JWTs, cookies, auth headers, or raw production responses.
- Do not paste auth material into DashboardConfig, AI prompt payloads, catalog metadata, generated widget packages, or markdown artifacts.
- Run live checks only in a local shell where env values are injected for the process.
- If a blocker is intentionally scoped out, update `roadmap.md`, `release-gate.md`, `completion-audit.md`, and this file in the same change.

## Current Operator Command

```sh
pnpm run check:roadmap-completion
```

Expected current result: FAIL until EB-001 is closed or ITS-ai-dashboard-builder-003 live backend execution is explicitly scoped out.
