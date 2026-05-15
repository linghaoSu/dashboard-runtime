# Architecture - Manager Workbench

**Slug:** manager-workbench
**Date:** 2026-05-15
**Status:** draft
**References:** requirements.md, roadmap.md, assets/workbench-*.png

## Summary

Build a new private Vue/Vite app at `apps/manager-workbench` that orchestrates
the existing dashboard contracts instead of replacing them: AI Catalog metadata
for safe context, `validateDashboardConfig` for generated config gates,
`BigScreenRuntime` plus a backwards-compatible preview status event for
mock-data preview, and `packages/ai-dashboard-sandbox` for custom chart
handoff. The chosen architecture keeps all filesystem writes and verification
commands behind a local-only bridge whose server owns workspace roots, path
profiles, command identifiers, approval fingerprints, audit append, and no git
mutation.

## Goals / Non-Goals

Goals:

- Provide a local/internal workbench for one dashboard draft at a time.
- Let users enter a brief, inspect safe catalog metadata, generate and approve
  a plan, then generate DashboardConfig plus locale JSON resources.
- Validate schema, layout, i18n, dataSource, widget, refresh interval, and
  bridge write policy before preview or export.
- Preview only with mock, sample, or catalog example data.
- Route file writes and verification commands through a local bridge with
  configured allowlists and explicit approval.
- Preserve reviewable state after generation, validation, preview, write, or
  command failures.
- Keep an audit trail and final handoff summary for each draft session.

Non-goals:

- Hosted multi-tenant manager UI.
- Server-side backend or JWT proxy implementation.
- Real backend URLs, JWTs, cookies, SDK implementations, raw production
  responses, or arbitrary workspace files in prompts, logs, browser state, or
  DashboardConfig.
- Registry publishing or external package-manager consumption.
- Dashboard version history, release approval workflow, rollback history, or
  automatic commit/push/PR creation.
- Chart extension browser or generated widget promotion UI.
- A second DashboardConfig schema, second catalog format, or unchecked
  generation path.

## Codebase Context

Explorer delegation note: the architect workflow asks for an explorer pass, but
this Codex runtime requires explicit user authorization before spawning
sub-agents. I ran the exploration in the main context and record this as a
degraded exploration path.

Relevant existing modules and conventions:

- `packages/ai-dashboard-schema/src/dashboard-config.ts` defines the
  `DashboardConfig` Zod schema. The workbench should import it and should not
  create another config schema.
- `packages/ai-dashboard-ai-catalog/src/create-widget-catalog.ts`,
  `create-data-source-catalog.ts`, `create-layout-catalog.ts`,
  `create-theme-catalog.ts`, and `create-i18n-catalog.ts` already expose
  JSON-safe generation context. Tests in
  `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` assert that
  catalogs omit query/component implementations.
- `packages/ai-dashboard-ai-catalog/src/validate-dashboard-config.ts` performs
  the core config checks needed by the workbench: schema validity, unknown
  widget/dataSource, incompatible dataSource, invalid props/params, layout
  overflow, low refresh intervals, missing i18n keys, invalid events, and ref
  errors.
- `packages/ai-dashboard-runtime/src/data-source.ts` models dataSources as
  Zod-validated request/call/transform wrappers. Catalog examples can become
  mock preview outputs without exposing `query` implementations.
- `packages/ai-dashboard-vue/src/BigScreenRuntime.vue` is the preview surface.
  It already validates config shape before rendering and routes widget events.
  `WidgetRenderer.vue` and `WidgetErrorBoundary.vue` isolate data and render
  failures at the widget shell level.
- `packages/ai-dashboard-sandbox/src/gate.ts` and `generated-registry.ts`
  define the generated chart validation and approval gate. The workbench should
  hand custom chart requests to this path instead of registering generated
  widgets directly.
- `apps/product-integration/src/dashboard-validation.ts` is the product-side
  validation pattern: validate before rendering with the product widget and
  dataSource registries.
- `apps/product-integration/src/screens/TenantCapacityScreen.vue` shows the
  current host pattern: app-level runtime state, product registry selection,
  validation issues before `BigScreenRuntime`, and no global state library.
- `apps/product-integration/src/proxy-config.ts` and its tests enforce the
  existing credential boundary for real backends. The manager workbench must
  not reuse or broaden that proxy path for MVP.
- `apps/demo` and `apps/product-integration` are private Vite apps under the
  root `pnpm-workspace.yaml`; adding `apps/manager-workbench` follows the same
  workspace pattern.

Stack and testing constraints:

- TypeScript, Vue 3.3.x, Vite, Vitest, Vue Test Utils, Zod, and workspace
  package imports are already established.
- No Pinia/router dependency exists in the repo; for MVP, use typed composables
  and local reducer-style state instead of adding a state framework.
- Root scripts run recursively (`pnpm -r --if-present typecheck|lint|test|build`);
  the new app must provide matching scripts and keep them deterministic without
  PRODUCT_* env vars.

## Cross-Skill Routing

| Signal | Routed skill | Result | Design impact |
|---|---|---|---|
| Local-agent-assisted generation, structured model outputs, approval gates, and bridge tool authority | `harness-engineering:harness-design` recommended | Not run in this architect pass; route recorded for pre-implementation hardening | Architecture defines explicit state machine, generator adapter contracts, approval gates, and command/write allowlists. |
| Draft session state, audit trail, failed-step recovery, and final handoff | `harness-engineering:resilience-plan` recommended | Not run in this architect pass; route recorded for implementation planning | Architecture keeps draft state recoverable in memory first and makes audit export an explicit artifact. |
| Filesystem writes, verification command execution, denied writes, and degraded preview paths | `antifragile:antifragile-system` recommended | Not run in this architect pass; route recorded as a design-review input | Architecture isolates side effects behind a local bridge, dry-run output, explicit approvals, and visible failure states. |
| JWTs, cookies, API keys, private backend URLs, and generated examples | `secret-scanner:scan-secrets` guidance only | No production or credential-bearing files changed in this stage, so no scan was run | Architecture adds deterministic secret-like input blocking and requires secret scanning during implementation stages that touch generated examples or bridge logs. |

