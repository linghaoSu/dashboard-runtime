# Test Plan — ai-dashboard-builder

**Date:** 2026-05-09
**Target:** `packages/ai-dashboard-schema`, `packages/ai-dashboard-runtime`, `packages/ai-dashboard-vue`, `packages/ai-dashboard-widgets`, `packages/ai-dashboard-echarts-vue`, `packages/ai-dashboard-ai-catalog`, `packages/ai-dashboard-sandbox`, `apps/demo`, `apps/product-integration`, `playground/playground-ui`
**Framework:** Vitest, Vue Test Utils, TypeScript, ESLint, Vite / vue-tsc
**Run command:** `pnpm -r --if-present test`; release gate also runs `pnpm -r --if-present typecheck`, `pnpm -r --if-present lint`, `pnpm -r --if-present build`

## Scope

This plan covers the v0.1 platform behavior described by `requirements.md`: schema contracts, runtime data flow, Vue rendering, widgets/charts, AI catalog validation, generated chart sandbox gates, dashboard-owned i18n resources, and product-style SDK integration. It does not cover production publishing, a real product SDK pilot, full low-code editor/versioning flows, or generated chart preview UI/CSP ownership; those are roadmap/open-decision items.

## User Stories

| Story ID | Actor | Goal | Preconditions | Trigger | Expected Outcome | Source |
|---|---|---|---|---|---|---|
| US-1 | Platform frontend developer | Define safe dashboard, widget, data binding, event, i18n, and theme contracts | Workspace packages installed | Author or parse a DashboardConfig | Valid configs pass; malformed layouts, executable config values, and malformed refs fail clearly | FR-1..FR-4, FR-40 |
| US-2 | Dashboard runtime | Resolve refs, load data, validate params/output, and render widgets without silent failure | Registered widget and dataSource maps exist | Runtime receives a dashboard config | Widget data flows from dataSource to widget; invalid params/output and missing refs fail before unsafe rendering | FR-5, FR-7..FR-16 |
| US-3 | Dashboard viewer | Interact with locale, filters, refresh, loading/empty/error, and isolated widget failures | Dashboard is mounted in Vue runtime | Locale changes, filter events, refresh ticks, or widget errors occur | Affected widgets update; stale requests are cancelled; sibling widgets remain alive | FR-11..FR-14, FR-30..FR-32 |
| US-4 | Product frontend developer | Integrate existing proto generated TS SDK static methods without backend redesign | Product app has generated SDK imports and dashboard packages | Register dataSources and render product dashboard | SDK static method wrappers produce widget-shaped output; dashboard-owned locale files merge into host messages | FR-17..FR-21, FR-50..FR-52 |
| US-5 | AI Builder | Consume metadata and produce constrained plans/configs | DataSource/widget/theme/layout/i18n catalogs exist | AI generation or validation workflow runs | Catalogs hide executable implementation; generated configs are rejected for unknown refs, missing i18n keys, incompatible widgets, bad params, layout overflow, or low refresh interval | FR-22..FR-39, FR-47..FR-49 |
| US-6 | Platform reviewer | Gate generated chart component packages before registration | Generated chart package file map exists | Reviewer runs sandbox validation and approval gate | Unsafe APIs, lifecycle scripts, missing files, unapproved deps, failed hooks/preview, or missing approval block registration | FR-41..FR-46 |
| US-7 | Release maintainer | Verify v0.1 remains shippable as a staged implementation | Stages 1-8 are complete | Run release verification commands | Typecheck, lint, tests, builds, and product example checks pass with only documented ECharts bundle-size warnings | Roadmap ITS-ai-dashboard-builder-001, ITS-ai-dashboard-builder-008 |

## Acceptance Criteria

