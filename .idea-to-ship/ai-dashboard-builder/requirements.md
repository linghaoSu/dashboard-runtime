# Requirements — AI Dashboard Builder

**Slug:** ai-dashboard-builder
**Date:** 2026-05-08
**Status:** draft
**Source:** ../../doc.md

## Problem

多个产品线都有大屏 / dashboard 诉求，但目前倾向于各自维护，导致配置协议、运行时、图表组件、数据源接入和 AI 生成能力难以复用。现有后端接口尚未统一成数据中台，各业务产品通常通过 proto 生成的 TypeScript SDK 调用接口，因此平台不能以统一后端改造作为前置条件。

本项目要从前端侧沉淀一个可复用的 AI Dashboard Builder 与大屏组件平台：统一 dashboard config、运行时、组件注册、数据源注册、AI 可读 catalog，并允许 AI 在受控范围内生成 dashboard 配置或新的图表展示组件。

## Users / Actors

- 业务产品前端开发者：注册已有 proto TS SDK 数据源、接入 dashboard runtime、维护业务 dashboard 配置。
- 平台前端开发者：维护 schema、runtime、基础 widget、ECharts widget、AI catalog、sandbox 与生成器。
- Dashboard 配置编辑者：使用手写配置、低代码能力或 AI 生成能力创建和调整大屏。
- AI Builder：读取受控 metadata 后生成 dashboard plan、DashboardConfig、配置修复建议或 chart component proposal。
- Dashboard 访问用户：查看已发布大屏，并在 locale、过滤器、刷新策略变化时看到正确展示。
- 平台审核者：审核 AI 生成的 chart widget 是否通过类型、安全、依赖和预览校验后再发布。

## In Scope

- 定义可校验的 DashboardConfig、WidgetConfig、DataBindingConfig、RefreshConfig、I18nConfig、ThemeConfig 类型与 schema。
- 实现配置驱动的大屏 runtime，支持画布缩放、widget 渲染、dataSource 加载、loading / empty / error、interval refresh、请求取消和 error boundary。
- 实现 DataSource Registry，用于以受控 wrapper 接入现有 proto generated TS SDK static method。
- 为 dataSource 注册 params schema、output schema、metadata、examples、aiHints、compatible widgets 和 i18n 信息。
- 实现 Widget Registry 与基础大屏组件库，包括 ScreenCanvas、Panel、MetricCard、StatusBadge、RankingList、ScrollTable、AlarmList、FilterBar、TimeRangePicker。
- 以 ECharts 作为 MVP 图表引擎，提供 LineChart、BarChart、AreaChart、DonutChart、PieChart、GaugeChart、RadarChart、HeatmapChart、ScatterChart、FunnelChart、MapChart 等基础图表能力。
- 实现 AI Catalog Layer，向 AI 暴露 dataSource、widget、theme、layout preset 和 i18n metadata，但不暴露 query 实现或业务敏感代码。
- 实现 AI Dashboard 生成流程，先生成 Dashboard Plan，再生成符合 schema 的 DashboardConfig。
- 创建或生成 dashboard config 时必须同时提供按 locale 拆分的 i18n JSON 资源，便于项目侧合并到已有 vue-i18n messages。
- 实现受控的 AI 图表组件生成流程，默认产物包括 manifest、schema、Chart.vue、sample data、README 和 story，并保留未来其他渲染器产物格式的扩展位。
- 实现 generated chart sandbox 的类型检查、ESLint / AST 安全扫描、依赖白名单、iframe sandbox 预览、schema 校验和人工确认入口。
- 从第一版支持 dashboard、widget、metadata、tooltip、空状态、错误状态、数字、日期、时间、百分比和单位的国际化。
- 支持 locale 变化后重新解析配置、重新渲染文案，并对声明依赖 locale 的 dataSource 重新请求。
- 提供 MVP 阶段的包结构、业务接入示例、prompt template 和 agent 任务拆分。

## Out of Scope / Non-Goals