## Alternatives Considered

### Option A - New Workbench App With Local Bridge

Create `apps/manager-workbench` as a private Vite app. The app owns the
workbench UI, draft state, generator adapters, validation report aggregation,
mock-data preview, audit log, and bridge client. A local-only Node bridge is
mounted through the app dev server or a companion local process and exposes
only dry-run, approved write, and allowlisted check endpoints.

**Module changes:** add `apps/manager-workbench/**`; reuse existing packages;
do not modify `apps/product-integration` except possibly sharing fixtures later.

**Data flow:** brief input -> secret guard -> safe catalog profile -> generator
plan request -> human approval -> artifact generation -> validation -> mock
preview -> bridge dry-run -> human approval -> local writes/checks -> handoff.

**Interfaces:** app-local `GeneratorAdapter`, `WorkbenchDraft`, `BridgeClient`,
`BridgePolicy`, `ValidationReport`, and `AuditEvent` TypeScript contracts.

**Pros:** smallest blast radius on existing product examples; clean separation
between workbench UX and product integration; full MVP can satisfy bridge write
requirements; easy to disable or remove if direction changes.

**Cons:** adds a third app and a new local bridge surface; initial work is
larger than embedding the UI in an existing app; bridge security needs careful
review before writes are enabled by default.

**Risk:** medium - a local bridge can mutate files if policy checks are wrong.
Mitigation is path normalization, explicit allowlists, dry-run preview,
approval tokens, no git commands, and unit/integration tests against a temp
workspace.

### Option B - Extend `apps/product-integration`

Add a workbench route or mode to `apps/product-integration`, using the existing
product widgets, product dataSources, validation code, and runtime preview
surface. Bridge behavior would live next to the product app's existing proxy
and validation code.

**Module changes:** modify `apps/product-integration/src/App.vue`, add
workbench views/components under `apps/product-integration/src`, extend tests,
and keep existing dashboard screens working.

**Data flow:** product app selects workbench mode -> same generation/approval
flow as Option A -> preview uses product registries -> bridge writes into the
product app's dashboard directories.

**Interfaces:** same app-local contracts as Option A, but imported from within
`apps/product-integration`.

**Pros:** fastest path to a realistic product preview; reuses product widget
and dataSource wiring immediately; fewer workspace files.

**Cons:** pollutes the canonical product integration example with generator UI
and bridge authority; increases risk of exposing PRODUCT_* or SDK concepts to
prompt/log surfaces; harder to keep v0.1 adoption docs simple.

**Risk:** high - it can blur the boundary between safe mock workbench preview
and real product SDK/proxy behavior. This directly conflicts with the
requirements that MVP preview not require PRODUCT_* env vars or product SDK
network calls.

### Option C - Library-First Workbench Package Plus Host Shell

Create a shared package such as `packages/ai-dashboard-workbench` for state
machine, generator contracts, validation aggregation, bridge policy, and audit
models, then add a thin app shell under `apps/manager-workbench`.

**Module changes:** add `packages/ai-dashboard-workbench/**` and
`apps/manager-workbench/**`; export public package APIs and tests.

**Data flow:** host app calls shared workbench package functions; package owns
state transitions and validation aggregation; host renders Vue screens and
calls bridge adapters.

**Interfaces:** exported `@dao-style-viz/ai-dashboard-workbench` package API
for draft state, validators, bridge policy, and generator adapters.

**Pros:** strongest separation of reusable orchestration logic; easier future
host replacement; testable non-UI logic without Vue.

**Cons:** premature public surface before the workbench MVP proves its shape;
more package/build maintenance; risks creating abstractions around a workflow
that is still being discovered from assets and internal users.

**Risk:** medium - the package API may lock in the wrong state model and create
design drift when the first product pilot changes the workflow.

## Recommendation

**We pick Option A.** A new private `apps/manager-workbench` app best fits the
repo's current private Vite app pattern while keeping the product integration
example clean and the bridge authority contained. The accepted tradeoff is
adding a new local bridge surface plus a small optional runtime status event,
but that is less risky than mixing workbench side effects into
`apps/product-integration` or publishing a reusable workbench package before
the MVP is proven.

## Chosen Design - Detail

### Module Breakdown

- `apps/manager-workbench/package.json` - private app with `dev`, `build`,
  `typecheck`, `lint`, and `test` scripts. The MVP follows the `apps/demo`
  convention: Vite aliases workspace packages to source for fast local dev and
  `vitest --environment jsdom` handles component tests. It does not add
  `build:deps` prehooks unless later package-boundary testing requires them.
- `apps/manager-workbench/vite.config.ts` - Vite config with workspace package
  source aliases and optional local-only bridge middleware. Bridge endpoints
  bind to `127.0.0.1`, require a same-origin session token, and are disabled
  for static production builds unless explicitly enabled by local config.
- `apps/manager-workbench/src/main.ts` / `src/App.vue` - app shell with the
  six-step workbench flow from the assets: Brief, Plan, Approval, Config/i18n,
  Preview, Export.
- `apps/manager-workbench/src/workbench/types.ts` - canonical app-local
  workflow types: draft input, plan, generated artifacts, validation report,
  preview report, export proposal, bridge result, and audit event.
- `apps/manager-workbench/src/workbench/draft-state.ts` - reducer/composable
  for the draft state machine. It owns allowed transitions and keeps the last
  reviewable state after failures.
- `apps/manager-workbench/src/catalog/workbench-catalog.ts` - assembles safe
  catalog profiles with `createWidgetCatalog`, `createDataSourceCatalog`,
  `createLayoutCatalog`, `createThemeCatalog`, and `createI18nCatalog`.
