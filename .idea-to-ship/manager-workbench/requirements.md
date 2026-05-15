# Requirements - Manager Workbench

**Slug:** manager-workbench
**Date:** 2026-05-14
**Status:** draft
**Source:** Post-v0.1 NEXT candidate `ITS-ai-dashboard-builder-017`; default assumptions approved by user.

## Problem

v0.1 proves that AI Dashboard Builder can run through a local-agent-assisted
flow: plan first, human approval, DashboardConfig and locale generation,
validation, preview, and product checks. That flow is still engineer-operated
and artifact-driven. Product-facing users who need to request or review a
dashboard do not yet have a single workbench that shows the plan, generated
config, i18n resources, preview, validation state, and safe export boundary.

The manager-facing workbench should make the existing workflow repeatable for
internal platform and product frontend teams without moving credentials,
business SDK implementations, or production responses into prompts or browser
state. It should productize the local generation experience while preserving
the v0.1 safety model.

## Users / Actors

- Internal platform frontend engineer: maintains the catalog, prompts,
  validation profiles, and bridge allowlists used by the workbench.
- Product frontend engineer: describes the desired dashboard, reviews the plan,
  previews generated artifacts, and exports approved files into a product app.
- Dashboard reviewer / manager: reviews intent, widget choice, preview output,
  validation status, and final handoff before accepting a generated dashboard.
- Local agent bridge: performs bounded file reads, file writes, and verification
  commands after explicit approval.
- Security / platform reviewer: audits the credential boundary, file-write
  scope, prompt inputs, and command permissions.

## In Scope

- A local or internal-only workbench flow for creating one dashboard draft at a
  time from a natural-language brief.
- Catalog-driven selection of available widgets, dataSources, themes, layouts,
  and locale targets from existing AI Catalog metadata.
- Plan-first generation with explicit human approval before DashboardConfig and
  locale resources are generated.
- Generation of DashboardConfig plus separate locale JSON resources.
- Preview through the existing dashboard runtime using mock, sample, or catalog
  example data only.
- Schema, layout, i18n, dataSource, widget, and interval validation before
  preview or export.
- A local bridge permission model with configured read/write allowlists,
  command allowlists, dry-run output, and approval gates.
- Export or file-write of approved dashboard artifacts into allowlisted product
  directories.
- Audit logging for user brief, generated plan, approvals, artifact targets,
  validation results, bridge commands, and write decisions.
- Explicit handling of validation failures, preview failures, denied writes, and
  secret-like input.

## Out of Scope / Non-Goals

- Hosted multi-tenant manager UI.
- Server-side backend or JWT proxy implementation.
- Real backend URLs, JWTs, cookies, business SDK implementations, or raw
  production responses in prompts, browser state, DashboardConfig, or logs.
- Registry publishing, package-manager consumption, or external install
  verification.
- Dashboard persistence, versioning, release approval workflow, and rollback
  history beyond the current draft session and exported artifacts.
- Chart extension browser, generated widget promotion UI, or online chart
  fetching.
- AI generation of arbitrary Vue pages, business workflow logic, authentication,
  authorization, backend aggregation, or SDK calls.
- Automatic commit, push, or PR creation from the workbench MVP.
- Full BI semantic layer or cross-product metric governance.

## Functional Requirements

1. **FR-1:** The workbench must let an internal user start a dashboard draft
   with title, product context, target locale list, target artifact directory,
   and a natural-language dashboard brief.
2. **FR-2:** The workbench must display the catalog metadata available to the
   generator, including widget types, dataSource keys, themes, layout presets,
   examples, and compatibility hints.
3. **FR-3:** Catalog display and generator input must exclude query functions,
   SDK source, tokens, cookies, backend URLs, and raw production responses.
4. **FR-4:** The workbench must generate a Dashboard Plan before generating any
   DashboardConfig or locale JSON.
5. **FR-5:** The Dashboard Plan must list intended widgets, dataSources, layout
   choices, locale assumptions, missing capabilities, and any fallback to mock
   or sample data.
6. **FR-6:** The workbench must require explicit human approval of the plan
   before allowing config or locale generation.
