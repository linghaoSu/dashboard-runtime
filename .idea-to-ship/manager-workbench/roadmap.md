---
goal: "Asset-driven Manager Workbench implementation roadmap"
horizon: "manager-workbench MVP planning pass"
generated_at: "2026-05-15 CST"
repo_head: "5504b6f"
mode: "slug"
slug: "manager-workbench"
source_scope: "local requirements, v0.1 planning artifacts, and committed workbench assets"
write_target: ".idea-to-ship/manager-workbench/roadmap.md"
final_lanes_written: "no - candidate priority approval required"
---

# Candidate Brief - Manager Workbench Asset Roadmap

This file is a Candidate Brief, not the final Now/Next/Later roadmap. The
current request asked for a new roadmap based on `assets/`, and the assets are
all `AI Dashboard Builder Workbench` screens. Because no explicit final lane
priority was provided, final roadmap lanes are intentionally blocked until the
priority table at the end is approved or edited.

## Source Plan

Included sources:

| Source | Budget / Freshness | Evidence Role |
|---|---|---|
| Current user request | `$idea-to-ship:roadmap` based on `assets/` | Goal signal and visual-source constraint |
| `assets/workbench-*.png` | All 10 committed PNGs at repo head `5504b6f` | Visual evidence for workbench screens, states, and flow order |
| `.idea-to-ship/manager-workbench/requirements.md` | Full artifact | Accepted scope, functional requirements, success criteria, and open questions |
| `.idea-to-ship/ai-dashboard-builder/release-gate.md` | Relevant v0.1 boundary lines | Release constraints and explicit post-v0.1 exclusions |
| `.idea-to-ship/ai-dashboard-builder/roadmap.post-v0.1.md` | Relevant candidate lines | Source candidate for manager-facing workbench and bridge work |
| `docs/ai-dashboard-v0.1-adoption.md` | Relevant generation/proxy/check lines | Local-agent workflow, credential boundary, product checks |
| `package.json` | Root manifest only | Available workspace check commands and private package boundary |

Excluded sources:

- Git history mining beyond current HEAD: not requested.
- TODO/FIXME mining: not requested.
- GitHub issue/PR/milestone mining: not requested.
- Network/package-registry lookup: not requested.
- Implementation source deep dive: roadmap stage only; architecture owns design.

Freshness:

- Current repo HEAD is `5504b6f`, which added the renamed workbench screen
  assets.
- Working tree was clean before writing this Candidate Brief.
- `.idea-to-ship/manager-workbench/requirements.md` is a draft requirements
  artifact dated 2026-05-14, sourced from post-v0.1 candidate
  `ITS-ai-dashboard-builder-017`.

Asset reading notes:

| Asset | Observed Workbench State |
|---|---|
| `assets/workbench-brief-safety-boundary.png` | Brief step with required setup fields and allowed/blocked input guidance |
| `assets/workbench-catalog-widget-metadata.png` | Catalog browsing with widgets, schemas, examples, and implementation-hidden dataSources |
| `assets/workbench-plan-approval-review.png` | Plan approval step with visual preview, checklist, and approve/request-change actions |
| `assets/workbench-config-i18n-editor.png` | Generated DashboardConfig, locale JSON, and sample-data artifact workspace |
| `assets/workbench-validation-all-passed.png` | Validation results with all checks passing and command-result cards |
| `assets/workbench-validation-failed.png` | Validation failure summary with blocking issues and repair actions |
| `assets/workbench-preview-success.png` | Runtime preview using mock data with run events, binding summary, and readiness state |
| `assets/workbench-preview-partial-failure.png` | Preview partial failure with widget-level error containment and disabled export |
| `assets/workbench-bridge-export-approval.png` | Bridge export confirmation with file list, diff preview, allowlist summary, and disabled git actions |
| `assets/workbench-bridge-write-rejected.png` | Bridge write rejection when an output path violates the allowlist |

## Candidate Work