- `apps/manager-workbench/src/preview/preview-profile.ts` - explicit preview
  profile registry. A profile supplies widget components, safe dataSource
  schemas, safe sample resolvers, catalog metadata, locale fixtures, and design
  presets. DataSources are created only through a constrained
  `createPreviewDataSourcesFromSamples()` factory. Every preview registry,
  including package/demo registries, must pass an explicit registration gate:
  allowlist entry, transitive import/dependency scan, PRODUCT env/proxy/SDK
  deny checks, and network-disabled preview tests. Product app registries remain
  deferred until they pass the same gate in a target profile.
- `apps/manager-workbench/src/generator/generator-adapter.ts` - generator seam
  for local-agent, fixture, or future provider adapters. It accepts only safe
  catalog profile, user brief, and approved plan context.
- `apps/manager-workbench/src/security/secret-guard.ts` - deterministic
  scanner for prompt/log-blocking input classes: JWT-like values, cookies, API
  keys, password fields, and private backend URLs.
- `apps/manager-workbench/src/validation/workbench-validation.ts` - wraps
  `validateDashboardConfig` and adds locale-resource completeness, bridge
  policy readiness, secret-guard status, and final export readiness.
- `apps/manager-workbench/src/preview/PreviewRuntime.vue` - preview surface
  using `BigScreenRuntime` with generated config, the selected preview
  profile's widget registry, safe sample-only dataSources, and a `PreviewReport`
  collector fed by runtime status events.
- `packages/ai-dashboard-vue/src/BigScreenRuntime.vue`,
  `WidgetRenderer.vue`, and `WidgetErrorBoundary.vue` - add an optional
  backwards-compatible widget status event so preview code can know which
  widgets loaded, failed data validation, rendered empty, or threw during
  render without scraping DOM text.
- `apps/manager-workbench/src/bridge/policy.ts` - pure policy functions for
  server-owned workspace profiles, normalized target paths,
  overwrite/merge/cancel decisions, approval fingerprints, policy versions,
  artifact content validation, and command ID allowlists.
- `apps/manager-workbench/src/bridge/client.ts` - browser-side client for local
  bridge endpoints. It can name a server-advertised `workspaceRootId`,
  target profile, structured artifact proposals, evidence snapshots, and command
  IDs, but it never supplies an absolute workspace root, raw source file
  content, or raw shell command.
- `apps/manager-workbench/src/bridge-server/*` - local Node bridge handlers for
  dry-run, approved writes, and allowlisted verification commands. These
  handlers are the only side-effecting code in the app and own `realpath`
  checks, symlink escape rejection, origin/session-token checks, server-side
  artifact parsing/validation, durable audit append, and command execution.
- `apps/manager-workbench/src/audit/audit-log.ts` - append-only in-memory audit
  model mirrored to `sessionStorage` before side effects. Bridge dry-run,
  commit, and check operations also append server-side audit entries under the
  configured audit path so approval/write evidence survives browser refresh.
- `apps/manager-workbench/src/__tests__/*` - unit and component tests for
  draft state, catalog redaction, secret guard, validation aggregation, bridge
  policy, preview failure containment, and export gating.

Existing dashboard schema, runtime, catalog, sandbox, widget, and ECharts
contracts stay as they are for MVP except for the optional Vue runtime preview
status event called out above. If two implementation stages show that non-UI
workbench orchestration is stable and needed elsewhere, promote that logic to
`packages/ai-dashboard-workbench` later.

### Data Flow

```text
User brief
  -> secret guard
  -> safe catalog profile
  -> GeneratorAdapter.generatePlan()
  -> plan review state
  -> explicit approve
  -> GeneratorAdapter.generateArtifacts()
  -> DashboardConfig + locale JSON + sample data
  -> approved-plan/artifact consistency validation
  -> workbench validation aggregate
  -> PreviewProfile safe registry
  -> BigScreenRuntime preview with PreviewReport events
  -> export proposal
  -> BridgeClient.dryRun()
  -> explicit approve write
  -> BridgeClient.commit()
  -> BridgeClient.runChecks()
  -> audit + final handoff
```

The browser process can request generation, preview, validation, and bridge
dry-runs, but only the local bridge can touch the filesystem or run commands.
The generator receives catalog metadata and examples, never `query` functions,
widget components, SDK source, credentials, production responses, or arbitrary
workspace files.

Preview profiles are the boundary between product-specific rendering and safe
workbench preview. A profile is an allowlisted TypeScript module that exports
widget components and sample-only dataSources. For MVP, every registry must
pass `registerPreviewRegistry()` before use: explicit target-profile allowlist
entry, transitive import/dependency scan, PRODUCT_* env reader deny check, SDK
module deny check, Vite proxy-config deny check, and network-disabled preview
test. Product/app widget registries are not eligible until they pass the same
gate. DataSources must always be built by
`createPreviewDataSourcesFromSamples(registryMetadata, samples)`. That factory
preserves Zod params/output schemas and compatibility metadata, then replaces
every `query` with a resolver that returns catalog examples, generated
synthetic samples, or user-marked sanitized sample data. Preview profile files
are linted/tested against an import denylist for product SDK services, Vite
proxy config, PRODUCT_* env readers, and real app dataSource registries.

### Interfaces

