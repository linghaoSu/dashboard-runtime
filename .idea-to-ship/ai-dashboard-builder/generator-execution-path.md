# v0.1 Generator Execution Path

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-006
**Status:** Locked for v0.1
**Owners:** Frontend platform team plus product dashboard owner

## Decision

Use a local-agent-assisted, file-based workflow for v0.1.

The dashboard platform does not create or host its own LLM runtime in v0.1. Generation is performed by the user's local coding agent, such as Codex or OpenCode, running inside the product workspace with user approval. The future manager-facing web workbench and local agent bridge remain separate roadmap work under ITS-ai-dashboard-builder-011.

## Execution Flow

1. Product frontend owner registers product-owned dataSources and widgets.
2. Product frontend owner keeps SDK calls, auth, backend URLs, tokens, and proxy configuration outside DashboardConfig and outside AI-facing catalogs.
3. Local agent reads the approved catalogs, `docs/design.md`, `docs/ai-dashboard-v0.1-adoption.md`, and product dashboard examples.
4. Local agent uses `dashboardPlanPrompt` to produce a DashboardPlan JSON review artifact.
5. Human reviewer approves the plan or asks for changes.
6. Local agent uses `dashboardConfigPrompt` to produce DashboardConfig plus adjacent locale JSON resources.
7. Product code runs `validateDashboardConfig(config, { dataSources, widgets })`.
8. Product code runs typecheck, lint, tests, build, and bundle budget checks.
9. Only validated config and locale resources can be committed.

Generated chart widgets are not automatically registered by this flow. If the plan reports missing chart capabilities, the chart extension path must use the sandbox and approval gates before any generated widget enters a registry.

## Required Inputs

- Product-owned dataSource registry.
- Product-owned widget registry.
- Layout catalog and theme catalog.
- Dashboard i18n namespace and supported locale list.
- Product requirement prompt from the manager or product owner.
- Optional reference screenshot or existing dashboard source.

The local agent may inspect product source files that the user has opened to the workspace, but prompt/catalog payloads must not include:

- JWTs, cookies, auth headers, or backend tokens.
- Backend base URLs entered for live preview.
- Generated SDK source code beyond public import names and method signatures.
- Raw production API responses.
- User-sensitive data.

## Sample Plan

Use `.idea-to-ship/ai-dashboard-builder/generator-sample-plan.json` as the v0.1 sample DashboardPlan. It models the ipavo reference dashboard supplied by the user and records layout, palette, dataSource keys, widget choices, missing capabilities, and the approval checkpoint.

## Sample DashboardConfig

Use `apps/product-integration/src/dashboards/ipavo-overview.ts` as the sample generated DashboardConfig shape. It demonstrates:

- Global canvas palette.
- Dashboard-owned i18n keys.
- Product-owned ipavo widgets.
- ECharts widgets for compact sparklines.
- DataSource references without SDK implementation or auth material.

Use `apps/product-integration/src/dashboards/ipavo-overview.i18n/` as the paired locale-resource sample.

## Validation Evidence

Current v0.1 evidence:

- `apps/product-integration/src/dashboard-validation.ts` validates the ipavo and tenant-capacity dashboards with the registered product dataSources and widgets.
- `apps/product-integration/src/__tests__/tenant-capacity.test.ts` covers ipavo-style dashboard validation and generated-SDK-shaped dataSource output.
- `pnpm --filter @dao-style-viz/product-integration-example test` passes with 6 files / 19 tests.
- `pnpm -r --if-present test` passes with 18 files / 86 tests after the prompt-contract, preview-security, proxy-credential, live SDK import, live pilot preflight guard, live backend smoke guard, and ipavo layout/palette catalog regression tests.

## No-Go Conditions

- A generated DashboardConfig bypasses DashboardPlan review.
- A generated DashboardConfig is rendered without `validateDashboardConfig`.
- Generated locale keys are missing adjacent locale JSON resources.
- DashboardConfig includes functions, executable scripts, SDK calls, backend URLs, JWTs, cookies, auth headers, or raw production responses.
- The product host accepts generated chart widget code without sandbox validation and human approval.
- A manager-facing UI stores LLM provider credentials or writes files without local-agent/user approval.

## Future Workbench Direction

The ideal product direction is a web interface where a manager can chat, preview, and adjust dashboards. That interface should connect to the user's local Codex/OpenCode-style agent through an explicit local bridge instead of owning a hosted LLM loop. It should support product SDK selection, server-side backend proxy setup, palette/layout/chart adjustment controls, and chart extension when built-in widgets are insufficient. The bridge must expose file-write approvals, validation output, preview status, and rollback context before it is allowed to modify a product workspace.