| AC ID | Story ID | Criterion | Verification Method | Source |
|---|---|---|---|---|
| AC-1 | US-1 | DashboardConfig accepts valid fixtures and rejects missing canvas/layout, executable props, and malformed refs | Unit: `packages/ai-dashboard-schema/src/__tests__/dashboard-config.test.ts` | Success criteria 1; FR-1..FR-4, FR-40 |
| AC-2 | US-2 | `$ref` resolver handles nested objects/arrays and fails missing refs explicitly | Unit: `packages/ai-dashboard-runtime/src/__tests__/ref-resolver.test.ts` | Success criteria 2; FR-15..FR-16 |
| AC-3 | US-2 | DataSource helper validates params, calls proto-style static methods, validates output, and surfaces failures | Unit: `packages/ai-dashboard-runtime/src/__tests__/data-source.test.ts`; product integration test | FR-9..FR-10, FR-18, FR-50 |
| AC-4 | US-2 | Data loader validates source output against widget dataSchema | Unit: `packages/ai-dashboard-runtime/src/__tests__/data-loader.test.ts` | Success criteria 5; FR-8..FR-10 |
| AC-5 | US-3 | Vue runtime routes widget events, targeted refresh, locale reloads, and widget isolation through public runtime props | Unit/Integration: `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts` | Success criteria 6, 8; FR-11..FR-14, FR-31..FR-32 |
| AC-6 | US-3 | Basic widgets render/emit observable behavior without requiring dataSource bindings | Unit: `packages/ai-dashboard-widgets/src/__tests__/basic-widgets.test.ts` | FR-29..FR-30; Stage 6 |
| AC-7 | US-3 | ECharts widgets build expected option shapes for all MVP chart types | Unit: `packages/ai-dashboard-echarts-vue/src/__tests__/chart-options.test.ts` | FR-26..FR-29; Stage 6 |
| AC-8 | US-4 | Product integration validates config, wraps SDK-style calls, merges locale resources, and localizes data-driven text | Integration: `apps/product-integration/src/__tests__/tenant-capacity.test.ts`; build command | FR-37, FR-50..FR-52; code review findings |
| AC-9 | US-5 | Catalogs omit executable dataSource/widget implementation and expose JSON-safe metadata | Unit: `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` | Success criteria 9; FR-22..FR-25 |
| AC-10 | US-5 | AI DashboardConfig validation rejects unknown widget/dataSource, layout overflow, missing i18n, invalid props/static params/events/refs, and low refresh interval | Unit: `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts` | Success criteria 10; FR-33..FR-40 |
| AC-11 | US-5 | Optional `mcp-echarts` is documented as preview/validation evidence only and cannot bypass schema/catalog/sandbox gates | Docs + prompt contract checks in `catalog.test.ts`; `docs/mcp-echarts.md` review | Success criteria 11; FR-48..FR-49 |
| AC-12 | US-6 | Generated chart sandbox blocks forbidden APIs, lifecycle scripts, unapproved deps, missing sample data, and unsafe template expressions | Unit: `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts` | Success criteria 13; FR-41..FR-46 |
| AC-13 | US-6 | Generated widget registry stays disabled until validation, hooks, preview, and human approval pass | Unit: `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts` | Success criteria 14; FR-45..FR-46 |
| AC-14 | US-7 | Full workspace and product integration verification pass | Commands: `pnpm -r --if-present typecheck/lint/test/build`, product app scripts, `git diff --check` | Roadmap release gate; implementation log |
| AC-15 | US-7 | Full-template playground stays standalone and buildable | Command: `pnpm --dir playground/playground-ui run build` when playground deps are installed | Success criteria 15; FR-52 |

## Scenario Matrix

| Scenario ID | Story ID | Type | Sequence | Inputs / Setup | Expected | Failure Signal | Source |
|---|---|---|---|---|---|---|---|
| S-1 | US-1 | happy | Parse cluster overview fixture | Valid dashboard fixture | Schema parse succeeds | none | AC-1 |
| S-2 | US-1 | invalid-input | Parse missing canvas, zero layout, function prop, malformed ref | Mutated fixture | Schema parse fails | Zod issues | AC-1 |
| S-3 | US-2 | happy | Resolve refs and load widget data | Runtime context + registered dataSource/widget | Output equals widget-compatible data | none | AC-2, AC-4 |
| S-4 | US-2 | invalid-input | Query SDK dataSource with malformed params | Missing/invalid params | Query rejects before call/transform | Zod error | AC-3 |
| S-5 | US-2 | failure-mode | SDK transform returns invalid output or widget schema mismatch | Bad transform/schema | Query/load rejects | Zod/runtime error | AC-3, AC-4 |
| S-6 | US-3 | happy | Mounted runtime receives refreshWidget event | Source + target widgets | Only target reloads | none | AC-5 |
| S-7 | US-3 | alternate | Runtime locale changes | Widget params reference `runtime.locale` or dataSource depends on locale | Locale-sensitive data reloads | stale text/data if broken | AC-5, AC-8 |
| S-8 | US-3 | failure-mode | Widget component/data path errors | Throwing widget, bad source, empty data | Widget-level shell/error state; siblings survive | visible widget error | AC-5 |
| S-9 | US-4 | happy | Product host validates and renders tenant capacity config | `apps/product-integration` registries/messages | Validation passes; SDK wrapper outputs chart/widget data | validation issues | AC-8 |
| S-10 | US-4 | invalid-input | Product SDK wrapper receives unknown tenant/workspace | Bad tenant params | Query rejects with SDK-domain error | thrown error | AC-8 |
| S-11 | US-5 | happy | Export catalogs from registries | Registered dataSources/widgets/theme/layout/i18n | JSON-safe metadata; no implementation code | serialized function/query/component leak | AC-9 |
| S-12 | US-5 | invalid-input | Validate AI-generated bad config | Unknown keys, bad i18n/layout/refresh/events/refs | Validation returns explicit issue codes | missing issue code | AC-10 |
| S-13 | US-6 | happy | Validate safe generated chart package | Complete manifest/files/deps | Hook and preview contracts produced | none | AC-12, AC-13 |
| S-14 | US-6 | invalid-input | Validate unsafe generated chart package | fetch/localStorage/eval/dynamic import/v-html, lifecycle script, unapproved dep | Validation rejects before registration | sandbox issue | AC-12 |
| S-15 | US-7 | release | Run release verification commands | Clean install/workspace | All checks pass; warnings documented | nonzero command exit | AC-14, AC-15 |