```ts
import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import type {
  DashboardConfigValidationIssue,
  DashboardConfigValidationResult
} from "@dao-style-viz/ai-dashboard-ai-catalog";
import type {
  DataSourceRegistry,
  LocaleMessages,
  LocaleMessageObject,
  WidgetRegistry
} from "@dao-style-viz/ai-dashboard-runtime";
import type {
  DataSourceCatalogItem,
  I18nCatalogItem,
  LayoutPresetCatalogItem,
  ThemeCatalogItem,
  WidgetCatalogItem
} from "@dao-style-viz/ai-dashboard-ai-catalog";

export type WorkbenchCatalogProfile = {
  id: string;
  widgets: WidgetCatalogItem[];
  dataSources: DataSourceCatalogItem[];
  layouts: LayoutPresetCatalogItem[];
  themes: ThemeCatalogItem[];
  i18n: I18nCatalogItem;
  sampleRefs: Array<{
    dataSourceKey: string;
    sampleId: string;
    provenance: SampleDataProvenance;
  }>;
  redaction: {
    jsonSerializableOnly: true;
    forbiddenFields: [
      "query",
      "component",
      "function",
      "sdkSource",
      "backendUrl",
      "token",
      "cookie",
      "env"
    ];
  };
};

export type SampleDataProvenance =
  | "catalog-example"
  | "generated-synthetic"
  | "user-marked-sanitized";

export type WorkbenchDraftInput = {
  title: string;
  productContext: string;
  workspaceRootId: string;
  targetProfileId: string;
  artifactBasePath: string;
  locales: string[];
  brief: string;
};

export type DashboardPlan = {
  id: string;
  title: string;
  widgets: Array<{
    id: string;
    type: string;
    dataSource: string;
    layoutSlot?: string;
    purpose: string;
  }>;
  dataSources: string[];
  layoutPreset?: string;
  locales: string[];
  assumptions: string[];
  missingCapabilities: string[];
  usesMockOrSampleData: boolean;
  customChartHandoffs?: Array<{
    widgetId: string;
    requestedCapability: string;
    sandboxRequired: true;
  }>;
};

export type RawDashboardPlanOutput = unknown;
export type RawGeneratedArtifactsOutput = unknown;

export type ApprovedPlanRef = {
  planId: string;
  planHash: string;
  approvedAt: string;
  approvedBy: string;
};

export type ApprovedPlanEvidence = {
  planId: string;
  widgets: Array<{
    id: string;
    type: string;
    dataSource: string;
    layoutSlot?: string;
  }>;
  dataSources: string[];
  layoutPreset?: string;
  locales: string[];
  usesMockOrSampleData: boolean;
  customChartHandoffs: Array<{
    widgetId: string;
    requestedCapability: string;
    sandboxRequired: true;
  }>;
};

export type LocaleResourceMap = LocaleMessages;

export type GeneratedDashboardArtifacts = {
  config: DashboardConfig;
  localeResources: LocaleResourceMap;
  sampleData?: Record<
    string,
    {
      provenance: SampleDataProvenance;
      value: unknown;
    }
  >;
  notes: string[];
};

export interface GeneratorAdapter {
  generatePlan(input: {
    draft: WorkbenchDraftInput;
    catalog: WorkbenchCatalogProfile;
    signal?: AbortSignal;
  }): Promise<DashboardPlan>;

  generateArtifacts(input: {
    draft: WorkbenchDraftInput;
    approvedPlan: DashboardPlan;
    approvedPlanRef: ApprovedPlanRef;
    catalog: WorkbenchCatalogProfile;
    signal?: AbortSignal;
  }): Promise<GeneratedDashboardArtifacts>;
}

export type WorkbenchPreviewProfile = {
  id: string;
  label: string;
  widgets: WidgetRegistry;
  dataSources: DataSourceRegistry;
  catalog: WorkbenchCatalogProfile;
  localeMessages: Record<string, LocaleMessageObject>;
  allowedWidgetTypes: string[];
  allowedDataSourceKeys: string[];
};

export type PreviewWidgetStatus = {
  widgetId: string;
  status: "loading" | "loaded" | "empty" | "data-error" | "render-error";
  message?: string;
};

export type PreviewReport = {
  status: "ready" | "partial-failure" | "failed";
  widgets: PreviewWidgetStatus[];
  exportAllowed: boolean;
};
```

```ts
export type WorkbenchValidationIssue = {
  severity: "blocker" | "warning";
  source: "dashboard-config" | "workbench" | "bridge" | "preview";
  code: DashboardConfigValidationIssue["code"] | WorkbenchSpecificIssueCode;
  path: Array<string | number>;
  message: string;
  suggestedAction?: string;
};

export type WorkbenchSpecificIssueCode =
  | "secret_like_input"
  | "raw_response_like_sample_data"
  | "missing_locale_resource"
  | "approved_plan_mismatch"
  | "preview_profile_violation"
  | "preview_data_error"
  | "preview_render_error"
  | "preview_runtime_failed"
  | "bridge_policy_violation"
  | "custom_chart_requires_sandbox";

export type WorkbenchValidationReport = {
  status: "passed" | "failed";
  issues: WorkbenchValidationIssue[];
  dashboardConfigValidation: DashboardConfigValidationResult;
  previewAllowed: boolean;
  exportAllowed: boolean;
};
```

