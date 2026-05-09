# Production Config-Error UX Contract

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-004
**Status:** Locked for v0.1
**Owners:** Frontend platform team plus product host owner

## Decision

Use a hybrid contract:

1. Product hosts run `validateDashboardConfig` before rendering and block invalid dashboards.
2. `BigScreenRuntime` keeps a config-level fallback for invalid configs that reach the runtime.
3. Development mode may show schema issue details for fast debugging.
4. Production mode must show a concise user-facing error and must not expose Zod paths, raw validation messages, stack traces, SDK details, tokens, backend URLs, or headers.

This keeps generated-dashboard failures explicit without leaking developer-only implementation detail to product users.

## Runtime Contract

`BigScreenRuntime` accepts:

| Prop | Required | Meaning |
|---|---:|---|
| `configErrorMode` | no | `"development"` shows issue details; `"production"` hides details. Defaults to `import.meta.env.DEV ? "development" : "production"`. |
| `configErrorTitle` | no | Optional host-provided title for invalid config fallback. |
| `configErrorMessage` | no | Optional host-provided body copy for invalid config fallback. |

Default copy:

| Mode | Title | Message |
|---|---|---|
| development | `Dashboard config validation failed` | `Fix the DashboardConfig issues below before rendering.` |
| production | `Dashboard unavailable` | `The dashboard configuration is invalid. Contact the dashboard owner.` |

The runtime fallback renders `role="alert"`. In development mode it renders a list of schema issue details. In production mode it renders no details list.

## Product Host Contract

Product hosts should validate before rendering:

1. Run `validateDashboardConfig(config, { dataSources, widgets })` at module load or before screen render.
2. If validation fails, do not mount `BigScreenRuntime`.
3. Use the same development/production mode split as the runtime.
4. In development, show issue details to product engineers.
5. In production, show concise dashboard-unavailable copy and route details to logs or product-owned diagnostics outside the dashboard UI.

The product integration app demonstrates this in `apps/product-integration/src/screens/TenantCapacityScreen.vue`.

## No-Go Conditions

- Production UI shows Zod issue paths or raw validation messages.
- Invalid configs silently render a blank canvas.
- DashboardConfig, AI catalog output, prompt payloads, or validation UI include JWTs, cookies, backend URLs, auth headers, SDK source, or raw production responses.
- A product host bypasses `validateDashboardConfig` and depends only on runtime fallback validation.

## Verification

- `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts` covers development details and production redaction behavior.
- `apps/product-integration/src/screens/TenantCapacityScreen.vue` uses the same mode split for the host-side validation gate.
