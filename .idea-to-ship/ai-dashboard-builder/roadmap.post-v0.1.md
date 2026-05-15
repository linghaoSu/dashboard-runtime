---
goal: "AI Dashboard Builder post-v0.1 productization roadmap"
horizon: "post-v0.1"
generated_at: "2026-05-13 17:00 CST"
repo_head: "3823649"
release_candidate_head: "c5fc6b4"
dirty_worktree: "no before writing this brief"
mode: "slug"
slug: "ai-dashboard-builder"
source_scope: "local artifacts and docs only"
write_target: ".idea-to-ship/ai-dashboard-builder/roadmap.post-v0.1.md"
---

# Candidate Brief — AI Dashboard Builder post-v0.1

This is a candidate brief, not the final Now/Next/Later roadmap. The existing
v0.1 roadmap has been preserved at `.idea-to-ship/ai-dashboard-builder/roadmap.md`
because it records the `c5fc6b4` GO decision.

## Source Plan

Included sources:

| Source | Budget / Freshness | Evidence Role |
|---|---|---|
| Current user request | `$idea-to-ship roadmap post-v0.1` | Goal and horizon signal |
| `.idea-to-ship/ai-dashboard-builder/requirements.md` | Full artifact | Accepted product scope, non-goals, open questions, NFRs |
| `.idea-to-ship/ai-dashboard-builder/release-gate.md` | Full artifact | v0.1 release decisions and explicit follow-ups |
| `.idea-to-ship/ai-dashboard-builder/roadmap.md` | Full artifact | Completed v0.1 state and existing post-v0.1 candidate directions |
| `.idea-to-ship/ai-dashboard-builder/code-review.md` | Full artifact | Review result and residual release warnings |
| `.idea-to-ship/ai-dashboard-builder/test-plan.md` | Full artifact | Verification coverage and known gaps |
| `docs/ai-dashboard-v0.1-adoption.md` | Full artifact | Product adoption path, proxy boundary, known limits |
| `docs/mcp-echarts.md` | Full artifact | Generated chart helper boundary and sandbox gate |
| `package.json` / workspace manifests | Bounded manifest check | Release surface and private package model |

Excluded sources:

- Git history mining beyond current HEAD: not requested.
- TODO/FIXME mining: not requested.
- GitHub issue/PR/milestone mining: not requested.
- Network/package-registry lookups: not requested.

Freshness:

- Current repo HEAD is `3823649`, which records the v0.1 candidate GO.
- v0.1 release candidate head is `c5fc6b4`.
- `release-gate.md` records GO for internal source/commit evaluation at
  `c5fc6b4` and explicitly excludes registry publishing and productized UI
  work from v0.1.

## Candidate Work

| ID | Title | Status | Work Type | Evidence Class | Confidence | Source Anchors | Suggested Action |
|---|---|---|---|---|---|---|---|
| ITS-ai-dashboard-builder-014 | Execute first real product adoption pilot from `c5fc6b4` | Candidate | Feature | Explicit | High | `release-gate.md:19-24`, `docs/ai-dashboard-v0.1-adoption.md:401-410`, `docs/ai-dashboard-v0.1-adoption.md:471-479`, `roadmap.md:302-306` | Approve as first post-v0.1 Now item; run `/brainstorm --slug product-adoption-pilot` for product/team/success criteria before implementation. |
| ITS-ai-dashboard-builder-015 | Package publishing and clean external consumer install plan | Candidate | Release | Explicit | High | `release-gate.md:15`, `release-gate.md:40-44`, `docs/ai-dashboard-v0.1-adoption.md:60-62`, `docs/ai-dashboard-v0.1-adoption.md:490-492` | Approve as release-planning item after pilot scope is known; define registry namespace, provenance, peer deps, pack/install verification, and rollback. |
| ITS-ai-dashboard-builder-016 | Productized server-side backend/JWT proxy service | Candidate | Security | Explicit | High | `release-gate.md:53-54`, `docs/ai-dashboard-v0.1-adoption.md:412-443`, `requirements.md:116`, `roadmap.md:313` | Approve as security design item before any hosted workbench accepts backend URLs/JWTs; run `/brainstorm --slug backend-proxy-service`. |
| ITS-ai-dashboard-builder-017 | Manager-facing dashboard workbench requirements | Candidate | Feature | Artifact | Medium | `release-gate.md:45`, `release-gate.md:56`, `requirements.md:18-19`, `requirements.md:139-147`, `roadmap.md:312` | Run `/brainstorm --slug manager-workbench`; keep out of implementation until users, storage, approvals, preview, and rollback are explicit. |
| ITS-ai-dashboard-builder-018 | Local Codex/OpenCode bridge protocol and permission model | Candidate | Feature | Artifact | Medium | `release-gate.md:56`, `docs/ai-dashboard-v0.1-adoption.md:465-469`, `requirements.md:90-97`, `roadmap.md:309` | Treat as design spike under the workbench program; specify file-write boundaries, audit log, approval checkpoints, and failure recovery. |
| ITS-ai-dashboard-builder-019 | Chart extension browser and generated widget promotion UI | Candidate | Feature | Artifact | Medium | `requirements.md:98-103`, `docs/mcp-echarts.md:56-63`, `release-gate.md:57`, `release-gate.md:86`, `roadmap.md:314` | Approve only after sandbox preview host ownership is decided; run `/brainstorm --slug chart-extension-promotion`. |
| ITS-ai-dashboard-builder-020 | Performance and lazy-loading hardening after real pilot feedback | Candidate | Maintenance | Artifact | Medium | `requirements.md:113-114`, `release-gate.md:59`, `release-gate.md:114-117`, `docs/ai-dashboard-v0.1-adoption.md:494`, `roadmap.md:293-295` | Keep as Next/Later until pilot metrics or bundle budget failures create concrete thresholds. |
| ITS-ai-dashboard-builder-021 | Dashboard persistence, versioning, and approval workflow | Candidate | Feature | Inferred | Low | `requirements.md:54`, `requirements.md:144`, `release-gate.md:45`, `requirements.md:18` | Do not promote yet; collect product workflow requirements first. |
| ITS-ai-dashboard-builder-022 | Renderer-adapter expansion beyond Vue/ECharts | Candidate | Spike | Inferred | Low | `requirements.md:117`, `requirements.md:149`, `release-gate.md:42-46` | Keep in backlog unless a product pilot requires React, G2, G6, L7, D3, or Three.js. |