- 第一阶段不建设统一数据仓库或统一数据中台。
- 不强制业务产品改造后端接口。
- 不让 AI 直接调用业务 SDK。
- 不让 AI 生成任意 Vue 应用页面或业务页面逻辑。
- 不让 AI 生成鉴权、权限、数据聚合或业务数据请求逻辑。
- 不做完整 BI 指标语义层。
- MVP 不实现复杂表达式执行引擎；DashboardConfig 只支持 `$ref`，不支持 `$expr`。
- 不允许不可信 dashboard config 携带可执行 JavaScript 函数。
- MVP 不开放基础组件库由 AI 任意生成。
- `openUrl`、`navigate` 等涉及安全和权限的事件动作后置，不作为 MVP 默认能力。
- Dashboard Editor、版本管理、发布管理、组件市场属于后续扩展，不是第一阶段交付范围。

## Functional Requirements

1. 平台必须提供 DashboardConfig schema，能描述版本、meta、canvas、i18n、context、globalFilters 和 widgets。
2. 平台必须提供 WidgetConfig schema，能描述 widget id、type、title、description、visible、layout、data、props 和 events。
3. 平台必须提供 DataBindingConfig schema，能描述 dataSource key、params、manual / interval refresh 和 empty / error fallback 文案。
4. 平台必须提供 WidgetEventConfig schema，MVP 至少支持 `setFilter`、`refreshWidget` 和 `emit`。
5. Runtime 必须在渲染前校验 DashboardConfig，不合法配置必须给出明确错误，不能静默失败。
6. Runtime 必须支持 1920x1080 等固定画布尺寸，并按 `fit`、`fill`、`scroll` scaleMode 渲染。
7. Runtime 必须能根据 widget `type` 从 Widget Registry 查找组件并渲染。
8. Runtime 必须能根据 widget `data.source` 从 DataSource Registry 查找数据源并加载数据。
9. Runtime 必须在请求前用 dataSource params schema 校验解析后的 params。
10. Runtime 必须在请求后用 dataSource output schema 校验 query 返回值。
11. Runtime 必须支持 widget 级 loading、empty、error 状态展示。
12. Runtime 必须用 Error Boundary 隔离单个 widget 渲染异常，避免单个组件导致整个 dashboard 崩溃。
13. Runtime 必须支持 interval refresh，并限制 AI 生成配置的刷新间隔不得低于平台最小值。
14. Runtime 必须在切换 dashboard、filters 或 locale 时取消过期请求。
15. `$ref` resolver 必须支持对象、数组和嵌套对象解析。
16. `$ref` resolver 遇到找不到的引用必须返回错误，不能返回 undefined 后继续渲染。
17. DataSource Registry 必须提供 `defineDataSources` 以保留注册表的类型信息。
18. DataSource Registry 必须提供 `createSdkDataSource` helper，用于将 params 转 request、调用 proto TS SDK static method、再将 response 转换为标准 output。
19. DataSourceDefinition 必须包含 name、paramsSchema、outputSchema 和 query。
20. DataSourceDefinition 必须可选包含 description、category、compatibleWidgets、examples、aiHints、i18n 和 dependsOnLocale。
21. DataSource key 应遵循 `domain.resource.metric` 命名规范；多产品冲突优先通过 registry namespace 隔离。
22. AI Catalog 必须能从 DataSource Registry 生成不包含 query 函数的 dataSource metadata JSON。
23. AI Catalog 必须能从 Widget Registry 生成不包含 Vue component 源码或其他渲染器实现源码的 widget metadata JSON。
24. WidgetDefinition 必须包含 type、name、category、component、dataSchema 和 propsSchema。
25. WidgetDefinition 必须可选包含 description、examples、aiHints 和 i18n。
26. ECharts widget 必须通过标准 WidgetRuntimeProps 接收 data、props、theme、locale、t、format、loading、error、尺寸和 emit。
27. ECharts widget 不得直接依赖 proto SDK response 或发起业务数据请求。
28. ECharts option 中不得包含来自 dashboard config 的任意 JavaScript function。
29. Tooltip、label、legend、空状态和错误状态等用户可见文案必须通过 i18n 或 formatter 处理。
30. Runtime 必须提供 `t`、number、date、percent 等 locale-aware 工具给 widget 使用。
31. Runtime 必须在 locale 改变时重新解析 i18n 文案并重新渲染依赖 i18n 的 widget。
32. 如果 dataSource 声明 `dependsOnLocale: true`，Runtime 必须在 locale 改变时重新请求该 dataSource。
33. AI Dashboard 生成必须先输出 Dashboard Plan，说明意图、widget 选择、dataSource 选择、理由和缺失能力。
34. AI Dashboard 生成必须再输出符合 DashboardConfig schema 的配置。
35. AI 生成 DashboardConfig 时只能引用 catalog 中存在的 dataSource key 和 widget type。
36. AI 生成 DashboardConfig 时所有用户可见文本必须使用 i18n key 和 defaultMessage。
37. AI 或配置生成工具必须为 DashboardConfig 中新增的 i18n key 生成对应 locale JSON 文件；JSON 文件不得内联到 DashboardConfig 中，且 key 应位于 dashboard namespace 下以降低项目侧 merge 冲突。
38. AI 生成 DashboardConfig 时 params 必须匹配 dataSource paramsSchema，props 必须匹配 widget propsSchema。
39. AI 生成 DashboardConfig 时 layout 不得超出 canvas。
40. AI 不得在 DashboardConfig 中生成可执行 JavaScript 代码。
41. AI 图表组件生成只允许在现有组件无法表达需求、用户明确要求特殊视觉、需要特殊组合图、拓扑图、关系图、流程图、地图、时间轴等场景触发。
42. AI 生成 chart widget package 默认必须包含 manifest.json、Chart.vue、schema.ts、sample-data.json、README.md 和 Chart.stories.ts。
43. AI 生成的 Chart.vue 必须是 Vue 3.3.x 组件，并使用标准 WidgetRuntimeProps 兼容 props / emits。
44. AI 生成的 Chart.vue 不得发起网络请求、调用业务 SDK、读取 token / cookie / storage、使用 eval / new Function / dynamic import / v-html 或直接跳转。
45. Generated chart sandbox 必须对生成组件执行 TypeScript check、ESLint、AST safety scan、schema validation、bundle build、sandbox preview 和人工确认。
46. Generated chart sandbox 必须阻止包含禁止 API 或非白名单依赖的组件注册。
47. 平台必须提供 prompt templates，分别用于 Dashboard Plan、DashboardConfig 和 Chart Component 生成。
48. 平台必须提供至少一个业务接入示例，展示如何注册 proto TS SDK dataSource 并通过 DashboardConfig 使用。
49. MVP 必须能通过手写 DashboardConfig 跑通 Runtime 渲染、DataSource 调用 proto TS SDK、ECharts Widget 展示、locale 切换重新请求并更新展示。

