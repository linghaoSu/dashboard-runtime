# Manager Workbench And Local Agent Bridge Architecture

**Date:** 2026-05-09
**Roadmap Item:** ITS-ai-dashboard-builder-011
**Status:** Architecture locked; implementation deferred until productization phase
**Owners:** Platform/product lead plus frontend platform team

## Decision

The manager-facing dashboard workbench should be a web UI that orchestrates a user's local coding agent. It must not own a hosted LLM loop, store LLM provider credentials, or write product files without explicit local approval.

The workbench is a control plane for:

- Chat-based dashboard intent.
- DashboardPlan review.
- DashboardConfig and locale-resource proposal.
- Live preview with product-owned dataSources.
- Layout/theme/chart adjustments.
- Product SDK and backend preview setup.
- Chart capability discovery and generated-widget promotion.
- Validation and release-gate command output.

The local agent bridge is the execution boundary. Codex/OpenCode-style tools remain responsible for source edits, local command execution, and repository context. The workbench sends bounded tasks and displays results; it does not directly modify product workspaces.

## Capability Modes

The workbench has two product modes:

1. **Catalog-sufficient generation:** the available dataSources, widgets, layout presets, and theme palettes are enough. The workbench should let a product manager or engineering manager generate the dashboard by chat, then adjust layout slots, copy, palette, chart choice, filters, and data bindings through the inspector. Product SDK packages are referenced by public npm package names such as `@daocloud-proto/*`.
2. **Chart-extension generation:** the plan reports missing chart capability. The workbench should let the user search ECharts examples or another allowlisted visualization source, approve a candidate using mock/sample data, then ask the local agent to generate a new chart widget package that must pass sandbox, hook, preview, and human approval gates before registration.

Both modes use the same backend boundary: real backend URL and JWT/token may be entered in a workbench server/proxy setup panel, but prompts, local-agent tasks, DashboardConfig, and generated widget code see only redacted proxy status.

## Primary User Flow

1. Product manager opens the workbench and selects a product workspace/dashboard target.
2. Workbench loads catalog metadata, design evidence such as `design.md`, existing dashboard files, and product-owned dataSource/widget registries.
3. User describes the desired dashboard in chat.
4. Workbench asks the local agent for a DashboardPlan.
5. User reviews and approves the plan.
6. Workbench asks the local agent for DashboardConfig, locale JSON resources, and any product-owned widget/dataSource changes needed by the plan.
7. Local agent returns a file-change proposal and validation report.
8. User approves writes.
9. Local agent applies changes and runs required checks.
10. Workbench renders preview and exposes adjustment controls.
11. Any adjustment creates a new plan/config patch and repeats validation before commit.

## Productized Target Flow

When built-in charts and widgets are sufficient:

1. User selects a product SDK package or capability set. DCE-style SDKs should be referenced by public npm import names such as `@daocloud-proto/*`, not by copied SDK implementation.
2. User optionally enters a real backend URL and JWT/token into a server-side proxy setup panel.
3. Workbench shows only redacted proxy status to the local agent and dashboard prompts.
4. User chats with the workbench to generate a DashboardPlan.
5. User adjusts layout, text, filters, palettes, chart choices, and bindings through the inspector.
6. Local agent produces reviewed DashboardConfig and locale files, then runs validation and checks.

When built-in charts are insufficient:

1. DashboardPlan reports `missingCapabilities`.
2. Workbench opens the chart extension browser.
3. User searches ECharts examples or another allowlisted visualization source using mock/sample data.
4. User approves one candidate chart pattern.
5. Local agent generates a chart widget package proposal.
6. The generated widget must pass dependency, AST, hook, CSP preview, and human approval gates before registration.

## Workbench UI Areas

