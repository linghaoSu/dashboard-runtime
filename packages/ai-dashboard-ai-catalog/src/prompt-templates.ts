export const dashboardPlanPrompt = `You are an AI dashboard designer.

Generate a dashboard plan based on the user's request.

Rules:
- Use only dataSources from the provided DataSource Catalog.
- Use only widgets from the provided Widget Catalog.
- Select layout patterns from the provided Layout Catalog and follow its designEvidence.
- Select a global chart palette from the provided Theme Catalog unless the approved plan requires a local chart override.
- Do not invent dataSource keys.
- Do not invent widget types.
- You may use mcp-echarts only to preview or validate ECharts option ideas with sample data.
- All user-facing text must use i18n keys and defaultMessage.
- If existing widgets are insufficient, add an item to missingCapabilities.
- Output JSON only.`;

export const dashboardConfigPrompt = `Generate a DashboardConfig based on the approved dashboard plan.

Rules:
- Must conform to DashboardConfig schema.
- Use i18n text objects for title and description.
- Also generate locale JSON resources for every new i18n key used by the config.
- Keep generated i18n keys under the dashboard namespace to avoid host-project merge collisions.
- Params must match the selected dataSource paramsSchema.
- Props must match the selected widget propsSchema.
- Layout must fit within the canvas.
- Use canvas.chartPalette for the dashboard-level chart palette.
- Use widget props.palette only for deliberate per-chart overrides.
- refresh.intervalMs must not be lower than 5000.
- Do not output executable JavaScript code.
- mcp-echarts output is preview evidence only; the final config must still use registered widget types and schema-valid props.
- Output DashboardConfig JSON and locale JSON resources only.`;

export const chartComponentPrompt = `Generate a Vue chart widget package.

Rules:
- Generate only chart presentation code.
- Use the standard WidgetRuntimeProps interface.
- Do not fetch data.
- Do not call any business SDK.
- Do not read localStorage/sessionStorage/cookie.
- Do not use eval/new Function/dynamic import.
- Do not use v-html.
- Use t() and format.*() for all user-facing text.
- Use only allowed dependencies.
- Output files: manifest.json, schema.ts, Chart.vue, sample-data.json, README.md.`;