```ts
export type BridgeEvidence = {
  auditSnapshotId: string;
  briefHash: string;
  approvedPlanRef: ApprovedPlanRef;
  approvedPlan: ApprovedPlanEvidence;
  expectedLocales: string[];
  previewProfileId: string;
  artifactDigests: Record<string, string>;
  validationSummary: {
    status: WorkbenchValidationReport["status"];
    issueCodes: WorkbenchValidationIssue["code"][];
    exportAllowed: boolean;
  };
  previewSummary: {
    status: PreviewReport["status"];
    widgetStatuses: Array<Pick<PreviewWidgetStatus, "widgetId" | "status">>;
    exportAllowed: boolean;
  };
  sampleProvenance: Record<string, SampleDataProvenance>;
};

export type WriteApprovalRef = {
  dryRunFingerprint: string;
  policyVersion: string;
  approvalNonce: string;
  approvedAt: string;
  approvedBy: string;
  files: Array<{
    targetPath: string;
    action: "create" | "overwrite" | "merge-json";
    proposedDigest: string;
    existingDigest?: string;
  }>;
  commandIds: string[];
};

export type BridgeWriteArtifact =
  | {
      kind: "dashboard-config-ts";
      targetPath: string;
      exportName: string;
      config: DashboardConfig;
      ifExists: "fail" | "overwrite";
    }
  | {
      kind: "locale-json";
      targetPath: string;
      locale: string;
      resource: LocaleMessageObject;
      ifExists: "fail" | "overwrite" | "merge-json";
    }
  | {
      kind: "sample-data-json";
      targetPath: string;
      sampleKey: string;
      provenance: SampleDataProvenance;
      value: unknown;
      ifExists: "fail" | "overwrite" | "merge-json";
    }
  | {
      kind: "handoff-doc-md";
      targetPath: string;
      handoff: {
        generatedPaths: string[];
        validationStatus: WorkbenchValidationReport["status"];
        previewStatus: PreviewReport["status"];
        commandIds: string[];
        assumptions: string[];
        manualNextSteps: string[];
      };
      ifExists: "fail" | "overwrite";
    };

export type BridgeCommitRequest = {
  workspaceRootId: string;
  targetProfileId: string;
  dryRunFingerprint: string;
  policyVersion: string;
  writeApproval: WriteApprovalRef;
  evidence: BridgeEvidence;
  files: BridgeWriteArtifact[];
  commandIds: string[];
};

export type BridgeRunChecksRequest = {
  workspaceRootId: string;
  targetProfileId: string;
  evidence: BridgeEvidence;
  commandIds: string[];
};

export type BridgeDiffPreview =
  | { kind: "unified-diff"; text: string }
  | { kind: "redacted"; reason: string; existingDigest: string; proposedDigest: string }
  | { kind: "summary"; text: string; existingDigest?: string; proposedDigest: string };

export type BridgeDryRunRequest = {
  workspaceRootId: string;
  targetProfileId: string;
  evidence: BridgeEvidence;
  files: BridgeWriteArtifact[];
  commandIds: string[];
};

export type BridgeDryRunResult = {
  allowed: boolean;
  policyVersion: string;
  fingerprint: string;
  approvalChallenge?: {
    approvalNonce: string;
    expiresAt: string;
  };
  files: Array<{
    targetPath: string;
    resolvedRelativePath: string;
    exists: boolean;
    action: "create" | "overwrite" | "merge-json" | "reject";
    reason?: string;
    diffPreview?: BridgeDiffPreview;
  }>;
  commands: Array<{
    commandId: string;
    displayName: string;
    allowed: boolean;
    reason?: string;
  }>;
};

export type BridgeCommandProfile = {
  id:
    | "manager-workbench:typecheck"
    | "manager-workbench:lint"
    | "manager-workbench:test"
    | "manager-workbench:build"
    | "product-integration:typecheck"
    | "product-integration:lint"
    | "product-integration:test"
    | "product-integration:build";
  targetProfileId: string;
  cwd: "repo-root";
  argv: readonly string[];
  timeoutMs: number;
  output: "summary-with-first-error";
};
```

Generator-provided paths are not trusted. Export paths are derived from
`artifactBasePath`, dashboard ID, locale list, artifact category, and the
selected server-owned target profile. The workbench validates that generated
widgets, dataSources, locales, and custom-chart handoffs match the approved
plan hash before preview or export can proceed.

The bridge accepts structured artifacts, not arbitrary file bytes. Dashboard
exports are server-rendered from `DashboardConfig` through one internal emitter
that produces the existing product-style envelope:

```ts
import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";

export const <safeIdentifier>: DashboardConfig = <json-literal-config>;
```

The emitted dashboard module allows exactly one `import type` from the schema
package and one exported `const` initialized with a JSON-literal-compatible
object: no value imports, function calls, spreads, computed values, comments
containing generated source, additional statements, SDK references, or
environment reads. Locale and sample-data artifacts are server-rendered with
stable JSON serialization. Handoff docs are server-rendered from structured
summary fields. The bridge never writes TypeScript, JSON, or Markdown source
strings received directly from the browser.

The generator adapter parses model/local-agent output as runtime data, not as
trusted TypeScript. `RawDashboardPlanOutput` and `RawGeneratedArtifactsOutput`
must pass Zod schemas before they become `DashboardPlan` or
`GeneratedDashboardArtifacts`. The workbench canonicalizes the approved plan
with stable key ordering and hashes widget IDs/types, dataSource keys,
layout preset and slot assignments, locales, mock/sample-data fallback intent,
and custom-chart handoffs. The generator does not return `ApprovedPlanRef`;
the workbench attaches it after approval and rejects artifacts whose config,
locale set, sample data, or custom-chart handoff diverges from that hash.
`BridgeEvidence.approvedPlan` is the bridge-visible preimage for that hash. The
bridge canonicalizes this summary, verifies that its digest equals
`approvedPlanRef.planHash`, and then validates structured artifacts against the
same widget IDs/types, dataSource keys, layout slots, locale set,
sample-data fallback intent, and custom-chart handoff requirements before
dry-run, commit, or checks can proceed.

Sample-data provenance is mandatory. Preview data may only be catalog examples,
generated synthetic data, or explicitly user-marked sanitized sample data.
For MVP, user-pasted sample payloads are blocked by default until the user
explicitly marks them sanitized; the workbench records that label and still
runs the deterministic secret guard before preview or bridge export. Audit
entries store sample-data hashes and summaries by default; full sample payloads
are written only when their provenance is classified as safe sample data.

Local bridge endpoints:

