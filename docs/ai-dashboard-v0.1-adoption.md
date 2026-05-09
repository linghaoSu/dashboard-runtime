# AI Dashboard Builder v0.1 Adoption Guide

**Status:** v0.1 internal guide
**Audience:** product frontend engineers
**Canonical example:** `apps/product-integration`
**Release model:** internal source/commit based evaluation only

## What v0.1 Supports

v0.1 lets a product frontend render a declarative dashboard through the shared runtime while keeping product SDK calls, auth, permissions, and data transforms inside product-owned TypeScript code.

The supported path is:

1. Product app imports the dashboard packages from this repository.
2. Product app registers widgets and dataSources.
3. DashboardConfig references those registries by string keys.
4. Product app validates the config before rendering.
5. Product app passes route/user/locale/runtime context into `BigScreenRuntime`.

v0.1 is not a registry-published package release. All dashboard packages remain `private: true`; the reviewed package surface and remaining publish blockers are documented in `.idea-to-ship/ai-dashboard-builder/package-publishing-surface.md`.

## Reference Files

Use these files as the concrete implementation reference:

| Concern | Reference |
|---|---|
| Product app package dependencies and scripts | `apps/product-integration/package.json` |
| Package CSS imports | `apps/product-integration/src/main.ts` |
| Product host screen wiring | `apps/product-integration/src/screens/TenantCapacityScreen.vue` |
| DashboardConfig | `apps/product-integration/src/dashboards/tenant-capacity.ts` |
| Dashboard-owned locale files | `apps/product-integration/src/dashboards/tenant-capacity.i18n/` |
| Product and dashboard locale merge | `apps/product-integration/src/i18n/messages.ts` |
| DataSource wrappers around generated SDK methods | `apps/product-integration/src/data-sources/tenant-capacity.ts` |
| Mocked proto generated SDK shape | `apps/product-integration/src/product-sdk/generated/tenant-capacity.ts` |
| Widget registry | `apps/product-integration/src/widgets/index.ts` |
| Config validation gate | `apps/product-integration/src/dashboard-validation.ts` |
| Product integration smoke tests | `apps/product-integration/src/__tests__/tenant-capacity.test.ts` |

## Required Packages

For a Vue 3.3.x product host, use the same package set as the product integration example:

```json
{
  "dependencies": {
    "@dao-style-viz/ai-dashboard-ai-catalog": "workspace:*",
    "@dao-style-viz/ai-dashboard-echarts-vue": "workspace:*",
    "@dao-style-viz/ai-dashboard-runtime": "workspace:*",
    "@dao-style-viz/ai-dashboard-schema": "workspace:*",
    "@dao-style-viz/ai-dashboard-vue": "workspace:*",
    "@dao-style-viz/ai-dashboard-widgets": "workspace:*",
    "vue": "3.3.13",
    "zod": "^3.23.8"
  }
}
```

For v0.1, `workspace:*` is the only supported consumption mode inside this repository. Product teams evaluating from another repository should use the release candidate commit/branch as source evidence until package publishing is explicitly approved.

## Import Package Styles

Import runtime and widget CSS once in the product app entry:

```ts
import "@dao-style-viz/ai-dashboard-vue/style.css";
import "@dao-style-viz/ai-dashboard-echarts-vue/style.css";
import "@dao-style-viz/ai-dashboard-widgets/style.css";
```

Do this before mounting the product app, as shown in `apps/product-integration/src/main.ts`.

## Recommended Product Layout

Mirror this layout inside the product app:

```text
src/
  data-sources/
    <dashboard>.ts
  dashboards/
    <dashboard>.ts
    <dashboard>.i18n/
      index.ts
      en-US.json
      zh-CN.json
  i18n/
    messages.ts
  product-sdk/
    generated/
      <service>.ts
  screens/
    <DashboardScreen>.vue
  widgets/
    index.ts
  dashboard-validation.ts
```

The product SDK folder is only a local mock in the example. In a real product, replace it with the product's generated TypeScript SDK imports.

## Register Widgets

Create one product widget registry and pass it to the runtime and validator:

```ts
import { echartsWidgetRegistry } from "@dao-style-viz/ai-dashboard-echarts-vue";
import { basicWidgetRegistry } from "@dao-style-viz/ai-dashboard-widgets";

export const productWidgetRegistry = {
  ...echartsWidgetRegistry,
  ...basicWidgetRegistry
};
```

Only widget types in this registry can be used by DashboardConfig.

## Wrap Product SDK Methods As DataSources

Each dataSource is product-owned executable code. DashboardConfig and AI catalog output only reference dataSource keys and JSON-safe metadata.

Use `createSdkDataSource` when wrapping generated static SDK methods:

```ts
import { createSdkDataSource, defineDataSources } from "@dao-style-viz/ai-dashboard-runtime";
import { metricCardDataSchema } from "@dao-style-viz/ai-dashboard-widgets";
import { z } from "zod";
import { TenantCapacityService } from "../product-sdk/generated/tenant-capacity";

const paramsSchema = z.object({
  tenantId: z.string(),
  workspaceId: z.string(),
  locale: z.string().optional()
});

export const tenantCapacityDataSources = defineDataSources({
  "tenant.capacity.cpu": createSdkDataSource({
    name: "Tenant CPU Capacity",
    category: "tenant-capacity",
    paramsSchema,
    outputSchema: metricCardDataSchema,
    compatibleWidgets: ["MetricCard"],
    dependsOnLocale: true,
    examples: [
      {
        params: { tenantId: "tenant-alpha", workspaceId: "prod", locale: "en-US" },
        output: { label: "CPU Used", value: 56.8, unit: "%", status: "warning" }
      }
    ],
    request: (params) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId
    }),
    call: (request) => TenantCapacityService.GetTenantCapacityOverview(request),
    transform: (response, ctx) => ({
      label: localizeCpuLabel(ctx.params.locale ?? ctx.runtime.locale),
      value: (response.cpuUsedCores / response.cpuTotalCores) * 100,
      unit: "%",
      status: "warning"
    })
  })
});

function localizeCpuLabel(locale: string) {
  return locale === "zh-CN" ? "CPU Used (zh-CN)" : "CPU Used";
}
```

The snippet above keeps labels ASCII for documentation. The canonical product example uses real localized labels in `apps/product-integration/src/data-sources/tenant-capacity.ts`.

Keep these rules:

- Validate every input with `paramsSchema`.
- Validate every widget payload with the target widget `outputSchema`.
- Put request mapping in `request`.
- Put SDK invocation in `call`.
- Put product-to-widget shaping in `transform`.
- Use `dependsOnLocale: true` when runtime locale changes should re-query the source.
- Keep auth, permission checks, token handling, and generated SDK implementation outside DashboardConfig and outside AI-facing catalog output.
- Let SDK-domain errors throw; the runtime/widget shell handles failures as explicit error states.

## Define DashboardConfig

DashboardConfig should stay declarative:

```ts
import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";

const tenantContextParams = {
  tenantId: { $ref: "context.tenantId" },
  workspaceId: { $ref: "context.workspaceId" }
};

export const tenantCapacityDashboard: DashboardConfig = {
  version: "1.0.0",
  meta: {
    id: "tenant-capacity",
    name: {
      key: "dashboard.tenantCapacity.name",
      defaultMessage: "Tenant Capacity"
    },
    owner: "platform-observability"
  },
  canvas: {
    width: 1440,
    height: 900,
    scaleMode: "fit",
    theme: "dao-dark",
    background: "#08111f",
    chartPalette: [
      "#38bdf8",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a78bfa",
      "#14b8a6"
    ]
  },
  i18n: {
    namespace: "dashboard.tenantCapacity",
    defaultLocale: "en-US",
    supportedLocales: ["en-US", "zh-CN"]
  },
  context: {
    tenantId: { $ref: "route.query.tenantId" },
    workspaceId: { $ref: "route.query.workspaceId" }
  },
  globalFilters: {
    namespace: "all"
  },
  widgets: [
    {
      id: "cpu-capacity",
      type: "MetricCard",
      layout: { x: 32, y: 148, w: 320, h: 188 },
      data: {
        source: "tenant.capacity.cpu",
        params: {
          ...tenantContextParams,
          locale: { $ref: "runtime.locale" }
        }
      },
      props: {
        precision: 1
      }
    }
  ]
};
```

Use `$ref` for runtime, route, context, global filter, and event payload values. Do not put functions, SDK calls, tokens, or ad hoc scripts in config.

## Configure Chart Palettes

Set the default chart palette once on `canvas.chartPalette`. ECharts widgets use that palette automatically.

```ts
canvas: {
  width: 1440,
  height: 900,
  scaleMode: "fit",
  theme: "dao-dark",
  chartPalette: [
    "#38bdf8",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a78bfa",
    "#14b8a6"
  ]
}
```

Override the palette on a single chart only when the local visual intent is different:

```ts
props: {
  xField: "namespace",
  yField: "value",
  palette: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"]
}
```

Use `docs/design.md` for the approved v0.1 layout and palette evidence.

## Wire Filters And Events

For widget events, prefer runtime actions over custom host code. The product example uses a `FilterBar` that updates `globalFilters.namespace`:

```ts
events: [
  {
    trigger: "change",
    action: "setFilter",
    payload: {
      key: "namespace",
      value: { $ref: "event.payload.value" }
    }
  }
]
```

Widgets whose data params reference `globalFilters.namespace` reload when the filter changes. Do not add a second `refreshWidget` for the same change unless a specific widget is not data-bound to the filter.

## Merge Dashboard-Owned Locale Resources

Keep dashboard copy next to the dashboard config:

```text
dashboards/
  tenant-capacity.i18n/
    en-US.json
    zh-CN.json
    index.ts
```

