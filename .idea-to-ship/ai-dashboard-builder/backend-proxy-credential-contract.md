# Backend Proxy And Credential Contract

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-012
**Status:** Contract locked; production service implementation deferred
**Owners:** Security/platform lead plus frontend platform team

## Decision

Backend URL and JWT input belongs to a server-side proxy boundary. DashboardConfig, AI prompts, AI catalogs, local agent tasks, and generated widget packages must never contain backend URLs, JWTs, cookies, auth headers, or raw production responses.

For local v0.1 preview, `apps/product-integration` exposes a Vite `/apis` proxy configured by environment variables. For a future manager workbench, the same boundary must move to a workbench server or product-owned preview service.

## Local Preview Contract

Environment variables:

| Name | Purpose | UI/Log Handling |
|---|---|---|
| `PRODUCT_API_URL` | Backend target for `/apis` | Redact full value in diagnostics |
| `PRODUCT_AUTH_TOKEN` | JWT bearer token injected server-side | Always redacted |
| `PRODUCT_API_ALLOWED_HOSTS` | Optional comma-separated allowlist of `host[:port]` values | Redact full value in diagnostics |

Behavior:

- `/apis/*` requests are proxied to `PRODUCT_API_URL`.
- `Authorization: Bearer <PRODUCT_AUTH_TOKEN>` is injected by the server-side proxy when a token is provided.
- `PRODUCT_API_URL` must be absolute `http` or `https`.
- If `PRODUCT_API_ALLOWED_HOSTS` is set, the target host must match the allowlist.
- HTTPS targets use TLS verification by default in the generated proxy config.

## Workbench Production Contract

A production workbench proxy must add:

- URL allowlist managed by product/platform owners.
- Short-lived JWT storage with explicit expiration.
- Redacted diagnostics and audit events.
- Request size/rate limits.
- Response redaction before any sample is saved as generation evidence.
- Clear separation between preview credentials and local agent inputs.

The local agent can receive only redacted proxy status, such as `configured`, `missing token`, or `backend unreachable`.

## No-Go Conditions

- DashboardConfig contains backend URLs or auth material.
- AI catalog examples are populated from raw production responses.
- Local agent tasks include JWTs, cookies, auth headers, or raw backend responses.
- Workbench UI stores LLM provider keys or backend JWTs in generated source files.
- Proxy target accepts arbitrary hosts without an allowlist in shared environments.

## Verification

- `apps/product-integration/src/proxy-config.ts` implements the local preview proxy config as a testable pure function.
- `apps/product-integration/src/__tests__/proxy-config.test.ts` verifies fake backend URL/JWT header injection, URL scheme rejection, host allowlist rejection, and diagnostic redaction.
- `apps/product-integration/vite.config.ts` uses the shared proxy config helper.
