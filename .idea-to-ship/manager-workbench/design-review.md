# Design Review - Manager Workbench

**Slug:** manager-workbench
**Date:** 2026-05-15
**Reviewer:** multi-agent: architecture correctness -> Boole, Kant, Dirac, Kuhn, Lorentz; implementation/testability -> Boyle, Copernicus, Peirce, Epicurus, Nash
**Iterations:** 5
**Result:** clean
**Mode:** multi-agent
**Degradation reason:** none

## Issues Raised & Resolution

| # | Severity | Issue | Resolution |
|---|---|---|---|
| 1 | critical | Bridge trusted browser-supplied workspace roots, paths, raw command strings, and broad allowlists. | Replaced roots and commands with server-owned `workspaceRootId`, target profiles, command IDs, same-origin sessions, path normalization, `realpath`, symlink rejection, and fingerprinted approvals in `architecture.md` Interfaces and Local bridge endpoints. |
| 2 | critical | Mock preview path could not satisfy `BigScreenRuntime` without importing real product dataSources. | Added `WorkbenchPreviewProfile` and `createPreviewDataSourcesFromSamples()` contract that preserves schemas but replaces every query with catalog/example/synthetic/sanitized sample resolvers. |
| 3 | critical | Runtime preview failures were not observable without scraping rendered text. | Added optional backwards-compatible runtime/widget status event and `PreviewReport`; export gating now depends on structured preview status. |
| 4 | warning | Workbench validation issue codes would lose existing validator codes. | `WorkbenchValidationIssue.code` now preserves `DashboardConfigValidationIssue["code"]` and adds only workbench-specific codes. |
| 5 | warning | Locale artifact type assumed flat strings while runtime supports nested locale objects. | Locale resources now use `LocaleMessages` / `LocaleMessageObject` with dotted-key traversal matching runtime translation semantics. |
| 6 | warning | New app build/test convention was underspecified. | Architecture chooses the `apps/demo` Vite alias convention plus `vitest --environment jsdom` and explicit scripts. |
| 7 | warning | Bridge authority was bundled into one side-effecting stage. | Staged plan now separates bridge policy/dry-run, temp workspace writes, product target writes, verification commands, and handoff hardening. |
| 8 | critical | Bridge accepted arbitrary file content and only fingerprinted it. | Bridge now accepts structured artifacts, renders dashboard TS/JSON/Markdown server-side, validates content by server-derived category, and repeats validation at commit. |
| 9 | critical | Audit durability was too weak before side effects. | Durable bridge audit append is now a precondition for dry-run, commit, and checks; failures fail closed. |
| 10 | warning | Generator output and approval metadata were treated as typed/trusted. | Added raw-output parsing, canonical plan hashing, workbench-owned `ApprovedPlanRef`, and plan-vs-artifact validation. |
| 11 | warning | Preview profile import safety was prose only. | Every preview registry now passes a registration gate: explicit allowlist, transitive import/dependency scan, PRODUCT env/proxy/SDK denies, and network-disabled tests. |
| 12 | warning | Raw production-response-like sample data could enter prompts/logs/browser state. | Added sample-data provenance: catalog examples, generated synthetic data, or user-marked sanitized sample data only; user-pasted data is blocked until marked sanitized and secret-scanned. |
| 13 | warning | Dry-run audit side effect contradicted "no side effect" wording. | Endpoint table and stages now state dry-run has audit-append-only side effects; artifact writes start later. |
| 14 | warning | `WorkbenchCatalogProfile` was referenced but not defined. | Added explicit safe catalog profile type with JSON-safe metadata and forbidden implementation fields. |
| 15 | warning | Default verification commands were open/ambiguous. | Added target-profile-scoped command profiles for manager-workbench and product-integration typecheck, lint, test, and build. |
| 16 | warning | Host decision remained open despite Option A recommendation. | Closed MVP host decision: implementation creates `apps/manager-workbench`; product-integration pilot requires a design revision. |
| 17 | critical | Bridge evidence carried a plan hash but not a bridge-verifiable approved-plan preimage. | Added `ApprovedPlanEvidence`; bridge canonicalizes it, verifies `approvedPlanRef.planHash`, and validates artifacts against the same plan summary. |
| 18 | critical | Commit had no bridge-verifiable write approval object. | Added `WriteApprovalRef` bound to dry-run fingerprint, policy version, nonce, file actions, digests, approver, timestamp, and command IDs; commit rejects stale/mismatched/replayed approvals. |
| 19 | warning | Dry-run diff could leak unsafe existing file content. | Added read/redaction policy: existing allowlisted files are scanned before diff; unsafe content returns redacted summary/digests and blocks overwrite. |
| 20 | warning | New-file `realpath`/symlink handling was not precise. | Added deterministic path algorithm for existing and new files, including parent-chain `lstat`, symlink rejection, missing-parent creation, and final-leaf checks. |