| Area | Purpose | Required State |
|---|---|---|
| Chat | Capture manager intent and iterative changes | conversation, linked dashboard target, current plan status |
| Plan review | Show selected dataSources, widgets, layout, palette, i18n namespace, and missing capabilities | approved/rejected/needs changes |
| Preview | Render validated dashboard config through product-owned runtime/dataSources | loading/error/empty/validated states |
| Inspector | Adjust title, layout slots, palette, chart props, filters, and widget visibility | patch preview and validation result |
| SDK/data panel | Show product-owned dataSource catalog and generated SDK import names | no SDK source or token exposure |
| Backend preview panel | Show server-side proxy target status | redacted URL/token status only |
| Chart extension browser | Search/select ECharts or allowlisted visualization patterns when catalog coverage is insufficient | candidate pattern, mock data, sandbox result, approval state |
| Checks panel | Show typecheck/lint/test/build/budget outputs | command, status, logs, artifact links |

## Local Agent Bridge Contract

The bridge protocol is local-only and approval-based.

### Handshake

```json
{
  "type": "ai-dashboard.bridge.hello",
  "protocolVersion": "1.0.0",
  "workspaceRoot": "/path/to/product",
  "capabilities": [
    "readFiles",
    "proposePatch",
    "applyApprovedPatch",
    "runCommand",
    "validateDashboardConfig"
  ]
}
```

### Task Request

```json
{
  "type": "ai-dashboard.bridge.task",
  "taskId": "task-001",
  "kind": "generateDashboardPlan",
  "inputs": {
    "intent": "Create an ipavo-style container overview dashboard.",
    "catalogFiles": ["data-sources.json", "widgets.json", "layout.json", "theme.json"],
    "designEvidence": ["docs/design.md"],
    "targetFiles": ["src/dashboards/ipavo-overview.ts"]
  }
}
```

### Patch Proposal

```json
{
  "type": "ai-dashboard.bridge.patchProposal",
  "taskId": "task-001",
  "summary": "Add dashboard config and locale resources.",
  "files": [
    {
      "path": "src/dashboards/ipavo-overview.ts",
      "operation": "create"
    },
    {
      "path": "src/dashboards/ipavo-overview.i18n/en-US.json",
      "operation": "create"
    }
  ],
  "requiresApproval": true
}
```

### Validation Result

```json
{
  "type": "ai-dashboard.bridge.validationResult",
  "taskId": "task-001",
  "checks": [
    { "name": "validateDashboardConfig", "status": "passed" },
    { "name": "typecheck", "status": "passed" },
    { "name": "test", "status": "passed" }
  ],
  "previewReady": true
}
```

## Permission Model

- File writes require user approval per proposal.
- Commands require an allowlist. Default allowed commands are validation, typecheck, lint, test, build, and bundle-budget checks.
- Backend proxy tokens are never passed to the agent. The workbench can show redacted proxy status only.
- Prompt/catalog payloads must not contain JWTs, cookies, auth headers, backend URLs, SDK source code, or raw production responses.
- All generated chart widget proposals must go through the sandbox gate before preview or registration.
- Online chart discovery can fetch catalog/example metadata, but remote chart code is never executed directly in the main workbench or dashboard runtime.

## Storage Boundaries

Allowed:

- DashboardPlan artifacts.
- DashboardConfig files.
- Dashboard-owned locale JSON.
- Validation reports.
- Redacted command logs.

Forbidden:

- LLM provider keys.
- JWTs and backend tokens.
- Cookies and auth headers.
- Raw production API responses.
- Product SDK source copied into prompts.

## Dependencies

- ITS-ai-dashboard-builder-003: product SDK pilot shape and ipavo reference.
- ITS-ai-dashboard-builder-006: local-agent-assisted generator execution path.
- ITS-ai-dashboard-builder-012: backend proxy and credential handling.
- ITS-ai-dashboard-builder-013: chart extension browser and generated widget promotion.

## Open Implementation Choices

These are implementation decisions for the productization phase, not v0.1 blockers:

- Transport: local HTTP on loopback, stdio child process, or editor extension bridge.
- Patch application: unified diff, file replacement, or agent-native edits.
- Preview host: reuse product app preview route or workbench-owned preview frame.
- Audit log storage: repo-local artifact files or workbench-local database.
