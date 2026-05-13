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

v0.1 is not a registry-published package release. All dashboard packages remain `private: true`; the release model and publish blockers are documented in `.idea-to-ship/ai-dashboard-builder/release-gate.md`.

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
    "@daocloud-proto/ipavo": "0.13.0-20",
    "vue": "3.3.13",
    "zod": "^3.23.8"
  }
}
```

For v0.1, `workspace:*` is the only supported consumption mode inside this repository. Product teams evaluating from another repository should use the release candidate commit/branch as source evidence until package publishing is explicitly approved.

Product SDK packages are product-owned dependencies. The ipavo pilot pins `@daocloud-proto/ipavo@0.13.0-20` only in `apps/product-integration`; dashboard platform packages must not depend on product SDK packages.

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

The host screen should block runtime rendering if validation fails. In development, show validation issue details so product engineers can fix the dashboard config. In production, show concise dashboard-unavailable copy and keep raw validation details in product-owned logs or diagnostics, not in the user-facing dashboard.

## Render In A Product Screen

Pass config, registries, dataSources, and runtime input to `BigScreenRuntime`:

```vue
<BigScreenRuntime
  :config="tenantCapacityDashboard"
  :widgets="productWidgetRegistry"
  :data-sources="tenantCapacityDataSources"
  :runtime="runtime"
  :config-error-mode="configErrorMode"
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

`configErrorMode` should follow the same production/development split used by the host validation gate:

```ts
const configErrorMode = computed(() =>
  import.meta.env.DEV ? "development" : "production"
);
```

`BigScreenRuntime` also accepts optional `configErrorTitle` and `configErrorMessage` props for host-specific production copy. Product hosts should validate configs before rendering; the runtime fallback is only the last line of defense.

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
PRODUCT_API_ALLOWED_HOSTS=localhost:8080
PRODUCT_API_TIMEOUT_MS=10000
PRODUCT_API_INSECURE_TLS=false
PRODUCT_IPAVO_VERSION_PATH=/apis/ipavo.io/v1alpha1/version
PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH=/apis/ipavo.io/v1alpha1/resource/summary
```

The ipavo overview page uses mock fixture data by default so local UI smoke tests are deterministic. To make `pnpm --dir apps/product-integration dev` call the real generated ipavo SDK through the `/apis` proxy, add this non-secret browser flag to `apps/product-integration/.env.local`:

```sh
VITE_PRODUCT_IPAVO_DATA_MODE=live
```

Keep `VITE_PRODUCT_IPAVO_DATA_MODE=mock` or leave it unset for fixture-backed UI tests. The `VITE_` flag only selects the browser data mode; backend URL and JWT values must stay in `PRODUCT_*` env and are consumed by the Vite server proxy. The browser SDK uses the generated ipavo `/apis/ipavo.io/...` routes; `PRODUCT_IPAVO_VERSION_PATH`, `PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH`, and `PRODUCT_API_TIMEOUT_MS` are live smoke-script settings only.

Use `apps/product-integration/.env.example` as the local template and put real local values in ignored `apps/product-integration/.env.local`. The live-check scripts and Vite config load `.env.local`; explicit shell env values still take precedence. For internal self-signed HTTPS endpoints, set `PRODUCT_API_INSECURE_TLS=true` only in `.env.local` or the local shell. Do not commit real backend URLs or JWT values.

The proxy injects the JWT auth header server-side. `PRODUCT_API_ALLOWED_HOSTS` is required whenever `PRODUCT_API_URL` is set, including local testing. Do not put backend URLs, JWTs, cookies, or auth headers in DashboardConfig, local-agent tasks, or AI-facing catalog output.

After setting the env values locally, run:

```sh
pnpm run check:ipavo-live-pilot
pnpm run check:ipavo-live-backend
```

The live backend smoke validates status and response shape without printing tokens or response bodies. If a product backend maps those smoke endpoints differently, override `PRODUCT_IPAVO_VERSION_PATH` and `PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH`; they must be backend paths, not full URLs. Those overrides prove backend reachability for the smoke gate and do not rewrite the generated browser SDK routes.

## Required Product Checks

At minimum, a product integration should keep these checks green:

```sh
pnpm --filter @dao-style-viz/product-integration-example typecheck
pnpm --filter @dao-style-viz/product-integration-example lint
pnpm --filter @dao-style-viz/product-integration-example test
pnpm --filter @dao-style-viz/product-integration-example build
```

For a full v0.1 release candidate, also run the release-gate commands in `.idea-to-ship/ai-dashboard-builder/release-gate.md`.
Bundle budgets are part of that release gate and checked with:

```sh
pnpm run check:bundle-budget
```

`playground/playground-ui` is kept as a standalone DaoStyle full-template host reference only. Use `apps/product-integration` as the canonical dashboard wiring example for v0.1.

## AI Generation In v0.1

v0.1 uses a local-agent-assisted workflow. The platform does not host its own LLM runtime. Product teams should run generation through a user-controlled local agent such as Codex or OpenCode, then commit only reviewed DashboardConfig and locale resources.

The required path is: plan first, human approval, DashboardConfig and locale generation, `validateDashboardConfig`, product checks, and bundle budget checks. Backend URLs, JWTs, cookies, SDK implementation, and raw production responses must stay out of prompts, DashboardConfig, and AI catalog output.

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
- Do not treat current ECharts bundle warnings as an unlimited budget. They are accepted only while the v0.1 bundle budget passes.

## Current Known Limits

- Package publishing and clean external consumer install are not approved yet.
- The product integration app uses mocked SDK data by default; ipavo overview can be switched to live SDK requests with `VITE_PRODUCT_IPAVO_DATA_MODE=live` plus valid `PRODUCT_*` proxy env.
- Performance and bundle budgets are quantified for v0.1 internal evaluation, but lazy loading is not implemented yet.
- Generated chart preview CSP/origin/postMessage hardening is implemented for the sandbox gate; the productized chart browser UI is still deferred.