## Test Matrix

### Unit

| # | Scenario | Case | Input | Expected | Source |
|---|---|---|---|---|---|
| U1 | S-1, S-2 | Dashboard schema accepts/rejects core config shapes | Cluster fixture mutations | Valid passes; invalid fails | AC-1 |
| U2 | S-3 | Ref resolver nested objects/arrays and route alias | Runtime/context/filter refs | Resolved values | AC-2 |
| U3 | S-4, S-5 | `createSdkDataSource` validates params/output | Good params, missing params, bad transform | Success or rejection before unsafe output | AC-3 |
| U4 | S-5 | Data loader enforces widget dataSchema | Widget/dataSource schema mismatch | Rejection | AC-4 |
| U5 | S-6, S-7 | Vue runtime targeted refresh and locale reload | Mounted runtime fixtures | Target reload count and locale sequence | AC-5 |
| U6 | S-8 | Vue runtime/widget shell failure behavior | Throwing or invalid widget path | Widget-level error, no dashboard crash | AC-5 |
| U7 | S-3 | Basic widgets render/emit observable data-less behavior | Panel/FilterBar/TimeRangePicker props | Text and emitted payload | AC-6 |
| U8 | S-3 | ECharts components build options for MVP chart set | Chart data/props fixtures | Expected series/visual option shape | AC-7 |
| U9 | S-11, S-12 | Catalog export and config validation gates | Registry/config fixtures | No implementation leak; explicit issue codes | AC-9, AC-10 |
| U10 | S-13, S-14 | Generated chart sandbox gate | Safe/unsafe package fixtures | Hook/preview contracts or rejection | AC-12, AC-13 |

### Integration

| # | Scenario | Case | Setup | Expected | Source |
|---|---|---|---|---|---|
| I1 | S-9 | Product tenant capacity integration validates catalog/config | `apps/product-integration` registries | Validation success | AC-8 |
| I2 | S-9 | Product SDK wrappers output widget-compatible data | Mock proto generated service methods | Expected namespace/chart/filter/panel/metric outputs | AC-8 |
| I3 | S-10 | Product SDK wrapper failure path | Unknown tenant/workspace params | Query rejects with "Unknown tenant workspace" | AC-8 |
| I4 | S-15 | Workspace release verification | Root workspace | Typecheck/lint/test/build pass | AC-14 |
| I5 | S-15 | Standalone playground build | `playground/playground-ui` deps installed | Build succeeds or dependency install requirement is documented | AC-15 |

### E2E

| # | Scenario | Case | Flow | Expected | Source |
|---|---|---|---|---|---|
| E1 | S-9 | Product app manual smoke | `pnpm --dir apps/product-integration dev`, open screen, switch locale/filter | Dashboard renders, locale text changes, namespace chart updates | AC-8 |

## Traceability

