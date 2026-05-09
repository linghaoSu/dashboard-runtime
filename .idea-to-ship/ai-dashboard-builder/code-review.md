# Code Review — ai-dashboard-builder

**Date:** 2026-05-09
**Reviewer:** Codex self-review fallback (`codex:codex-rescue` unavailable in this session)
**Iterations:** 2
**Result:** clean
**Diff size:** 15 files, +1188/-1 before review fixes

## Issues Raised & Resolution

| # | Severity | File:line | Issue | Resolution |
|---|---|---|---|---|
| 1 | warning | `packages/ai-dashboard-sandbox/src/ast-scan.ts:97` | The sandbox AST scan only inspected TypeScript files and Vue `<script>` blocks. A generated component could put forbidden browser/network calls in template expressions, for example `@click="fetch(...)"` or `{{ window.location }}`, and pass the scan. | Added Vue template expression extraction for mustache bindings and common executable directives, then added a regression test that blocks `fetch`, `window.location`, and `document.cookie` in templates. |
| 2 | warning | `packages/ai-dashboard-sandbox/src/schemas.ts:29` | Zod object schemas were not strict, so unrecognized package fields and lifecycle scripts such as `scripts.postinstall` were silently stripped instead of failing validation. A host that writes the original package to disk could still run unsafe lifecycle code. | Made generated manifest, package.json, nested scripts, and top-level package schemas strict; added a regression test that rejects `postinstall`. |

## Out-of-Scope Issues Skipped

- The demo production build still reports the known ECharts chunk-size warning. It is already recorded in the implementation log.
- The concrete preview-frame UI, CSP policy, and origin checks remain Stage 7 documented deviations/open product-host decisions.

## Design Drift

None after fixes. The implemented Stage 7 gate now matches the architecture's safety intent: schema validation, dependency allowlist, AST scan, hook contracts, preview contract, fixture tests, and disabled-by-default generated registry.

## Residual Open Issues

None.

## Final Verdict

LGTM