| Endpoint | Method | Side Effect | Contract |
|---|---|---|---|
| `/__manager_workbench_bridge/session` | POST | No | Creates a short-lived same-origin session token and advertises server-owned workspace root IDs, target profiles, policy version, and command IDs. |
| `/__manager_workbench_bridge/dry-run` | POST | Yes, audit append only | Accepts only `workspaceRootId`, `targetProfileId`, structured artifact proposals, command IDs, and `BridgeEvidence`. The server resolves configured roots with `realpath`, rejects symlink escapes, derives file categories from the target profile/path, renders artifacts through internal emitters, recomputes artifact digests, validates evidence, appends a sanitized audit event, detects existing files, and returns blocked reasons plus a fingerprint. |
| `/__manager_workbench_bridge/commit` | POST | Yes | Requires same-origin session token, dry-run fingerprint, policy version, a `WriteApprovalRef`, the same structured artifacts, and matching `BridgeEvidence`. It writes only files accepted by the matching latest dry-run and appends a bridge audit event before and after the write attempt. |
| `/__manager_workbench_bridge/run-checks` | POST | Yes, command execution | Accepts only configured command IDs plus `BridgeEvidence` from the active target profile; never accepts raw shell strings, git commands, package install commands, shell metacharacters, pipelines, redirects, or user-supplied arguments. |

The dry-run fingerprint hashes the policy version, workspace root ID, target
profile ID, normalized target paths, rendered artifact digests, approved plan
hash and approved-plan summary, expected locale set, preview profile ID, sample
provenance summary, validation and preview summaries, write modes,
existing-file decisions, command IDs, and a bridge-issued nonce. Any change to
the proposed artifacts, evidence, commands, policy, or selected root invalidates
approval.

Write approval is its own bridge contract, not just a UI state. A successful
dry-run returns a short-lived approval challenge. After the user reviews paths,
diff/redaction summaries, per-file actions, overwrite/merge decisions, and
commands, the workbench sends a `WriteApprovalRef` bound to the dry-run
fingerprint, policy version, approval nonce, per-file actions, proposed and
existing digests, approver, timestamp, and command IDs. Commit rejects missing,
stale, mismatched, or replayed approval refs and persists the approval ref in
the bridge audit event before writing.

Bridge validation is repeated at dry-run and commit against the same
fingerprinted structured artifacts and rendered bytes. The server derives each
file category from the target profile and resolved path; client-supplied
categories are ignored. Dashboard artifacts must be valid `DashboardConfig`
values, must render to the strict TS envelope above, and must pass server-side
schema, approved-plan, locale, sample-data, and preview-profile constraints
before they can be written. Locale and sample-data artifacts must render as JSON
object resources with expected locale/sample provenance. Markdown docs are
allowed only for generated handoff summaries under the docs profile. Arbitrary
TypeScript imports, business logic, SDK calls, unchecked source text, and
evidence digests that do not match the server-rendered bytes are rejected even
when the path matches an allowlist.

Dry-run diff generation is also policy-gated. The bridge may read only existing
files that match the active target profile and size limit. Existing bytes are
scanned with the same secret/raw-sample guard before a diff is returned. If the
existing file contains secret-like or raw-response-like content, dry-run returns
only a redacted summary plus existing/proposed digests and blocks overwrite
until the unsafe existing content is handled manually.

Bridge command profiles are target-profile scoped. A target profile cannot
enable writes unless it also exposes verification command IDs that check the app
receiving those writes. Initial profiles:

| Target profile | Command ID | argv | cwd | Timeout | Output Policy |
|---|---|---|---|---|---|
| `manager-workbench` | `manager-workbench:typecheck` | `pnpm --filter @dao-style-viz/manager-workbench typecheck` | repo root | 120s | pass/fail plus first actionable error block |
| `manager-workbench` | `manager-workbench:lint` | `pnpm --filter @dao-style-viz/manager-workbench lint` | repo root | 120s | pass/fail plus first actionable error block |
| `manager-workbench` | `manager-workbench:test` | `pnpm --filter @dao-style-viz/manager-workbench test` | repo root | 180s | pass/fail plus failing test names and first stack frame |
| `manager-workbench` | `manager-workbench:build` | `pnpm --filter @dao-style-viz/manager-workbench build` | repo root | 180s | pass/fail plus first actionable error block |
| `product-integration` | `product-integration:typecheck` | `pnpm --filter @dao-style-viz/product-integration-example typecheck` | repo root | 180s | pass/fail plus first actionable error block |
| `product-integration` | `product-integration:lint` | `pnpm --filter @dao-style-viz/product-integration-example lint` | repo root | 180s | pass/fail plus first actionable error block |
| `product-integration` | `product-integration:test` | `pnpm --filter @dao-style-viz/product-integration-example test` | repo root | 240s | pass/fail plus failing test names and first stack frame |
| `product-integration` | `product-integration:build` | `pnpm --filter @dao-style-viz/product-integration-example build` | repo root | 240s | pass/fail plus first actionable error block |

Other product or root recursive checks are later target-profile additions, not
MVP defaults.

Default write allowlist:

- `dashboard`: `<configured-app>/src/dashboards/**/*.ts`
- `locale`: `<configured-app>/src/dashboards/**/*.i18n/*.json`
- `sample-data`: `<configured-app>/src/sample-data/**/*.json`
- `docs`: `docs/**/*.md`

Default denylist:

- `.git/**`
- `node_modules/**`
- `dist/**`
- `.env*`
- `**/*lock*`
- source files outside the allowlist
- every git command, package install command, shell pipeline, redirect, and
  command containing shell control operators
- every symlinked target path or path whose `realpath` escapes the configured
  workspace root and target profile

Path resolution is deterministic for both existing and new files: resolve the
configured workspace root and target-profile root with `realpath`; derive a
relative target path from the structured artifact kind; normalize it without
following symlinks; reject absolute paths, `..`, traversal after normalization,
and denylisted segments; `lstat` each existing parent directory and reject any
symlinked parent; create missing parent directories only inside the resolved
target-profile root; then create or replace only the final leaf. For existing
leaf files, `realpath` must remain inside the target-profile root before the
bridge reads, diffs, or writes them.

