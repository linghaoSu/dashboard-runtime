# Ipavo Product SDK Pilot - AI Dashboard Builder

**Date:** 2026-05-09 16:32 CST
**Roadmap Item:** ITS-ai-dashboard-builder-003
**Reference Product:** `/Users/sulinghao/workspaces/dce5/ipavo-ui`
**Current Verdict:** Local pilot implemented with ipavo-style generated SDK shape; real backend execution requires product SDK package access and JWT proxy configuration

## Product Reference

The reference dashboard is the root micro-frontend app in `ipavo-ui`:

- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/App.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/LayoutItem.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/HoneyComb.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/HealthStatus.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/AlertStatus.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/ClusterCount.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/ResourceUsage.vue`
- `/Users/sulinghao/workspaces/dce5/ipavo-ui/src/components/AbilityOverview.vue`

The top DaoCloud shell is host-provided. The dashboard app itself is the card grid below the shell.

## Current Pilot Implementation

The current workspace now includes an ipavo-style dashboard under `apps/product-integration`:

- `src/dashboards/ipavo-overview.ts` — DashboardConfig matching the screenshot layout: pod statistics, CPU/memory usage, health status, alerts, cluster count, resource usage, and ability overview.
- `src/data-sources/ipavo-overview.ts` — dataSources wrapping generated-SDK-shaped static service methods.
- `src/product-sdk/generated/ipavo-overview.ts` — local mock of the ipavo generated SDK shape.
- `src/widgets/ipavo/*` — host-owned ipavo presentation widgets for product-specific visuals not covered by the generic widget catalog.
- `src/dashboards/ipavo-overview.i18n/*` — dashboard-owned locale resources.
- `src/screens/TenantCapacityScreen.vue` — selector for `ipavo-overview` and the existing `tenant-capacity` dashboard.

This proves the target dashboard can be represented as DashboardConfig plus product-owned dataSources/widgets.

## Real SDK Contract

In a real ipavo pilot, replace the local mock SDK import with generated npm packages:

```ts
import { IPavo } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo.pb";
```

The SDK methods remain static methods such as:

- `IPavo.GetResourceSummary({})`
- `IPavo.GetAlertSummary({})`
- `IPavo.GetResourceUsage({})`
- `IPavo.ListProducts({})`
- `IPavo.GetPodSummary({ type })`

The dashboard platform must not expose SDK implementation, tokens, cookies, permission logic, or raw sensitive responses to AI catalog output. AI sees only dataSource metadata, schemas, compatibility, and redacted/mock examples.

## Backend Proxy And JWT Boundary

The product host or management server owns backend routing and auth. The reference product uses a dev proxy like:

```ts
proxy: {
  "/apis": {
    target: process.env.VUE_APP_API_URL || "http://localhost:8080",
    headers: {
      Authorization: `Bearer ${process.env.VUE_APP_AUTH}`
    },
    secure: false
  }
}
```

For this repo's product-integration app, the equivalent local proxy knobs are:

```sh
PRODUCT_API_URL=http://localhost:8080
PRODUCT_AUTH_TOKEN=<jwt>
```

The proxy injects `Authorization: Bearer <jwt>` for `/apis`. DashboardConfig must never contain backend URLs, JWTs, or auth headers.

## Manager-Facing Workbench Target

The ideal product should be a web management UI for product managers or engineering managers:

1. User selects a product SDK package/capability set, or enters backend URL plus token for a server-side proxy.
2. The UI introspects registered dataSource catalogs, widget catalogs, layout presets, theme palettes, and generated chart candidates.
3. The user chats with an agent to generate a DashboardPlan and DashboardConfig.
4. The user adjusts layout, copy, palettes, data bindings, and chart choices in the UI.
5. The UI validates every output against schema, registries, sandbox gates, and product auth boundaries.
6. The result can be exported as DashboardConfig plus product-owned dataSource/widget files.

The platform should connect to the user's local coding agent instead of creating its own LLM. Supported targets should include local Codex/OpenCode-style agents through a controlled bridge.

## Local Agent Bridge Direction

The management UI should not hold provider API keys or run a proprietary model loop. It should delegate generation/refactor work to a local agent bridge:

- The user starts Codex/OpenCode locally in a product workspace.
- The management UI sends bounded tasks: generate plan, update DashboardConfig, add dataSource wrapper, add generated chart widget, run validation.
- The local agent edits files in the user's workspace and returns a patch/status summary.
- The management UI renders diffs, validation results, preview, and approval controls.

Hard boundaries:

- No blind execution of generated code in the management UI.
- No token/header exposure to prompts.
- No direct AI access to SDK source unless the user explicitly opens that workspace context.
- Every generated chart package still passes dependency allowlist, AST scan, build hooks, sandbox preview, and human approval.

## Chart Extension Direction

When built-in charts are sufficient, generation should reuse registered widgets first.

When charts are insufficient:

- Let the UI search/select additional ECharts chart patterns or another approved visualization library.
- Generate a new chart widget package only after the user approves the chart candidate.
- Validate the generated widget through `@dao-style-viz/ai-dashboard-sandbox`.
- Register generated widgets disabled by default until validation and human approval pass.

## Remaining Blockers

- The real `@daocloud-proto/ipavo` package is not installed in this workspace.
- Real backend URL and JWT are not provided to this repo; only proxy configuration knobs are present.
- The manager-facing workbench, server proxy service, agent bridge, and chart extension browser are not implemented yet.
- Production handling for storing JWTs and connecting to local agents needs a separate security review.
