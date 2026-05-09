# Live Pilot Input Request - Ipavo

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-003
**Status:** Waiting for product-owned inputs
**Purpose:** Capture the exact inputs needed to finish the real ipavo SDK/backend/JWT pilot without leaking secrets into repo files, prompts, DashboardConfig, or logs.

## Required Inputs

The product owner or platform owner must provide these values out of band:

| Input | Required | Notes |
|---|---|---|
| `PRODUCT_API_URL` | Yes | Absolute `http` or `https` backend URL for ipavo `/apis` calls. |
| `PRODUCT_AUTH_TOKEN` | Yes | JWT suitable for local preview. Do not commit it or paste it into prompts. |
| `PRODUCT_API_ALLOWED_HOSTS` | Yes | Comma-separated allowlist containing the host portion of `PRODUCT_API_URL`, including port when present. |
| `PRODUCT_IPAVO_VERSION_PATH` | Optional | Defaults to `/apis/ipavo.io/v1alpha1/version`; must be a backend path, not a full URL. |
| `PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH` | Optional | Defaults to `/apis/ipavo.io/v1alpha1/resource/summary`; must be a backend path, not a full URL. |
| Endpoint mapping notes | If different | Required only if the two path env values above are not enough to describe the product backend mapping. |
| Token expiry / scope | Recommended | Helps distinguish auth failure from endpoint/schema failure. |

## Approved Local Execution

Run these commands only in a local shell with environment variables set for the current process. Do not write real values into `.env`, committed files, markdown artifacts, DashboardConfig, prompt payloads, or catalog examples.

```sh
export PRODUCT_API_URL="https://example.internal"
export PRODUCT_AUTH_TOKEN="<jwt>"
export PRODUCT_API_ALLOWED_HOSTS="example.internal"
export PRODUCT_API_TIMEOUT_MS="10000"
export PRODUCT_IPAVO_VERSION_PATH="/apis/ipavo.io/v1alpha1/version"
export PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH="/apis/ipavo.io/v1alpha1/resource/summary"

pnpm run check:ipavo-live-pilot
pnpm run check:ipavo-live-backend
```

The current scripts intentionally redact token values and do not print response bodies. Endpoint overrides are path-only so they cannot bypass `PRODUCT_API_ALLOWED_HOSTS`.

## Success Criteria

The live pilot blocker is closed only when:

1. `pnpm run check:ipavo-live-pilot` passes with `@daocloud-proto/ipavo@0.13.0`.
2. `pnpm run check:ipavo-live-backend` reaches the backend, receives successful HTTP responses, and validates minimal JSON shape.
3. No backend URL, JWT, cookie, auth header, or raw production response is committed or added to DashboardConfig, AI catalogs, prompt examples, or generated widget packages.
4. The completion audit is updated with the command output summary and the remaining v0.1 GO decision.

## No-Go Conditions

- A JWT or backend URL is committed to the repo.
- A prompt, local-agent task, or DashboardConfig contains auth material or raw production responses.
- The live smoke requires disabling allowlist validation.
- Endpoint path overrides contain full URLs or protocol-relative URLs.
- The live smoke prints response bodies or token values.
- Product SDK request/auth logic leaks into AI-facing catalog output.

## Current State

The repo-local work is ready for the live run:

- `@daocloud-proto/ipavo@0.13.0` is installed in `apps/product-integration`.
- `scripts/check-ipavo-live-pilot.mjs` verifies the SDK package/import preflight plus required env.
- `scripts/check-ipavo-live-backend.mjs` performs the opt-in backend smoke once env exists.
- `apps/product-integration/src/proxy-config.ts` injects the JWT server-side for local `/apis` proxy previews.
- `apps/product-integration/.env.example` documents placeholder env names only.

The live run is not complete because the required product-owned backend URL, JWT, and allowlist have not been provided in this workspace.
