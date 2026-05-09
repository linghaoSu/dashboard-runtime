# v0.1 Performance And Bundle Budget

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-007
**Status:** Locked for v0.1 internal release candidate checks
**Owners:** Frontend platform team

## Decision

v0.1 accepts the current ECharts-driven Vite chunk warnings for internal evaluation only, with explicit hard ceilings. A Vite `>500 kB` warning is not a no-go by itself; exceeding the v0.1 budget below is a no-go until the owner either reduces size or updates this artifact with a reviewed exception.

Run the budget after a production build:

```sh
pnpm -r --if-present build
pnpm run check:bundle-budget
```

The script reads built `dist` assets and fails if a budget is exceeded.

## Bundle Budgets

| Surface | Hard Ceiling | Current Evidence | Decision |
|---|---:|---:|---|
| `apps/demo` total JS assets | 950 KiB raw | 805.7 KiB raw / 263.3 KiB gzip | PASS |
| `apps/demo` total CSS assets | 32 KiB raw | 8.0 KiB raw / 2.0 KiB gzip | PASS |
| `apps/product-integration` total JS assets | 950 KiB raw | 889.4 KiB raw / 284.2 KiB gzip | PASS |
| `apps/product-integration` total CSS assets | 32 KiB raw | 15.1 KiB raw / 3.2 KiB gzip | PASS |
| `packages/ai-dashboard-vue/dist/index.js` | 20 KiB raw | 12.4 KiB raw / 3.9 KiB gzip | PASS |
| `packages/ai-dashboard-widgets/dist/index.js` | 32 KiB raw | 18.1 KiB raw / 4.3 KiB gzip | PASS |
| `packages/ai-dashboard-echarts-vue/dist/index.js` | 150 KiB raw | 111.6 KiB raw / 21.7 KiB gzip | PASS |

The app JS ceilings are intentionally above Vite's default warning threshold because the current v0.1 apps eagerly import the built-in widget registry and ECharts package. ITS-ai-dashboard-builder-007 does not implement lazy loading; it prevents silent growth before that optimization is chosen.

## Runtime Performance Assumptions

The v0.1 budget assumes:

- Product-embedded dashboards use a fixed canvas such as `1440x900`.
- A typical dashboard has up to 12 visible widgets.
- A typical dashboard has up to 6 visible ECharts widgets.
- DataSource refresh intervals remain at or above the catalog validation minimum.
- Tables/lists use bounded product data, not unbounded raw API responses.
- Generated chart widgets are not part of the default registry.
- Product SDK calls stay behind product-owned dataSources and may use product caching or request coalescing outside DashboardConfig.

Dashboards exceeding these assumptions need product-specific review before being treated as v0.1-ready.

## No-Go Conditions

- `pnpm run check:bundle-budget` exits nonzero after a production build.
- A new app or package asset surface is added without a budget row and script coverage.
- Product integration JS grows beyond 950 KiB raw without a reviewed lazy-loading or exception decision.
- Generated chart widgets are eagerly registered into product builds without a new budget decision.
- A product pilot introduces polling or refresh behavior that can fan out unbounded SDK requests.

## Follow-Up After v0.1

- Split ECharts/widget registries by lazy-loaded widget type if product integration approaches the 950 KiB ceiling.
- Add browser smoke metrics for first render and widget reload once a stable management UI or product host exists.
- Revisit package-level budgets when registry publishing and external consumer install checks are approved.
