# MCP ECharts Integration

`mcp-echarts` can be used as an optional local MCP helper for AI-assisted chart and dashboard generation.

Reference: https://github.com/hustcc/mcp-echarts

## Role

Use it for generation-time assistance only:

- Generate ECharts option drafts from chart intent and sample data.
- Render PNG / SVG previews for review.
- Validate ECharts option syntax and feed errors back into AI repair prompts.

Do not use it as:

- A dashboard runtime dependency.
- A replacement for `DashboardConfig` schema validation.
- A replacement for `WidgetRegistry` compatibility checks.
- A bypass around the generated chart sandbox.

## Local MCP Config

Desktop / stdio MCP clients can use:

```json
{
  "mcpServers": {
    "mcp-echarts": {
      "command": "npx",
      "args": ["-y", "mcp-echarts"]
    }
  }
}
```

For managed workflows, run it as SSE or streamable transport outside the runtime process and call it from the generator adapter only.

## Data Boundary

Allowed inputs:

- Catalog metadata.
- Widget schemas and AI hints.
- Theme/layout metadata.
- Mock data, examples, or aggregated sample data.

Forbidden inputs:

- Business SDK source.
- `dataSource.query` implementation.
- Tokens, cookies, headers, or auth context.
- Raw user-sensitive production responses.
- Unreviewed generated code.

## Output Handling

`mcp-echarts` output is review evidence. The generator may store preview artifacts and validation feedback, but the final checked-in or published artifact must still be one of:

- A schema-valid `DashboardConfig` plus dashboard locale JSON resources.
- A generated chart widget package that passes typecheck, lint, AST safety scan, dependency allowlist, bundle build, CSP/origin/session-bound sandbox preview, and human approval.

The chart extension promotion flow is documented in `.idea-to-ship/ai-dashboard-builder/chart-extension-promotion-flow.md`.