### Data / Schema Changes

No database, migration, or persistent service schema is introduced for MVP.
The workbench adds TypeScript-only app models under `apps/manager-workbench`.
Draft state is in memory and mirrored to `sessionStorage` for refresh recovery.
Before any bridge dry-run, write, or check attempt, the browser sends a
sanitized audit snapshot and `BridgeEvidence` to the bridge. The bridge
persists canonical audit events under a configured local audit directory before
performing the action: audit snapshot ID, brief hash/summary, approved plan
hash, server-recomputed artifact digests, expected locale set, preview profile,
validation result, preview report, sample provenance summary, write approval,
target paths, command IDs, and the active policy version. If audit append fails
or evidence digests do not match server-rendered bytes, dry-run, commit, and
check execution fail closed. This is not long-term dashboard history, but it
preserves approval/write/check evidence across browser refresh and failed
export.
For commit events, the canonical audit entry also includes the accepted
`WriteApprovalRef`; missing or replayed approval refs are recorded only as
rejected attempts.

Dashboard output remains the existing `DashboardConfig` plus adjacent locale
JSON resources and optional sample data. Locale resources use the existing
runtime shape, `Record<locale, LocaleMessageObject>`, not flat string maps.
Missing-key validation traverses dotted i18n keys through nested locale objects
using the same lookup semantics as `createTranslator`. Locale merge behavior is
restricted to JSON object resources; non-JSON or conflicting nested values
require overwrite or cancel rather than silent merge.

### Failure Modes & Handling

- Missing setup fields: draft cannot enter generation; field-level errors
  remain visible.
- Secret-like input: block generation and logging until removed; show the
  matched category, not the matched value.
- User-pasted sample data: block generation/preview for MVP unless the payload
  is explicitly marked sanitized by the user and passes the deterministic secret
  guard. Catalog example data and generated synthetic data are accepted without
  that user label.
- Generator failure or timeout: keep the last approved plan/artifacts and allow
  revise/regenerate.
- Plan not approved: config/i18n generation remains disabled.
- Approved-plan mismatch: if generated widgets, dataSources, layout preset,
  locales, or custom-chart handoffs are not traceable to the approved plan hash,
  preview and export are blocked until the user reviews a new plan.
- Missing or replayed write approval: commit is rejected even if the dry-run
  fingerprint is otherwise valid.
- Invalid generated config: show grouped validation issues and block preview
  and export.
- Missing locale resource: block export and show missing key/locale.
- Preview data failure: widget shell shows an error state; draft session remains
  usable; export is blocked when `PreviewReport` records data errors.
- Broken widget render: `WidgetErrorBoundary` contains the failure to the
  widget region and emits a preview status event so export gating does not rely
  on DOM scraping.
- Bridge unavailable: export actions show unavailable state; user can continue
  editing and validating but cannot write.
- Out-of-allowlist path: dry-run returns reject and commit is impossible.
- Root spoofing, traversal, symlink escape, invalid artifact content, or
  approved-plan mismatch: bridge rejects the request before diff preview and
  records a rejected dry-run audit event.
- Unsafe existing target content: dry-run returns a redacted summary/digest
  instead of a diff and blocks overwrite until the file is handled manually.
- Existing target file: dry-run requires overwrite, JSON merge, or cancel.
- Verification command fails: final handoff shows failed command and output
  summary; no git mutation is attempted.
- Browser refresh or dev-server restart: in-memory draft state may be lost, but
  sessionStorage can restore the current draft in the browser and bridge audit
  entries already appended for side-effect attempts remain on disk.
- Custom generated chart request: create a sandbox handoff item and keep
  registration blocked until `packages/ai-dashboard-sandbox` approval passes.

### Rollout / Migration

1. Host decision is closed for MVP: implementation creates
   `apps/manager-workbench`. A short-lived product-integration pilot would need
   a separate architecture revision.
2. Add the private app without changing root package publishing or existing
   product/demo behavior.
3. Add the optional runtime status event as a backwards-compatible Vue runtime
   enhancement with existing runtime tests still passing.
4. Keep bridge writes disabled until pure policy tests, audit append, artifact
   content validation, and dry-run UI pass.
5. Use fixture/manual generator adapters first so tests do not call a real LLM
   or backend.
6. Enable local bridge writes only for explicitly configured workspace root IDs
   and target profiles.
7. Add bridge command execution only after dry-run and approved-write stages
   are green, and only for target profiles with matching verification commands.
8. Add broader root checks only after focused app/package checks pass.

No migration is required for existing dashboards. Existing v0.1 apps continue
to render through their current entry points.

### Test Strategy Hooks

- Unit-test `draft-state.ts` as a state machine: brief -> plan -> approval ->
  artifacts -> validation -> preview -> export, including blocked transitions.
- Unit-test catalog profiles to prove serialized context contains schemas,
  examples, themes, layouts, and i18n rules but not `query`, `component`,
  `function`, backend URL, token, cookie, or SDK source strings.
- Unit-test `secret-guard.ts` with JWT, cookie, API key, password, and private
  backend URL fixtures.
- Unit-test sample-data provenance to block all user-pasted sample data until
  explicitly marked sanitized, then still run the deterministic secret guard;
  accept catalog examples and generated synthetic data without the user label.
- Unit-test validation aggregation with `validateDashboardConfig` fixtures for
  unknown widget, unknown dataSource, invalid props, invalid params, missing
  i18n, incompatible dataSource, invalid event payload, unknown event target,
  invalid ref, ref cycle, layout overflow, and too-low refresh interval. The
  workbench issue type must preserve the original
  `DashboardConfigValidationIssue["code"]` and apply an explicit severity map.
- Unit-test locale traversal against nested `LocaleMessageObject` resources and
  dotted i18n keys.