## Non-Functional Requirements

- **Performance:** MVP 需要保证单个 dashboard 的正常交互体验；具体首屏、刷新、渲染帧率预算尚未在源文档中量化。
- **Scale:** MVP 面向多产品复用，但每个 dashboard 的 widget 数量、并发访问量、dataSource 数量上限尚未量化。
- **Reliability / failure mode:** 配置错误、schema 校验失败、dataSource 缺失、params 缺失、请求失败、组件渲染异常和生成组件扫描失败都必须显式报错或展示降级状态，不能静默失败。
- **Security / compliance:** AI 只能读取 metadata；业务 SDK、query 实现、token、cookie、用户敏感数据和权限逻辑不暴露给 AI。Generated chart 必须通过安全扫描和人工确认后才能注册。
- **Platform / constraints:** 前端 TypeScript / Vue 3.3.x；schema 校验使用 Zod；默认图表引擎为 ECharts；runtime core、schema、catalog、dataSource contract 应保持框架无关，为后续 React 或其他 renderer adapter 留扩展位；现有业务接口通过 proto generated TypeScript SDK 的 static method 调用。
- **Internationalization:** i18n 是第一版 schema 与 runtime 的基础能力，不允许后补。
- **Maintainability:** 配置只声明，代码负责执行；复杂转换和权限留在 dataSource handler，避免配置层演化成脚本语言。

## Success Criteria