## Review Rounds

| Round | Angle | Route | Verdict |
|---|---|---|---|
| 1 | architecture correctness | sub-agent Boole (`019e2af5-f91a-7301-ba72-bcd7f2aa2227`) | Not LGTM: 1 critical, 3 warnings. |
| 1 | implementation/testability | sub-agent Boyle (`019e2af6-4980-7fa2-bd54-d14e5c32ad9f`) | Not LGTM: 2 critical, 5 warnings. |
| 1 | UI/UX | not applicable | No `interface-design.md` present. |
| 2 | architecture correctness | sub-agent Kant (`019e2b03-3029-7823-a275-516dacf9e05c`) | Not LGTM: 2 critical, 3 warnings. |
| 2 | implementation/testability | sub-agent Copernicus (`019e2b03-bf19-7d73-b6fd-389518d79513`) | Not LGTM: 5 warnings. |
| 2 | UI/UX | not applicable | No `interface-design.md` present. |
| 3 | architecture correctness | sub-agent Dirac (`019e2b0d-c5ea-7342-91fe-e6bc95b1f4ef`) | Not LGTM: 3 warnings. |
| 3 | implementation/testability | sub-agent Peirce (`019e2b0d-c6d3-73f0-ba10-ba90137d980b`) | Not LGTM: 2 critical, 2 warnings. |
| 3 | UI/UX | not applicable | No `interface-design.md` present. |
| 4 | architecture correctness | sub-agent Kuhn (`019e2b13-54ea-7583-a988-c730b4490978`) | Not LGTM: 1 critical, 1 warning. |
| 4 | implementation/testability | sub-agent Epicurus (`019e2b13-558a-7760-b877-5b84b4577f4d`) | Not LGTM: 1 critical, 1 warning. |
| 4 | UI/UX | not applicable | No `interface-design.md` present. |
| 5 | architecture correctness | sub-agent Lorentz (`019e2b18-79dc-76a3-b560-cfcb402432f0`) | LGTM. |
| 5 | implementation/testability | sub-agent Nash (`019e2b18-7ac3-7c50-8466-8e084c950245`) | LGTM. |
| 5 | UI/UX | not applicable | No `interface-design.md` present. |

## Residual Open Issues

No accepted review blockers remain. The architecture keeps scoped open questions
for implementation planning: bridge transport shape, exact first pilot roots and
target path patterns, MVP-complete generator adapter, pixel fidelity threshold,
and future audit history/versioning.

## Design Drift

No interface design artifact exists for this slug, so UI/UX drift was not
applicable. The final architecture remains aligned with `requirements.md`: one
local/internal draft, plan-first approval, mock/sample preview only,
allowlist-only bridge writes, no git mutation, and final handoff evidence.

## Reviewer Final Verdicts

| Angle | Verdict |
|---|---|
| architecture correctness | LGTM |
| implementation/testability | LGTM |
| UI/UX | not applicable |

## Self-Review Notes

Option A still makes sense after the revisions: it keeps the bridge authority
out of `apps/product-integration`, contains the blast radius in a new private
app, and lets product-target writes be enabled only after policy, audit,
approval, artifact rendering, and target-profile verification are in place.

The staged implementation plan is independently shippable: stages 1-4 require
no bridge, stage 5 adds audit-only dry-run side effects, stage 6 writes only to
a temporary workspace, stage 7 enables product target writes with matching
verification commands, and stage 8 hardens handoff/recovery.