- Component-test the plan gate: config generation is blocked before approval.
- Unit-test approved-plan matching: changed widget type, dataSource, locale, or
  custom-chart handoff after approval blocks preview/export.
- Unit-test preview profiles to prove safe sample-only dataSources preserve Zod
  schemas and compatibility metadata, never execute real source `query`
  functions, and require no PRODUCT_* env vars. Every registry, including
  package/demo registries, must pass registration-gate tests for explicit
  allowlisting, transitive import/dependency scanning, PRODUCT env/proxy/SDK
  denies, and network-disabled preview execution before any target profile can
  enable it.
- Component-test preview success and partial failure with mock/sample
  dataSources, `BigScreenRuntime`, and `PreviewReport` status events. Export
  gating must assert against `PreviewReport`, not rendered text.
- Unit-test bridge policy with temp paths, path traversal attempts, existing
  file modes, JSON merge cases, denylisted directories, root spoofing, absolute
  paths, symlinked parents/leaves, create-file paths with missing parents,
  stale policy versions, stale fingerprints, and forbidden command IDs.
- Unit-test bridge evidence validation: approved plan hash, expected locales,
  preview profile ID, validation summary, preview summary, sample provenance,
  artifact digests, and the bridge-visible approved-plan summary must match
  server-rendered bytes before dry-run, commit, or checks can proceed.
- Unit-test write approval validation: commit rejects missing, stale,
  mismatched, or replayed `WriteApprovalRef` values and persists accepted
  approval refs in the bridge audit event.
- Unit-test bridge artifact emitters for dashboard, locale, sample-data, and
  docs categories. Dashboard `.ts` output must match the single strict type
  import plus single exported JSON-literal config envelope; tests must reject
  value imports, calls, spreads, computed values, extra statements, SDK
  references, env reads, and browser-submitted source strings.
- Unit-test dry-run diff redaction: existing allowlisted files containing
  secret-like or raw-response-like content return only redacted summary/digests
  and cannot be overwritten through the bridge.
- Integration-test bridge commit against a server-owned temporary workspace
  root ID only.
- Integration-test bridge audit append before and after dry-run, write, and
  command execution attempts. Audit append failure must fail the operation.
- Integration-test command IDs for manager-workbench typecheck, lint, test, and
  build with no user-supplied arguments.
- Integration-test product-integration target profile command IDs for
  typecheck, lint, test, and build before enabling product target writes.
- Run focused commands during implementation:
  - `pnpm --filter @dao-style-viz/manager-workbench typecheck`
  - `pnpm --filter @dao-style-viz/manager-workbench lint`
  - `pnpm --filter @dao-style-viz/manager-workbench test`
  - `pnpm --filter @dao-style-viz/manager-workbench build`

## Staged Implementation Plan

1. **Stage 1 - Workbench shell and safe draft state**: Add the private app,
   Vite aliases, jsdom test setup, six-step shell, draft input validation,
   secret guard, sample-data provenance guard, explicit `WorkbenchCatalogProfile`,
   safe catalog profile, and fixture generator. No filesystem writes. The app
   builds and tests required setup fields plus catalog redaction.
2. **Stage 2 - Plan approval and artifact binding**: Add generator adapter
   runtime schemas, plan display, approval/request-change flow, approved-plan
   hash, artifact consistency validation, browser/session audit events, and
   blocked config generation before approval. The stage proves the core safety
   gate.
3. **Stage 3 - Config/i18n validation and preview profile**: Generate separate
   DashboardConfig, nested locale JSON resources, and sample data artifacts;
   aggregate validation with `validateDashboardConfig`; introduce safe preview
   profiles with sample-only dataSources. The stage does not yet gate export on
   runtime status.
4. **Stage 4 - Preview observability and export gating**: Add the optional
   `BigScreenRuntime`/widget status event, collect `PreviewReport`, and block
   export from structured preview failures rather than DOM text.
5. **Stage 5 - Bridge policy, audit append, and dry-run UI**: Add server-owned
   workspace root IDs, target profiles, path normalization,
   `realpath`/symlink rejection including new-file parent handling, structured
   artifact emitters, bridge evidence validation, command ID allowlists, durable
   audit append, dry-run endpoint, redacted diff preview, policy version, and
   fingerprint calculation. Stage 5 writes only bridge audit entries; it
   performs no dashboard artifact writes and runs no commands.
6. **Stage 6 - Approved writes to temp workspace**: Enable approved file writes
   only against a server-owned temporary workspace profile, with stale
   fingerprint rejection, repeated evidence and artifact validation,
   existing-file decisions, and no command execution.
7. **Stage 7 - Product target writes and verification commands**: Enable
   configured product target profiles only with target-profile-scoped
   verification command IDs for the app receiving the writes. The canonical
   first target is `product-integration` with exact typecheck, lint, test, and
   build command IDs. Git commands and package installs remain blocked.
8. **Stage 8 - Handoff hardening**: Add exportable audit JSON viewer,
   bridge audit recovery documentation, verification history display, final
   handoff summary, preview failure recovery tests, and local bridge setup docs.

Every stage must leave the app buildable and testable. Stages 1-4 should not
require a local bridge process. Stage 5 introduces audit-only bridge side
effects; dashboard artifact writes do not appear until Stage 6, and each
expansion of bridge authority has its own tests before the next stage.

## Open Questions

- Should the local bridge be Vite middleware on the same dev origin or a
  separate 127.0.0.1 process with a short-lived approval token?
- What exact workspace roots and target path patterns should be enabled in the
  first real pilot?
- What generator adapter should be considered MVP-complete: fixture/manual
  adapter, local-agent task file, or a direct local model client?
- How much pixel fidelity to the current `assets/workbench-*.png` is required
  before usability review, versus functional parity with the same state model?
- Should audit history persist only as an exportable JSON artifact, or should a
  later slug define saved drafts, versioning, and rollback?