- `DashboardConfig schema can validate example config → verify: unit test accepts the cluster overview example and rejects missing canvas/widget layout fields`.
- `$ref resolver handles nested objects/arrays and missing refs → verify: unit tests cover nested success and missing-ref failure`.
- `Runtime renders a 1920x1080 dashboard from config → verify: integration/demo renders multiple widgets with fit scale mode`.
- `Runtime loads data through registry key → verify: test dashboard using source "cluster.cpuUsage" receives transformed output from a mocked proto SDK call`.
- `Params and output are schema-validated → verify: tests fail on invalid params before query and invalid output after query`.
- `Widget failures are isolated → verify: a throwing widget shows widget-level error while sibling widgets still render`.
- `Interval refresh works and old requests are cancelled → verify: fake timer test observes repeated query calls and AbortController signal on stale request`.
- `Locale changes update UI and data dependencies → verify: switching zh-CN/en-US changes title/format output and re-queries dependsOnLocale sources`.
- `AI Catalog hides executable implementation → verify: generated dataSource catalog JSON contains metadata/schema/examples but no query function or source code`.
- `AI DashboardConfig output is constrained → verify: unknown dataSource/widget, layout overflow, missing i18n text, and interval below minimum all fail validation`.
- `Dashboard i18n resources are mergeable → verify: demo/project messages merge with dashboard locale JSON and translator resolves dashboard keys`.
- `Generated chart safety gate blocks unsafe code → verify: fixtures containing fetch, localStorage, eval, dynamic import, v-html, or non-whitelisted dependencies fail AST/dependency scan`.
- `Generated chart preview is gated by validation → verify: only components passing type check, lint, AST scan, schema validation, bundle build, and sandbox preview can be registered`.

## Open Questions

- 具体 monorepo 工具、package manager、build system、test runner 和 lint 配置未在源文档中指定。
- MVP 的性能预算未量化，例如首屏渲染、单 widget 请求超时、最大 widget 数量、interval 最小值是否固定为 5000ms。
- Widget Registry、DataSource Registry 和 theme catalog 的运行时加载方式未确定：静态 import、插件注册、远程加载或混合。
- Dashboard config 的存储、版本管理、发布审批和权限模型只列为后续方向，MVP 是否需要最小持久化未确定。
- AI 生成器使用的具体模型、调用服务、prompt 执行位置、重试策略和审计日志未确定。
- Generated chart 人工确认入口的产品形态未确定：CLI、管理台、PR 流程或低代码平台。
- iframe sandbox 的具体隔离策略、CSP、postMessage 协议和 preview 数据来源未确定。
- Dashboard 事件联动中 `setFilter`、`refreshWidget`、`emit` 的 payload schema 需要在架构阶段定稿。
- ECharts 之外的 G2 / G6 / L7 / D3 / Three.js 接入条件和审核流程需要在后续阶段细化。

## Touch Points

- `packages/ai-dashboard-schema/` — DashboardConfig、WidgetConfig、DataBindingConfig、I18nText、ThemeConfig 类型与 Zod schema。
- `packages/ai-dashboard-runtime/` — framework-neutral data-loader、ref-resolver、refresh-manager、i18n-runtime、formatters、event-dispatcher、registry contracts、renderer adapter contracts。
- `packages/ai-dashboard-vue/` — Vue 3.3.x BigScreenRuntime、ScreenCanvas、WidgetRenderer、WidgetShell、error boundary adapter。
- `packages/ai-dashboard-widgets/` — 基础大屏 widget。
- `packages/ai-dashboard-echarts-vue/` — Vue ECharts 图表 widget、option builder、theme adapter、locale adapter。
- `packages/ai-dashboard-ai-catalog/` — dataSource、widget、theme、layout、i18n catalog 导出。
- `packages/ai-dashboard-generator/` — dashboard plan/config 生成、patch、修复与 chart proposal。
- `packages/ai-dashboard-sandbox/` — generated chart 编译、AST scan、依赖白名单、preview frame、manifest/schema 校验。
- `product-a/src/big-screen/data-sources/` — 业务产品 dataSource 接入示例。
- `product-a/src/big-screen/dashboards/` — 业务产品 dashboard config 示例。
- `product-a/src/big-screen/dashboards/<dashboard>.i18n/` — dashboard 随附的 locale JSON，用于 merge 到项目侧 i18n messages。
- `product-a/src/big-screen/i18n/` — 业务产品全局国际化文案示例。