## Unverified Signals

- A hosted manager UI may need persistent dashboard storage, versioning, and
  approval before product teams can use it. This is plausible from
  `requirements.md:54` and `requirements.md:144`, but no accepted post-v0.1
  requirements exist yet.
- A renderer adapter beyond Vue/ECharts may become valuable. The architecture
  and requirements preserve adapter flexibility, but no product demand is
  currently cited.
- Performance work should be driven by real pilot dashboards and measured
  thresholds. Current evidence only shows accepted v0.1 Vite chunk warnings and
  hard bundle-budget pass/fail checks.

## Conflicts

None blocking candidate prioritization.

Potential ambiguity:

- The existing v0.1 roadmap marks ITS-ai-dashboard-builder-011, 012, and 013
  as `Completed`, but their completion means "direction/decision documented",
  not "productized implementation shipped". This brief therefore proposes new
  implementation/planning candidates instead of reopening those IDs.

## Open Decisions

| Decision | Options | Recommended Option | Decision Owner | Needed By | Impact If Delayed |
|---|---|---|---|---|---|
| First post-v0.1 Now item | Product pilot; registry plan; workbench requirements; proxy service | Start with product adoption pilot unless the platform lead requires registry packaging first | Platform lead + product pilot owner | Before final roadmap | Work may optimize the platform before validating product ergonomics. |
| Package consumption model | Source commit only; tarball; internal registry; public npm later | Keep source commit for pilot, plan internal registry after pilot evidence | Platform lead | Before publishing work | Package entrypoints and peer deps may be locked prematurely. |
| Workbench credential boundary | Local-only proxy; hosted server proxy; product-provided proxy | Hosted/server proxy only after explicit security design | Security/platform lead | Before workbench implementation | Backend URL/JWT handling can leak into prompts, configs, or browser code. |
| Local agent bridge authority | Read-only planning; write dashboard files; run tests; open PRs | Start with explicit file-write allowlist plus human approval before writes | Platform/product lead | Before bridge design | Agent automation may mutate product workspaces without a reversible contract. |
| Chart extension promotion | Docs-only guidance; CLI promotion; manager UI promotion | CLI or admin-only promotion first, manager UI later | Platform + security lead | Before chart browser work | Generated code could bypass sandbox validation or dependency review. |

## Rejected / Not Roadmap-Relevant

- Unified data warehouse or mandatory backend redesign remains out of scope
  (`requirements.md:44-45`).
- AI direct access to business SDKs, tokens, cookies, permissions, or raw
  production data remains forbidden (`requirements.md:46-48`,
  `requirements.md:116`, `docs/ai-dashboard-v0.1-adoption.md:430-434`).
- Full BI semantic layer remains out of scope unless a new product requirement
  explicitly reopens it (`requirements.md:49`).
- Final Now/Next/Later lanes are not written in this file yet because the user
  has not approved post-v0.1 candidate priorities.

## Priority Approval Needed

Proposed default priority for a final post-v0.1 roadmap:

| Lane | Candidate IDs | Rationale |
|---|---|---|
| Now | ITS-ai-dashboard-builder-014, ITS-ai-dashboard-builder-015, ITS-ai-dashboard-builder-016 | Validate real product adoption, unblock consumption model, and keep credential handling ahead of productized UI. |
| Next | ITS-ai-dashboard-builder-017, ITS-ai-dashboard-builder-018, ITS-ai-dashboard-builder-019, ITS-ai-dashboard-builder-020 | Productize only after pilot/proxy/package constraints are known; keep performance tied to real evidence. |
| Later | ITS-ai-dashboard-builder-021, ITS-ai-dashboard-builder-022 | Valuable but weakly evidenced until product workflow or renderer demand appears. |

To write the final roadmap lanes, approve or edit the priority table above.