Merge product messages and dashboard messages before passing runtime messages to `BigScreenRuntime`:

```ts
import {
  mergeLocaleMessages,
  type LocaleMessages
} from "@dao-style-viz/ai-dashboard-runtime";
import { tenantCapacityMessages } from "../dashboards/tenant-capacity.i18n";

const productMessages: LocaleMessages = {
  "en-US": { product: { name: "Product Observability" } },
  "zh-CN": { product: { name: "Product Observability" } }
};

export const messages = mergeLocaleMessages(productMessages, tenantCapacityMessages);
```

Config titles should use `{ key, defaultMessage }`. Data-driven widget text that comes from SDK responses should be localized in the dataSource transform or product SDK response.

## Validate Before Rendering

Run the catalog validation gate before mounting the dashboard:

```ts
import { validateDashboardConfig } from "@dao-style-viz/ai-dashboard-ai-catalog";
import { tenantCapacityDataSources } from "./data-sources/tenant-capacity";
import { tenantCapacityDashboard } from "./dashboards/tenant-capacity";
import { productWidgetRegistry } from "./widgets";

export const tenantCapacityValidation = validateDashboardConfig(
  tenantCapacityDashboard,
  {
    dataSources: tenantCapacityDataSources,
    widgets: productWidgetRegistry
  }
);
```

The host screen should block runtime rendering and show validation issues if validation fails.

## Render In A Product Screen

Pass config, registries, dataSources, and runtime input to `BigScreenRuntime`:

```vue
<BigScreenRuntime
  :config="tenantCapacityDashboard"
  :widgets="productWidgetRegistry"
  :data-sources="tenantCapacityDataSources"
  :runtime="runtime"
/>
```

The runtime input should include at least:

```ts
const runtime = computed(() => ({
  locale: locale.value,
  fallbackLocale: "en-US",
  route: {
    query: {
      tenantId: tenantId.value,
      workspaceId: workspaceId.value
    }
  },
  messages
}));
```

Route, user, locale, timezone, and messages are host-owned. DashboardConfig can reference them through `$ref`.

## Replace The Mock SDK With A Real SDK

When moving from the example to a real product:

1. Delete or ignore `src/product-sdk/generated/*` from the example.
2. Import the product's generated TypeScript SDK service classes. In DCE-style products these are typically npm packages under `@daocloud-proto/*`, for example `@daocloud-proto/ipavo`.
3. Keep the generated static method call shape in `call`.
4. Keep product auth/session/tenant checks in the product SDK layer or dataSource layer.
5. Keep DashboardConfig unchanged except for dataSource keys, params, widget layout, and i18n text.
6. Add tests for at least one happy SDK response, one SDK-domain error, and one locale-sensitive response if the dashboard supports locale switching.

For local backend preview, route SDK HTTP calls through the product host or management server proxy. The product-integration example exposes Vite proxy knobs for `/apis`:

```sh
PRODUCT_API_URL=http://localhost:8080
PRODUCT_AUTH_TOKEN=<jwt>
```

The proxy injects the JWT auth header server-side. Do not put backend URLs, JWTs, cookies, or auth headers in DashboardConfig or AI-facing catalog output.

## Required Product Checks

At minimum, a product integration should keep these checks green:

```sh
pnpm --filter @dao-style-viz/product-integration-example typecheck
pnpm --filter @dao-style-viz/product-integration-example lint
pnpm --filter @dao-style-viz/product-integration-example test
pnpm --filter @dao-style-viz/product-integration-example build
```

For a full v0.1 release candidate, also run the release-gate commands in `.idea-to-ship/ai-dashboard-builder/release-gate.md`.

## Minimum Test Coverage For A New Product Dashboard

Use `apps/product-integration/src/__tests__/tenant-capacity.test.ts` as the model. Cover:

- Dashboard validation succeeds.
- At least one dataSource calls the generated SDK wrapper and returns widget-compatible output.
- One SDK-domain failure is surfaced.
- Dashboard-owned locale resources merge into product messages.
- Locale-sensitive data-driven text changes when runtime locale changes.

## Do Not Do This In v0.1

- Do not put SDK calls or query functions in DashboardConfig.
- Do not expose product SDK implementation, tokens, cookies, permission logic, or sensitive user data to AI catalog or prompt outputs.
- Do not register generated chart widgets unless the sandbox validation and human approval gate pass.
- Do not bypass `validateDashboardConfig`.
- Do not rely on registry package publishing; it is not part of v0.1.
- Do not treat current ECharts bundle warnings as a permanent budget. They are accepted only for internal v0.1 evaluation.

## Current Known Limits

- Package publishing and clean external consumer install are not approved yet.
- The product integration app uses mocked SDK data with real generated-SDK call shape.
- Production config-error UX ownership is not final.
- Performance and bundle budgets are not quantified.
- Generated chart preview CSP/origin/postMessage hardening is deferred.