7. **FR-7:** The workbench must generate DashboardConfig and locale JSON as
   separate artifacts.
8. **FR-8:** Generated user-visible text must be represented by i18n keys and
   corresponding locale resources, not hardcoded only inside DashboardConfig.
9. **FR-9:** The workbench must validate generated DashboardConfig with the
   existing schema before preview and before export.
10. **FR-10:** Validation must fail for unknown widget types, unknown dataSource
    keys, invalid params, invalid props, missing i18n resources, layout overflow,
    and refresh intervals below the platform minimum.
11. **FR-11:** The preview must render with the existing runtime and registered
    widgets using mock, sample, or catalog example data.
12. **FR-12:** The MVP preview must not require real backend connectivity,
    PRODUCT_* env vars, JWTs, cookies, or product SDK network calls.
13. **FR-13:** The workbench must surface preview loading, empty, validation,
    data, and widget render errors without crashing the whole draft session.
14. **FR-14:** The user must be able to revise the brief or plan and regenerate
    a draft without mutating product files.
15. **FR-15:** Before any file write, the workbench must show the proposed
    artifact paths, whether files already exist, and the exact write action.
16. **FR-16:** File writes through the local bridge must be limited to configured
    allowlisted dashboard, locale, sample-data, and documentation paths.
17. **FR-17:** File writes must require explicit approval after the user reviews
    the proposed paths and diff or dry-run content.
18. **FR-18:** The bridge must reject writes outside the allowlist even if the
    generated plan or user brief asks for them.
19. **FR-19:** Existing files must not be overwritten silently; the workbench
    must require an explicit overwrite, merge, or cancel decision.
20. **FR-20:** The workbench must run only configured verification commands and
    must display their pass/fail result to the user.
21. **FR-21:** The bridge must not commit, push, open a PR, install packages, or
    run arbitrary shell commands in the MVP.
22. **FR-22:** The workbench must block or require removal of secret-like input
    such as JWTs, cookies, API keys, private backend URLs, and password fields
    before sending content to the generator or writing logs.
23. **FR-23:** The workbench must keep an audit record of each draft's brief,
    plan approval, generated artifact summary, validation result, preview
    status, write approval, write targets, and verification commands.
24. **FR-24:** When validation or preview fails, the workbench must preserve the
    last approved plan and generated artifacts so the user can inspect, revise,
    or discard them.
25. **FR-25:** If the requested dashboard needs a custom generated chart widget,
    the workbench must route that requirement to the generated chart sandbox
    path instead of bypassing the sandbox or promoting the widget directly.
26. **FR-26:** The final handoff must summarize generated files, validation
    status, preview status, checks run, known assumptions, and next manual steps.

## Non-Functional Requirements

- **Performance:** Model/generation latency is not critical for MVP. Non-model
  workbench interactions should remain responsive while generation or checks are
  running, and preview performance must not be worse than the existing runtime
  for the same config and mock data.
- **Scale:** MVP supports one local user and one dashboard draft at a time. It
  is not required to support concurrent editing, multi-tenant sessions, or
  dashboard history.
- **Reliability / failure mode:** Invalid input, denied permissions, failed
  generation, failed validation, failed preview, failed checks, and failed file
  writes must produce visible errors and preserve the user's last reviewable
  state. Silent mutation is not acceptable.
- **Security / compliance:** AI sees only catalog metadata, user brief, approved
  plan context, generated artifacts, and mock/sample data. Secrets, credentials,
  SDK implementations, production responses, and arbitrary workspace files stay
  outside prompts and logs. Bridge writes and commands are allowlist-only and
  approval-gated.
- **Platform / constraints:** Reuse the current TypeScript, Vue 3.3.x, Vite,
  Vitest, Zod schema, dashboard runtime, AI Catalog, and product-integration
  validation patterns. The workbench must remain compatible with the existing
  v0.1 safety boundary.
- **Internationalization:** Generated dashboards must include locale resources
  for every locale selected at draft creation.
- **Maintainability:** The workbench orchestrates existing contracts rather than
  introducing a second DashboardConfig schema, a second catalog format, or a new
  unchecked generation path.

## Success Criteria