| Requirement | Story | Acceptance Criteria | Scenarios | Tests |
|---|---|---|---|---|
| FR-1..FR-4, FR-40 | US-1 | AC-1 | S-1, S-2 | U1 |
| FR-5, FR-7..FR-16 | US-2, US-3 | AC-2, AC-4, AC-5 | S-3..S-8 | U2, U4, U5, U6 |
| FR-17..FR-21, FR-50..FR-52 | US-4 | AC-3, AC-8, AC-15 | S-4, S-9, S-10, S-15 | U3, I1, I2, I3, I5 |
| FR-22..FR-25, FR-33..FR-40, FR-47..FR-49 | US-5 | AC-9, AC-10, AC-11 | S-11, S-12 | U9 |
| FR-26..FR-32 | US-3 | AC-5, AC-6, AC-7 | S-6..S-8 | U5, U6, U7, U8 |
| FR-41..FR-46 | US-6 | AC-12, AC-13 | S-13, S-14 | U10 |
| NFR Reliability / Security / i18n / Maintainability | US-2..US-7 | AC-3, AC-5, AC-8, AC-9, AC-12, AC-14 | S-4..S-15 | U3, U5, I1, I2, I3, U9, U10, I4 |

## Out Of Scope

- Real product SDK pilot: Stage 8 uses mocked SDK responses with generated static-method call shape; roadmap item ITS-ai-dashboard-builder-003 owns a real product pilot.
- Package publishing and internal registry checks: roadmap item ITS-ai-dashboard-builder-010 owns release surface preparation.
- Generated chart preview UI, CSP, and origin checks: Stage 7 defines the contract, while roadmap item ITS-ai-dashboard-builder-005 owns concrete execution policy.
- Dashboard editor, versioning, release management, BI semantic layer, and component marketplace are explicitly out of MVP scope.
- Visual pixel-perfect ECharts rendering is not asserted; chart tests capture option contracts and build output. Browser screenshots remain a manual/dev-server smoke path.

## Fixtures & Test Data

- `packages/ai-dashboard-schema/src/__fixtures__/cluster-overview.ts` is the canonical schema fixture.
- Runtime tests use local Zod schemas and in-memory dataSources/widgets.
- Product integration tests use `apps/product-integration/src/product-sdk/generated/tenant-capacity.ts` as a mocked proto generated SDK seam.
- Sandbox tests use in-memory generated chart package file maps to avoid executing untrusted generated code.

## Risk Notes

- Coverage tooling is not configured in the workspace; this plan uses behavior/traceability coverage instead of line coverage.
- `playground/playground-ui` is intentionally outside the root workspace. Its build requires standalone dependencies and is tracked as a release-gate command, not part of `pnpm -r`.
- ECharts causes expected >500 kB app chunk warnings in demo/product builds. Roadmap item ITS-ai-dashboard-builder-007 owns performance and bundle budgets.
- Catalog example sensitivity markers remain an architecture hardening gap noted by code review; it predates this `/test` pass and is not fixed here.

## Stage TDD Slices

No separate `/implement --tdd` slices were present. The staged implementation tests above are folded into the story/scenario/test matrix.

## Results

**Completed:** 2026-05-09 15:47 CST
**Status:** PASS with documented warnings

Added 8 focused regression tests:

- `packages/ai-dashboard-runtime/src/__tests__/data-source.test.ts`: invalid params reject before SDK call.
- `packages/ai-dashboard-runtime/src/__tests__/data-source.test.ts`: invalid transformed output rejects against `outputSchema`.
- `apps/product-integration/src/__tests__/tenant-capacity.test.ts`: unknown tenant/workspace surfaces SDK-domain error.
- `packages/ai-dashboard-schema/src/__tests__/dashboard-config.test.ts`: global theme colors and chart palette are accepted on `canvas`.
- `packages/ai-dashboard-schema/src/__tests__/dashboard-config.test.ts`: empty global chart palette is rejected.
- `packages/ai-dashboard-echarts-vue/src/__tests__/chart-options.test.ts`: global chart palette applies and widget `props.palette` overrides it.
- `packages/ai-dashboard-echarts-vue/src/__tests__/chart-options.test.ts`: short heatmap palettes do not emit undefined visualMap colors.
- `packages/ai-dashboard-echarts-vue/src/__tests__/chart-options.test.ts`: GaugeChart keeps semantic success color unless explicitly overridden by `props.palette`.

