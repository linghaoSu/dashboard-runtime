# Chart Extension Browser And Generated Widget Promotion Flow

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-013
**Status:** Workflow locked; implementation deferred until chart browser UI phase
**Owners:** Frontend platform team plus security/platform lead

## Decision

When built-in widgets and ECharts wrappers are insufficient, the workbench may help users discover additional chart patterns and generate a new chart widget package. Generated widgets remain disabled by default and can be promoted only after sandbox validation, preview, hook execution, and human approval.

This flow extends the existing `@dao-style-viz/ai-dashboard-sandbox` gate. It does not permit arbitrary chart code to run inside the main dashboard runtime.

## User Flow

1. DashboardPlan reports `missingCapabilities`.
2. Workbench opens chart extension browser.
3. User filters chart patterns by intent, data shape, interaction, visual density, and library source.
4. Workbench may fetch ECharts examples or call optional generation-time helpers such as `mcp-echarts` using mock/sample data only.
5. User selects a candidate chart pattern.
6. Local agent generates a chart widget package file map:
   - `manifest.json`
   - `schema.ts`
   - `Chart.vue`
   - `sample-data.json`
   - `README.md`
7. Sandbox validates schema, dependencies, AST safety, required files, and sample data.
8. Hook plan runs typecheck, lint, and build.
9. Preview runs in the CSP/origin/session-bound iframe contract.
10. Reviewer approves the generated widget.
11. Host calls `createGeneratedWidgetRegistry({ enabled: true, approved: true, approvalGatePassed: true, ... })`.
12. DashboardConfig may reference the generated widget type only after registration.

## Candidate Sources

Allowed:

- Existing built-in chart catalog.
- ECharts gallery/example metadata fetched online at generation time, converted into registered widget props or generated package files.
- Other visualization libraries only after dependency allowlist review.
- Product-owned sample/mock/aggregated data.

Forbidden:

- Raw production API responses.
- Business SDK implementation source.
- Authenticated backend calls from generated chart code.
- Generated packages with lifecycle scripts or unapproved dependencies.
- Runtime registration before sandbox approval.
- Direct execution of remotely fetched chart code.

## Promotion States

| State | Meaning | Can Runtime Use It |
|---|---|---|
| `candidate` | Pattern selected but no package generated | No |
| `generated` | Package file map exists | No |
| `validated` | Schema/dependency/AST/sample validation passes | No |
| `hooksPassed` | Typecheck/lint/build hooks pass | No |
| `previewPassed` | CSP/origin/session-bound preview renders | No |
| `approved` | Human approval recorded | No |
| `registered` | Generated widget registry explicitly enabled with passing gate | Yes |

## Required Evidence For Registration

- `validateGeneratedChartPackage()` success.
- `evaluateGeneratedChartHookResults()` success for typecheck, lint, and build.
- `validateGeneratedChartPreviewMessage()` success for rendered preview message.
- Human approval record.
- Updated bundle budget decision if the generated widget is eagerly bundled into a product app.

## No-Go Conditions

- Workbench executes generated chart code outside the preview sandbox.
- Generated chart code fetches data, reads cookies/storage, or calls product SDKs.
- A dependency is added without allowlist review.
- Preview iframe uses `allow-same-origin`.
- DashboardConfig references a generated widget before registry promotion.
- Generated widget is included in default product bundles without bundle-budget review.

## Relationship To v0.1

v0.1 supports the contracts needed by this flow:

- Prompt templates can report missing capabilities.
- `mcp-echarts` is documented as preview/validation evidence only.
- `@dao-style-viz/ai-dashboard-sandbox` validates generated chart packages.
- Generated widget registry is disabled by default.
- Preview security policy is locked by ITS-ai-dashboard-builder-005.

The actual chart extension browser UI is post-v0.1 work.