- `new draft captures required setup fields -> verify: workbench test rejects a draft missing title, product context, locales, target directory, or brief`.
- `catalog sent to generation hides implementation details -> verify: catalog fixture contains metadata/schema/examples but no query function, SDK source, token, cookie, backend URL, or raw response`.
- `plan gate blocks premature config generation -> verify: attempting config generation before plan approval returns a blocked state`.
- `approved plan generates separate config and locale artifacts -> verify: sample generation produces one DashboardConfig file and zh-CN/en-US locale JSON files`.
- `generated artifacts validate before preview -> verify: validation test rejects unknown widget, unknown dataSource, missing i18n key, layout overflow, invalid params, invalid props, and too-low refresh interval`.
- `preview does not require real credentials -> verify: preview e2e runs with PRODUCT_* env vars absent and renders from mock/sample data`.
- `preview failures are contained -> verify: a broken widget or invalid sample data shows a draft-level or widget-level error while the draft session remains usable`.
- `bridge writes are allowlist-only -> verify: write attempts outside configured dashboard/locale/sample-data/docs paths are rejected`.
- `writes require explicit approval -> verify: approved writes create or update the requested artifacts, while unapproved writes leave the worktree unchanged`.
- `existing files are protected -> verify: exporting to an existing target requires overwrite, merge, or cancel, and cancel leaves the file unchanged`.
- `secret-like input is blocked -> verify: JWT, cookie, API key, password, and private backend URL fixtures are rejected before generation/logging`.
- `verification result is visible -> verify: configured validation and test commands show pass/fail state and captured output summary in the final handoff`.
- `no automatic git mutation -> verify: workbench MVP cannot commit, push, or open PRs through the bridge`.
- `custom chart requests stay gated -> verify: unsupported visualization requests create a generated-chart sandbox handoff instead of registering a widget directly`.
- `final handoff is complete -> verify: completed draft summary lists generated paths, validation status, preview status, checks, assumptions, and unresolved follow-ups`.

## Open Questions

- The exact workbench host is not decided: it could live in `apps/demo`,
  `apps/product-integration`, a new internal app, or the standalone playground.
- The local bridge transport is not decided: HTTP localhost service, CLI
  process wrapper, Codex/OpenCode task file, or another protocol.
- The initial write allowlist is assumed to cover dashboard config, dashboard
  locale JSON, sample data, and documentation paths, but exact path patterns
  should be finalized in architecture.
- The default verification command set is assumed to include config validation
  and relevant package tests, but exact commands should be chosen in
  architecture after the host location is selected.
- Draft persistence is limited to the current session by default. If product
  managers need saved drafts, approvals, version history, or rollback, that
  should become a separate persistence/versioning requirement.
- The specific LLM provider, prompt execution location, retry behavior, and
  token/cost budget are not defined.
- Accessibility requirements for the workbench UI are not yet quantified beyond
  standard internal-tool usability expectations.

## Touch Points

- `.idea-to-ship/ai-dashboard-builder/requirements.md` - existing v0.1 product
  contract, safety boundaries, AI catalog constraints, and generated chart gate.
- `.idea-to-ship/ai-dashboard-builder/release-gate.md` - v0.1 GO criteria and
  explicit post-v0.1 exclusions for manager workbench and local agent bridge.
- `.idea-to-ship/ai-dashboard-builder/roadmap.post-v0.1.md` - NEXT candidate
  source for `ITS-ai-dashboard-builder-017`.
- `docs/ai-dashboard-v0.1-adoption.md` - local-agent-assisted generation path,
  credential boundary, validation commands, and product integration model.
- `packages/ai-dashboard-schema/` - DashboardConfig and validation schema.
- `packages/ai-dashboard-runtime/` - runtime contracts and validation helpers.
- `packages/ai-dashboard-vue/` - Vue runtime preview surface.
- `packages/ai-dashboard-ai-catalog/` - metadata surface exposed to generation.
- `packages/ai-dashboard-sandbox/` - generated chart validation path for custom
  visualization requests.
- `apps/product-integration/src/dashboard-validation.ts` - product-side
  validation pattern.
- `apps/product-integration/src/dashboards/` - canonical dashboard and locale
  artifact layout for exports.