Verification commands:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/ai-dashboard-runtime test` | PASS | 6 files, 15 tests |
| `pnpm --filter @dao-style-viz/product-integration-example test` | PASS | 6 files, 19 tests |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Vite warns demo main JS is 824.27 kB and product integration main JS is 909.69 kB after minification |
| `pnpm --dir playground/playground-ui run build` | PASS with warnings | Rsbuild warns `input-placeholder` is not a valid pseudo-class; largest emitted JS chunk is 576.9 kB |
| `git diff --check` | PASS | No whitespace errors |

Coverage tooling is not configured, so changed-file line coverage is not measured. No production code fixes were triggered by this test pass.

## ITS-004 Update

**Completed:** 2026-05-09 16:46 CST
**Status:** PASS with documented warnings

Added 2 runtime regression tests:

- `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts`: development config-error mode renders schema issue details.
- `packages/ai-dashboard-vue/src/__tests__/BigScreenRuntime.test.ts`: production config-error mode hides schema issue details and shows concise fallback copy.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/ai-dashboard-vue typecheck` | PASS | Runtime prop surface compiles |
| `pnpm --filter @dao-style-viz/ai-dashboard-vue test` | PASS | 1 file, 4 tests |
| `pnpm --filter @dao-style-viz/product-integration-example typecheck` | PASS | Host validation gate compiles |
| `pnpm --filter @dao-style-viz/product-integration-example lint` | PASS | No lint findings |
| `pnpm --filter @dao-style-viz/product-integration-example test` | PASS | 6 files, 19 tests |
| `pnpm --filter @dao-style-viz/product-integration-example build` | PASS with warnings | Product integration main JS is 909.69 kB after minification |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo main JS is 824.27 kB; product integration main JS is 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | All v0.1 app/package asset budgets pass |

## ITS-007 Update

**Completed:** 2026-05-09 16:52 CST
**Status:** PASS with documented warnings

Added one executable release-gate check:

- `scripts/check-bundle-budget.mjs`: validates built app/package JS and CSS assets against v0.1 hard ceilings.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm run check:bundle-budget` | PASS | Demo/product app and package assets are under v0.1 budgets |
| `git diff --check` | PASS | No whitespace errors |

## ITS-006 Update

**Completed:** 2026-05-09 16:57 CST
**Status:** PASS with documented warnings

Added one generator contract regression test:

- `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts`: prompt contracts forbid auth tokens, SDK source code, and raw production responses in generator context.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog typecheck` | PASS | Prompt updates compile |
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog lint` | PASS | No lint findings |
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog test` | PASS | 1 file, 9 tests |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo main JS is 824.27 kB; product integration main JS is 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | All v0.1 app/package asset budgets pass |
| `git diff --check` | PASS | No whitespace errors |

## ITS-005 Update

**Completed:** 2026-05-09 17:05 CST
**Status:** PASS with documented warnings

Added 2 sandbox preview security regression tests:

- `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts`: render messages are bound to the preview session.
- `packages/ai-dashboard-sandbox/src/__tests__/sandbox.test.ts`: wrong-origin, wrong-session, and wrong-widget preview messages are rejected.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/ai-dashboard-sandbox typecheck` | PASS | Preview contract API compiles |
| `pnpm --filter @dao-style-viz/ai-dashboard-sandbox lint` | PASS | No lint findings |
| `pnpm --filter @dao-style-viz/ai-dashboard-sandbox test` | PASS | 1 file, 15 tests |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo main JS is 824.27 kB; product integration main JS is 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | All v0.1 app/package asset budgets pass |
| `git diff --check` | PASS | No whitespace errors |

## ITS-009 Update

**Completed:** 2026-05-09 17:09 CST
**Status:** PASS with documented warnings

Decision evidence:

- `.idea-to-ship/ai-dashboard-builder/playground-host-integration.md`: keeps the full-template playground as a standalone DaoStyle host reference for v0.1.
- `pnpm --dir playground/playground-ui run build`: PASS with known `input-placeholder` CSS warnings and largest JS chunk 576.9 kB.

## ITS-012 And ITS-013 Update

**Completed:** 2026-05-09 17:20 CST
**Status:** PASS with documented warnings

Added 12 product proxy and live-SDK regression tests:

- `apps/product-integration/src/__tests__/proxy-config.test.ts`: unset `PRODUCT_API_URL` produces no proxy.
- `apps/product-integration/src/__tests__/proxy-config.test.ts`: fake backend URL and fake JWT create server-side bearer header injection.
- `apps/product-integration/src/__tests__/proxy-config.test.ts`: unsupported URL schemes and non-allowlisted hosts are rejected.
- `apps/product-integration/src/__tests__/proxy-config.test.ts`: proxy diagnostics redact URL and token values.
- `apps/product-integration/src/__tests__/ipavo-live-contract.test.ts`: real `@daocloud-proto/ipavo@0.13.0` generated SDK imports expose expected static service methods and `displayType` values without calling the backend.
- `apps/product-integration/src/__tests__/ipavo-live-backend-script.test.ts`: missing live backend env fails before network without stack output.
- `apps/product-integration/src/__tests__/ipavo-live-backend-script.test.ts`: URL-shaped endpoint overrides are rejected before network and token output stays redacted.
- `apps/product-integration/src/__tests__/ipavo-live-backend-script.test.ts`: invalid timeout values are rejected before network and token output stays redacted.
- `apps/product-integration/src/__tests__/ipavo-live-pilot-script.test.ts`: fake local env lets the SDK/env preflight pass without printing the token.
- `apps/product-integration/src/__tests__/ipavo-live-pilot-script.test.ts`: non-allowlisted backend hosts fail preflight without printing the token.
- `apps/product-integration/src/__tests__/ipavo-live-pilot-script.test.ts`: unsupported backend URL schemes fail preflight without printing the token.
- `apps/product-integration/src/__tests__/roadmap-completion-script.test.ts`: roadmap completion gate passes the artifact/source/script/product-SDK/env-example placeholder/external-blocker/status/evidence-freshness/markdown-and-source auth-material/audit-verdict surface and remains blocked on live ipavo env without leaking token values.

Decision evidence:

- `.idea-to-ship/ai-dashboard-builder/backend-proxy-credential-contract.md`: backend URLs and JWTs stay in the server-side proxy boundary.
- `.idea-to-ship/ai-dashboard-builder/chart-extension-promotion-flow.md`: chart extension goes through candidate selection, generated package proposal, sandbox validation, secure preview, and human approval before registration.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/product-integration-example test` | PASS | 6 files, 19 tests |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo main JS is 824.27 kB; product integration main JS is 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | All v0.1 app/package asset budgets pass |
| `pnpm run check:roadmap-completion` | FAIL as expected | Artifact/source/script/product-SDK/env-example placeholder/external-blocker/status/evidence-freshness/markdown-and-source auth-material/audit-verdict surface passes; live ipavo backend/JWT gate remains blocked |
| `git diff --check` | PASS | No whitespace errors |

## Workbench Layout And Palette Update

**Completed:** 2026-05-09 18:05 CST
**Status:** PASS with documented warnings

Added one catalog regression test:

- `packages/ai-dashboard-ai-catalog/src/__tests__/catalog.test.ts`: layout/theme catalog output includes the ipavo-style `ipavo-console-overview` layout preset and `ipavo-console-light` palette alternative from `docs/design.md`.

Decision evidence:

- `docs/design.md`: documents the ipavo-style product-console slot pattern and prebuilt light-console palette.
- `.idea-to-ship/ai-dashboard-builder/workbench-agent-bridge-architecture.md`: documents catalog-sufficient and chart-extension workbench modes.
- `apps/product-integration/src/dashboards/ipavo-overview.ts`: uses a global 8-color dashboard palette while preserving per-chart `props.palette` overrides for compact trend cards.

Additional verification:

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog typecheck` | PASS | Layout/theme catalog updates compile |
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog lint` | PASS | No lint findings |
| `pnpm --filter @dao-style-viz/ai-dashboard-ai-catalog test` | PASS | 1 file, 9 tests |
| `pnpm --filter @dao-style-viz/product-integration-example typecheck` | PASS | Updated dashboard palette compiles |
| `pnpm --filter @dao-style-viz/product-integration-example lint` | PASS | No lint findings |
| `pnpm --filter @dao-style-viz/product-integration-example test` | PASS | 6 files, 19 tests |
| `pnpm -r --if-present typecheck` | PASS | 9 workspace projects |
| `pnpm -r --if-present lint` | PASS | 9 workspace projects |
| `pnpm -r --if-present test` | PASS | 18 files, 86 tests |
| `pnpm -r --if-present build` | PASS with warnings | Demo main JS is 824.27 kB; product integration main JS is 909.69 kB |
| `pnpm run check:bundle-budget` | PASS | All v0.1 app/package asset budgets pass |
| `pnpm run check:ipavo-live-pilot` | FAIL as expected | Real backend URL, JWT, and allowlist are not configured |
| `pnpm run check:ipavo-live-backend` | FAIL as expected | Stops before network because `PRODUCT_API_URL` is missing |
| local preview health check | PASS, then stopped | Product integration dev server returned HTTP 200 during verification; port 5174 is no longer left listening |
| `git diff --check` | PASS | No whitespace errors |
