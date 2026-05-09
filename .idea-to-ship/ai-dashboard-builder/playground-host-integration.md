# Full-Template Playground Host Integration Decision

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-009
**Status:** Closed for v0.1 as reference-only host surface
**Owners:** Frontend platform team

## Decision

Keep `playground/playground-ui` as a standalone DaoStyle host reference for v0.1. Do not wire the dashboard runtime into the full-template playground in v0.1.

The canonical v0.1 dashboard integration surface remains `apps/product-integration` because it is inside the root workspace, participates in root typecheck/lint/test/build, and exercises the dashboard runtime, widgets, dataSources, i18n merge, validation gate, and product SDK-shaped wrappers directly.

## Evidence

`playground/playground-ui` is a generated `@dao-style/cli` full-template Vue 3.3.x app with:

- Standalone `package.json` and `pnpm-lock.yaml`.
- DaoStyle dependencies: `@dao-style/core`, `@dao-style/extend`, and `@dao-style/biz`.
- Product-style plugins: vue-i18n, Pinia, DaoStyle install, qiankun public path, Day.js.
- Standalone build command: `pnpm --dir playground/playground-ui run build`.

Latest build evidence:

```text
pnpm --dir playground/playground-ui run build
PASS with warnings
largest JS chunk: 576.9 kB
known warnings: input-placeholder pseudo-class from generated template/dependency CSS
```

## Why Not Wire Dashboard Runtime Here In v0.1

- The product integration app already proves the dashboard-specific contracts with less noise.
- Wiring the full-template playground would require adding workspace dashboard packages to a standalone generated app dependency graph and keeping two host examples synchronized.
- The playground's value is independent-host ergonomics: DaoStyle plugin shape, i18n structure, generated build chain, and standalone lockfile behavior.
- Root release verification already covers dashboard runtime integration through `apps/product-integration`.

## v0.1 Contract

For v0.1, the playground must:

1. Stay outside the root pnpm workspace.
2. Keep its standalone lockfile and install/build behavior.
3. Build successfully with `pnpm --dir playground/playground-ui run build`.
4. Be referenced as host-shape evidence, not as the canonical dashboard example.

## No-Go Conditions

- v0.1 release depends on modifying generated playground internals.
- Root workspace verification depends on the playground being inside `pnpm-workspace.yaml`.
- Product adoption docs point engineers to the playground instead of `apps/product-integration` for dashboard wiring.
- Playground build fails for reasons unrelated to already accepted generated-template CSS warnings.

## Follow-Up

If a specific product host asks for DaoStyle full-template wiring, add a separate playground branch or example app that imports the published/internal dashboard packages after package publishing and product pilot decisions are closed.