| ID | Title | Status | Work Type | Evidence Class | Confidence | Source Anchors | Suggested Action |
|---|---|---|---|---|---|---|---|
| ITS-manager-workbench-001 | Write asset-grounded architecture and stage plan | Candidate | Docs | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:184-202`, `assets/workbench-brief-safety-boundary.png`, `assets/workbench-bridge-export-approval.png` | Run `/architect --slug manager-workbench` using the 10 assets as visual source; decide host app, bridge transport, verification commands, and first vertical slice before implementation. |
| ITS-manager-workbench-002 | Build draft intake and safe catalog context surface | Candidate | Feature | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:77-84`, `.idea-to-ship/manager-workbench/requirements.md:123-125`, `assets/workbench-brief-safety-boundary.png`, `assets/workbench-catalog-widget-metadata.png` | Implement after architecture selects the host; verify required fields, secret-like input blocking, and catalog metadata redaction. |
| ITS-manager-workbench-003 | Implement plan review and approval gate | Candidate | Feature | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:85-91`, `.idea-to-ship/manager-workbench/requirements.md:168-170`, `docs/ai-dashboard-v0.1-adoption.md:465-469`, `assets/workbench-plan-approval-review.png` | Make plan approval the first enforced generation gate; config/i18n generation must remain blocked until approval. |
| ITS-manager-workbench-004 | Implement generated config, i18n, and sample-data workspace | Candidate | Feature | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:92-100`, `.idea-to-ship/manager-workbench/requirements.md:160-164`, `.idea-to-ship/manager-workbench/requirements.md:171-172`, `assets/workbench-config-i18n-editor.png` | Generate separate DashboardConfig and locale artifacts, with sample data kept distinct from credentials or SDK implementation. |
| ITS-manager-workbench-005 | Implement validation and preview readiness gates | Candidate | Feature | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:96-106`, `.idea-to-ship/manager-workbench/requirements.md:129-131`, `.idea-to-ship/manager-workbench/requirements.md:172-174`, `package.json:10-18`, `assets/workbench-validation-all-passed.png`, `assets/workbench-validation-failed.png`, `assets/workbench-preview-success.png`, `assets/workbench-preview-partial-failure.png` | Wire schema/layout/i18n/dataSource/widget/refresh validation before preview/export; keep preview mock-data-only for MVP and contain widget-level failures. |
| ITS-manager-workbench-006 | Implement bridge export approval and allowlist rejection flow | Candidate | Feature | Artifact | High | `.idea-to-ship/manager-workbench/requirements.md:109-122`, `.idea-to-ship/manager-workbench/requirements.md:151-155`, `.idea-to-ship/manager-workbench/requirements.md:175-180`, `assets/workbench-bridge-export-approval.png`, `assets/workbench-bridge-write-rejected.png` | Build dry-run output, explicit approval, allowlisted writes, existing-file protection, command allowlist, and hard rejection for out-of-scope paths; keep commit/push/PR disabled in MVP. |
| ITS-manager-workbench-007 | Add audit log, verification history, and final handoff summary | Candidate | Feature | Explicit | Medium | `.idea-to-ship/manager-workbench/requirements.md:126-136`, `.idea-to-ship/manager-workbench/requirements.md:179-182`, `assets/workbench-validation-all-passed.png`, `assets/workbench-bridge-export-approval.png` | Keep as a follow-up unless product reviewers require audit browsing before the first internal pilot; final handoff summary is required for MVP exit. |

## Unverified Signals

- The screenshots imply a polished desktop UI, but they do not decide the
  implementation host. Requirements still leave `apps/demo`,
  `apps/product-integration`, a new internal app, or the standalone playground
  open (`.idea-to-ship/manager-workbench/requirements.md:184-187`).
- The screenshots show sidebar entries for Bridge settings, validation history,
  and audit logs, but only validation/export states are visually specified in
  the provided assets. Dedicated audit-log and settings screens remain
  under-specified.
- The screenshots use desktop widths and mock data. Mobile/tablet behavior,
  keyboard accessibility, and exact accessibility thresholds are not evidenced
  by the assets (`.idea-to-ship/manager-workbench/requirements.md:201-202`).
- The local bridge transport remains undecided: HTTP localhost service, CLI
  wrapper, Codex/OpenCode task file, or another protocol
  (`.idea-to-ship/manager-workbench/requirements.md:188-189`).
- The exact LLM provider, retry behavior, cost/token budget, and generation
  execution location remain open (`.idea-to-ship/manager-workbench/requirements.md:199-200`).

## Conflicts

None blocking candidate prioritization.

Potential ambiguity:

- `.idea-to-ship/ai-dashboard-builder/roadmap.post-v0.1.md` recommends
  workbench implementation after product pilot, packaging, and proxy planning
  at the broader `ai-dashboard-builder` scope
  (`.idea-to-ship/ai-dashboard-builder/roadmap.post-v0.1.md:117-119`). This
  slug roadmap is narrower: it sequences manager-workbench work if the user or
  platform lead chooses to proceed with the asset-backed workbench program now.
- The assets include `Export` / publish wording, but requirements explicitly
  forbid automatic commit, push, PR creation, package publishing, and arbitrary
  shell commands in the MVP (`.idea-to-ship/manager-workbench/requirements.md:64-72`,
  `.idea-to-ship/manager-workbench/requirements.md:119-122`). The candidate
  keeps export limited to allowlisted local artifact writes.

## Open Decisions

| Decision | Options | Recommended Option | Decision Owner | Needed By | Impact If Delayed |
|---|---|---|---|---|---|
| Workbench host | `apps/demo`; `apps/product-integration`; new internal app; standalone playground | New internal app if productized UI is expected; otherwise `apps/product-integration` for fastest proof | Platform lead | Before `/architect` exits | UI and package boundaries can drift, and preview/runtime dependencies may be wired into the wrong host. |
| Bridge transport | Local HTTP service; CLI wrapper; Codex/OpenCode task file; another protocol | Start with a CLI/task-file bridge behind explicit dry-run/approval; defer localhost server until security review | Platform + security reviewer | Before bridge implementation | Write permissions and command policy cannot be verified objectively. |
| First vertical slice | Brief -> plan only; brief -> plan -> config; brief -> plan -> config -> validation | Brief -> plan approval -> config/i18n validation, with preview/export stubbed | Platform lead | Before implementation starts | Work may over-invest in visual polish before the core safety gate is enforced. |
| Asset fidelity level | Pixel-match every screen; functional parity only; hybrid | Functional parity with the asset state model and local design-system conventions | Product reviewer | Before UI implementation | Engineering may spend time matching mock details that are not required for MVP. |
| Verification commands | Config validation only; package tests; root checks; product integration checks | Start with config validation plus focused package tests, then add root checks at release gate | Frontend platform engineer | Before validation UI | The UI may display checks that do not map to real commands. |
| Audit storage | In-memory draft state; local JSON log; product-managed storage | In-memory plus exportable local JSON log for MVP | Security/platform reviewer | Before audit feature | Reviewer handoff may lack enough evidence, or storage scope may exceed MVP. |

## Rejected / Not Roadmap-Relevant

- Hosted multi-tenant manager UI remains out of scope
  (`.idea-to-ship/manager-workbench/requirements.md:60`).
- Server-side backend or JWT proxy implementation remains out of scope for this
  slug (`.idea-to-ship/manager-workbench/requirements.md:61`) even though the
  broader v0.1 adoption guide documents proxy constraints
  (`docs/ai-dashboard-v0.1-adoption.md:412-434`).
- Registry publishing and external package-manager consumption remain out of
  scope (`.idea-to-ship/manager-workbench/requirements.md:64-65`,
  `.idea-to-ship/ai-dashboard-builder/release-gate.md:15`).
- Real backend URLs, JWTs, cookies, SDK implementations, and production
  responses must not enter prompts, browser state, configs, or logs
  (`.idea-to-ship/manager-workbench/requirements.md:62-63`,
  `docs/ai-dashboard-v0.1-adoption.md:481-485`).
- Chart extension browser and generated widget promotion UI are out of this
  roadmap unless a separate chart-promotion slug is opened
  (`.idea-to-ship/manager-workbench/requirements.md:68-69`).
- Automatic commit, push, or PR creation stays rejected for the MVP
  (`.idea-to-ship/manager-workbench/requirements.md:72`,
  `.idea-to-ship/manager-workbench/requirements.md:180`).

## Priority Approval Needed

Proposed default priority for a final asset-driven manager-workbench roadmap:

| Lane | Candidate IDs | Rationale |
|---|---|---|
| Now | ITS-manager-workbench-001, ITS-manager-workbench-002, ITS-manager-workbench-003 | Decide architecture, prove safe intake/catalog context, and enforce the plan approval gate before any artifact mutation. |
| Next | ITS-manager-workbench-004, ITS-manager-workbench-005, ITS-manager-workbench-006 | Add generated artifacts, objective validation/preview readiness, and bridge export only after the plan gate is in place. |
| Later | ITS-manager-workbench-007 | Audit browsing and final handoff are required for MVP exit, but can follow the core draft-to-export safety path unless reviewers demand them earlier. |

To write final Now/Next/Later lanes, approve or edit the priority table above
and rerun `/roadmap --slug manager-workbench --final` with that priority
instruction.
