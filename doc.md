# AI Dashboard Builder 与大屏组件库开发设计文档

## 1. 背景

当前部门内多个产品都产生了大屏 / dashboard 需求，但各产品目前倾向于独立维护。现有后端接口没有统一聚合数据源层，但各产品都已经有可用接口，并且前端侧通常通过 proto 生成的 TypeScript SDK 访问接口，调用方式多为 class static method，例如：

```ts
ClusterService.GetOverview(request)
OrderService.GetTodayOrders(request)
MetricService.ListMetrics(request)
```

因此，本方案不要求先建设统一数据中台，也不要求后端接口统一。平台优先从前端侧沉淀能力：统一 dashboard 配置协议、统一大屏运行时、统一图表组件库、统一数据源注册协议，并支持 AI 基于这些协议生成 dashboard。

同时，平台需要支持 AI 生成图表组件代码，但生成范围必须受控：AI 只允许生成图表展示组件，不允许生成业务数据请求、权限判断、鉴权逻辑、SDK 调用逻辑。

暂定以 ECharts 作为基础图表引擎。若 ECharts 对特定场景表现力不足，可以通过受控方式引入 AntV G2 / G6 / L7、D3、Three.js 或自研 Canvas / SVG 组件。

---

## 2. 项目目标

### 2.1 核心目标

建设一个可被多个产品复用的 AI Dashboard Builder 与大屏组件平台，使各产品能够：

1. 使用统一配置生成 dashboard。
2. 通过 DataSource Registry 接入已有 proto TS SDK。
3. 通过 Widget Registry 复用统一图表组件。
4. 让 AI 根据数据源元信息和组件元信息生成 dashboard config。
5. 让 AI 在受控范围内生成新的图表组件。
6. 支持 dashboard 与图表组件的国际化。
7. 支持后续扩展到低代码编辑器、版本管理、发布管理、组件市场。

### 2.2 非目标

第一阶段不做以下内容：

1. 不建设统一数据仓库。
2. 不强制所有产品改造后端接口。
3. 不让 AI 直接调用业务 SDK。
4. 不让 AI 生成任意 Vue 应用页面或业务页面逻辑。
5. 不让 AI 生成鉴权、权限、数据聚合逻辑。
6. 不做完整 BI 指标语义层。
7. 不做复杂表达式执行引擎。
8. 不允许不可信 dashboard config 中携带可执行 JavaScript 函数。

---

## 3. 总体设计原则

### 3.1 配置负责声明，代码负责执行

Dashboard 配置只描述：

* 画布尺寸
* 主题
* 布局
* 使用哪个组件
* 绑定哪个 dataSource key
* 传入哪些 params
* 刷新策略
* 事件联动
* 国际化 key

真正的 SDK 调用、复杂数据转换、权限处理，保留在代码注册层。

### 3.2 AI 优先生成配置，而不是生成代码

默认流程：

```text
用户需求
  ↓
AI 读取 DataSource Catalog + Widget Catalog
  ↓
AI 生成 DashboardConfig
  ↓
Runtime 校验并渲染
```

只有当已有图表组件无法满足需求时，才允许 AI 进入受控的图表组件生成流程。

### 3.3 AI 只能生成图表组件

AI 生成代码时，只允许生成符合标准接口的 chart widget：

```text
输入：data + config + theme + i18n
输出：图表 UI
```

禁止生成：

* fetch / XMLHttpRequest / WebSocket / EventSource
* proto SDK 调用
* token / cookie / localStorage 读取
* 权限判断
* 路由跳转
* eval / new Function
* 任意动态 import
* 直接操作全局状态

### 3.4 i18n 从第一天纳入 schema

所有用户可见文本必须支持国际化，包括：

* dashboard 标题
* widget 标题
* 指标单位
* 图例名称
* tooltip 文案
* 空状态 / 错误状态
* AI 生成组件的默认文案
* ECharts 内置交互语言
* 数字、日期、时间、百分比格式化

配置层不直接写死业务文案，优先使用 i18n key。
创建或生成 dashboard 配置时，必须同时生成 dashboard 自己的 locale JSON 资源文件，供项目侧合并到已有 i18n messages 中；DashboardConfig 只引用 key，不内联整份文案表，新增 key 应放在 dashboard namespace 下以降低项目侧冲突。

---

## 4. 总体架构

```text
┌──────────────────────────────────────────────┐
│                AI Builder                     │
│  - Generate DashboardConfig                   │
│  - Generate Chart Component Proposal          │
│  - Explain / Refine / Fix Config              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              AI Catalog Layer                 │
│  - DataSource Catalog                         │
│  - Widget Catalog                             │
│  - Theme Catalog                              │
│  - Layout Presets                             │
│  - i18n Catalog                               │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Dashboard Config                 │
│  - canvas                                     │
│  - context                                    │
│  - widgets                                    │
│  - data binding                               │
│  - events                                     │
│  - i18n keys                                  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              BigScreen Runtime                │
│  - Resolve refs                               │
│  - Load data                                  │
│  - Validate schema                            │
│  - Render widget                              │
│  - Refresh / subscribe                        │
│  - Handle events                              │
│  - Apply i18n                                 │
└───────────────┬──────────────────┬────────────┘
                │                  │
                ▼                  ▼
┌──────────────────────┐   ┌──────────────────────┐
│  Widget Registry      │   │  DataSource Registry  │
│  - Built-in widgets   │   │  - query implementation│
│  - Generated widgets  │   │  - params schema       │
│  - ECharts widgets    │   │  - output schema       │
└──────────────────────┘   └──────────┬───────────┘
                                       │
                                       ▼
                           ┌──────────────────────┐
                           │ Proto Generated SDK   │
                           │ Service.StaticMethod  │
                           └──────────────────────┘
```

---

## 5. 模块划分

建议拆成以下包：

```text
@dao-style-viz/ai-dashboard-runtime
@dao-style-viz/ai-dashboard-schema
@dao-style-viz/ai-dashboard-vue
@dao-style-viz/ai-dashboard-widgets
@dao-style-viz/ai-dashboard-echarts-vue
@dao-style-viz/ai-dashboard-ai-catalog
@dao-style-viz/ai-dashboard-generator
@dao-style-viz/ai-dashboard-sandbox
```

### 5.1 ai-dashboard-schema

负责定义：

* DashboardConfig
* WidgetConfig
* DataBindingConfig
* RefreshConfig
* I18nConfig
* ThemeConfig
* JSON Schema / Zod Schema

### 5.2 ai-dashboard-runtime

负责运行配置：

* 解析 `$ref`
* 加载 dataSource
* 校验 params / output
* 管理 loading / empty / error
* 管理刷新与取消请求
* 渲染组件
* 事件联动
* 应用主题与 i18n

### 5.3 ai-dashboard-widgets

基础组件库：

* ScreenCanvas
* Panel
* MetricCard
* StatusBadge
* RankingList
* ScrollTable
* AlarmList
* FilterBar
* TimeRangePicker

基础组件默认不开放 AI 生成。

### 5.4 ai-dashboard-echarts-vue

基于 Vue 3.3.x 与 ECharts 的图表组件库：

* LineChart
* BarChart
* AreaChart
* DonutChart
* PieChart
* GaugeChart
* RadarChart
* HeatmapChart
* ScatterChart
* FunnelChart
* MapChart

此包也提供 ECharts option builder、主题适配、i18n formatter 工具。

### 5.5 ai-dashboard-ai-catalog

负责从 registry 中导出 AI 可理解的元信息：

* DataSource Catalog
* Widget Catalog
* Theme Catalog
* Layout Presets
* i18n key catalog

注意：AI Catalog 不暴露 dataSource 的 query 实现。

### 5.6 ai-dashboard-generator

负责 AI 生成相关能力：

* 根据用户 prompt 生成 dashboard plan
* 根据 plan 生成 DashboardConfig
* 根据用户修改意图 patch DashboardConfig
* 判断是否需要生成新图表组件
* 生成 chart component proposal

### 5.7 ai-dashboard-sandbox

负责 AI 生成图表组件的隔离预览：

* 编译 Vue SFC
* 类型检查
* ESLint / AST 安全扫描
* iframe sandbox 预览
* sample data 渲染
* Error Boundary

---

## 6. DashboardConfig Schema

### 6.1 基础类型

```ts
export type LocaleCode = string;

export type I18nText =
  | string
  | {
      key: string;
      defaultMessage?: string;
      values?: Record<string, ConfigValue>;
    };

export type ConfigRef = {
  $ref: string;
};

export type ConfigValue<T = unknown> = T | ConfigRef;
```

MVP 阶段只支持 `$ref`，暂不支持 `$expr`。表达式系统后续如需引入，必须经过安全设计。

### 6.2 DashboardConfig

```ts
export type DashboardConfig = {
  version: string;

  meta?: {
    id?: string;
    name?: I18nText;
    description?: I18nText;
    owner?: string;
    tags?: string[];
  };

  canvas: {
    width: number;
    height: number;
    scaleMode: 'fit' | 'fill' | 'scroll';
    theme: string;
    background?: string;
  };

  i18n?: {
    namespace?: string;
    defaultLocale?: LocaleCode;
    supportedLocales?: LocaleCode[];
  };

  context?: Record<string, ConfigValue>;

  globalFilters?: Record<string, unknown>;

  widgets: WidgetConfig[];
};
```

### 6.3 WidgetConfig

```ts
export type WidgetConfig = {
  id: string;
  type: string;
  title?: I18nText;
  description?: I18nText;

  visible?: boolean | ConfigRef;

  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex?: number;
  };

  data?: DataBindingConfig;

  props?: Record<string, ConfigValue>;

  events?: WidgetEventConfig[];
};
```

### 6.4 DataBindingConfig

```ts
export type DataBindingConfig = {
  source: string;

  params?: Record<string, ConfigValue>;

  refresh?: {
    type: 'manual' | 'interval';
    intervalMs?: number;
  };

  fallback?: {
    emptyText?: I18nText;
    errorText?: I18nText;
  };
};
```

### 6.5 EventConfig

```ts
export type WidgetEventConfig = {
  trigger: string;
  action:
    | 'setFilter'
    | 'clearFilter'
    | 'emit'
    | 'openUrl'
    | 'navigate'
    | 'refreshWidget';

  target?: string;

  payload?: Record<string, ConfigValue>;
};
```

MVP 阶段建议优先支持：

* setFilter
* refreshWidget
* emit

`openUrl` 和 `navigate` 涉及安全与权限，应后置。

---

## 7. Dashboard 配置示例

```ts
export const clusterOverviewDashboard: DashboardConfig = {
  version: '1.0.0',

  meta: {
    id: 'cluster-overview',
    name: {
      key: 'dashboard.clusterOverview.name',
      defaultMessage: 'Cluster Overview',
    },
  },

  canvas: {
    width: 1920,
    height: 1080,
    scaleMode: 'fit',
    theme: 'dark-blue',
  },

  i18n: {
    namespace: 'clusterDashboard',
    defaultLocale: 'zh-CN',
    supportedLocales: ['zh-CN', 'en-US'],
  },

  context: {
    clusterId: { $ref: 'route.query.clusterId' },
    locale: { $ref: 'runtime.locale' },
    timeRange: { $ref: 'globalFilters.timeRange' },
  },

  globalFilters: {
    timeRange: {
      type: 'relative',
      value: 'last_24h',
    },
  },

  widgets: [
    {
      id: 'cpu-usage',
      type: 'GaugeChart',
      title: {
        key: 'dashboard.clusterOverview.widget.cpuUsage.title',
        defaultMessage: 'CPU Usage',
      },
      layout: { x: 40, y: 40, w: 360, h: 220 },
      data: {
        source: 'cluster.cpuUsage',
        params: {
          clusterId: { $ref: 'context.clusterId' },
          locale: { $ref: 'context.locale' },
        },
        refresh: {
          type: 'interval',
          intervalMs: 10000,
        },
      },
      props: {
        unit: '%',
        max: 100,
        warningThreshold: 80,
      },
    },
    {
      id: 'pod-status',
      type: 'DonutChart',
      title: {
        key: 'dashboard.clusterOverview.widget.podStatus.title',
        defaultMessage: 'Pod Status',
      },
      layout: { x: 420, y: 40, w: 360, h: 220 },
      data: {
        source: 'cluster.podStatusDistribution',
        params: {
          clusterId: { $ref: 'context.clusterId' },
        },
      },
      props: {
        nameField: 'name',
        valueField: 'value',
        showLegend: true,
      },
    },
  ],
};
```

---

## 8. DataSource 注册设计

### 8.1 设计目标

DataSource 注册层需要同时服务 Runtime、AI 和配置平台。

它需要提供：

1. 数据请求实现。
2. params schema。
3. output schema。
4. AI 可读 metadata。
5. 示例 params / output。
6. 兼容 widget 列表。
7. i18n 相关能力。

### 8.2 类型定义

```ts
import type { ZodSchema } from 'zod';

export type DataSourceQueryContext<TParams = unknown> = {
  params: TParams;

  runtime: {
    locale: string;
    timezone?: string;
    user?: unknown;
    route?: unknown;
    globalFilters?: Record<string, unknown>;
  };

  signal?: AbortSignal;
};

export type DataSourceDefinition<TParams, TOutput> = {
  name: string;
  description?: string;
  category?: string;

  paramsSchema: ZodSchema<TParams>;
  outputSchema: ZodSchema<TOutput>;

  compatibleWidgets?: string[];

  examples?: Array<{
    params: TParams;
    output: TOutput;
  }>;

  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredWidgets?: string[];
  };

  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };

  query: (ctx: DataSourceQueryContext<TParams>) => Promise<TOutput>;
};

export type DataSourceRegistry = Record<string, DataSourceDefinition<any, any>>;

export function defineDataSources<T extends DataSourceRegistry>(sources: T): T {
  return sources;
}
```

### 8.3 createSdkDataSource helper

由于现有接口以 proto generated TS SDK 为主，建议提供 helper 简化注册：

```ts
export type CreateSdkDataSourceOptions<
  TParams,
  TRequest,
  TResponse,
  TOutput
> = {
  name: string;
  description?: string;
  category?: string;

  paramsSchema: z.ZodSchema<TParams>;
  outputSchema: z.ZodSchema<TOutput>;

  compatibleWidgets?: string[];

  examples?: Array<{
    params: TParams;
    output: TOutput;
  }>;

  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredWidgets?: string[];
  };

  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };

  request: (
    params: TParams,
    ctx: DataSourceQueryContext<TParams>
  ) => TRequest;

  call: (
    request: TRequest,
    ctx: DataSourceQueryContext<TParams>
  ) => Promise<TResponse>;

  transform: (
    response: TResponse,
    ctx: DataSourceQueryContext<TParams>
  ) => TOutput;
};

export function createSdkDataSource<
  TParams,
  TRequest,
  TResponse,
  TOutput
>(
  options: CreateSdkDataSourceOptions<TParams, TRequest, TResponse, TOutput>
): DataSourceDefinition<TParams, TOutput> {
  return {
    name: options.name,
    description: options.description,
    category: options.category,
    paramsSchema: options.paramsSchema,
    outputSchema: options.outputSchema,
    compatibleWidgets: options.compatibleWidgets,
    examples: options.examples,
    aiHints: options.aiHints,
    i18n: options.i18n,

    async query(ctx) {
      const request = options.request(ctx.params, ctx);
      const response = await options.call(request, ctx);
      const output = options.transform(response, ctx);
      return options.outputSchema.parse(output);
    },
  };
}
```

### 8.4 DataSource 注册示例

```ts
import { z } from 'zod';
import {
  createSdkDataSource,
  defineDataSources,
} from '@dao-style-viz/ai-dashboard-runtime';
import { ClusterService } from '@/generated/sdk';

const metricValueSchema = z.object({
  value: z.number(),
  unit: z.string().optional(),
});

export const clusterDataSources = defineDataSources({
  'cluster.cpuUsage': createSdkDataSource({
    name: 'CPU 使用率',
    description: '获取指定集群当前 CPU 使用率',
    category: 'cluster',

    paramsSchema: z.object({
      clusterId: z.string(),
      locale: z.string().optional(),
    }),

    outputSchema: metricValueSchema,

    compatibleWidgets: ['MetricCard', 'GaugeChart'],

    aiHints: {
      goodFor: ['CPU 使用率', '资源使用率', '集群核心指标'],
      notGoodFor: ['时间趋势', '状态分布'],
      preferredWidgets: ['GaugeChart', 'MetricCard'],
    },

    i18n: {
      namespace: 'clusterDashboard',
      labelKey: 'dataSource.cluster.cpuUsage.name',
      descriptionKey: 'dataSource.cluster.cpuUsage.description',
    },

    examples: [
      {
        params: {
          clusterId: 'demo-cluster',
          locale: 'zh-CN',
        },
        output: {
          value: 72.5,
          unit: '%',
        },
      },
    ],

    request: (params, ctx) => ({
      clusterId: params.clusterId,
      locale: params.locale ?? ctx.runtime.locale,
    }),

    call: request => ClusterService.GetResourceUsage(request),

    transform: response => ({
      value: response.cpuUsage,
      unit: '%',
    }),
  }),
});
```

### 8.5 DataSource 命名规范

推荐格式：

```text
domain.resource.metric
```

示例：

```text
cluster.cpuUsage
cluster.memoryUsage
cluster.podStatusDistribution
cluster.nodeHealthList
order.todayCount
order.salesTrend
product.salesRanking
alarm.recentList
```

如果多产品 key 存在冲突，优先通过 registry namespace 隔离，而不是在 key 中无限追加前缀。

---

## 9. AI Catalog 设计

### 9.1 DataSource Catalog

AI 不应该看到 query 实现，只能看到 metadata：

```ts
export function createDataSourceCatalog(registry: DataSourceRegistry) {
  return Object.entries(registry).map(([key, source]) => ({
    key,
    name: source.name,
    description: source.description,
    category: source.category,
    paramsSchema: zodToJsonSchema(source.paramsSchema),
    outputSchema: zodToJsonSchema(source.outputSchema),
    compatibleWidgets: source.compatibleWidgets,
    examples: source.examples,
    aiHints: source.aiHints,
    i18n: source.i18n,
  }));
}
```

### 9.2 Widget Catalog

每个 widget 都必须有 AI metadata。

```ts
export type WidgetFramework = 'vue' | string;

export type WidgetDefinition<TData, TProps, TComponent = unknown> = {
  type: string;
  name: string;
  description?: string;

  category: 'metric' | 'chart' | 'table' | 'layout' | 'filter';

  framework: WidgetFramework;
  component: TComponent;

  dataSchema: z.ZodSchema<TData>;
  propsSchema: z.ZodSchema<TProps>;

  examples?: Array<{
    title: string;
    data: TData;
    props: TProps;
  }>;

  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredDataShape?: string;
  };

  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
};
```

### 9.3 Widget 注册示例

```ts
export const donutChartWidget = defineWidget({
  type: 'DonutChart',
  name: '环形图',
  description: '适合展示分类占比或状态分布',
  category: 'chart',
  framework: 'vue',

  component: DonutChart,

  dataSchema: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    })
  ),

  propsSchema: z.object({
    nameField: z.string().default('name'),
    valueField: z.string().default('value'),
    showLegend: z.boolean().default(true),
    innerRadius: z.number().default(0.6),
  }),

  aiHints: {
    goodFor: ['占比', '分布', '状态统计', '分类统计'],
    notGoodFor: ['时间趋势', '大量分类', '精确数值比较'],
    preferredDataShape: '2-8 categories with name/value fields',
  },

  i18n: {
    namespace: 'dashboardWidgets',
    labelKey: 'widget.donutChart.name',
    descriptionKey: 'widget.donutChart.description',
  },
});
```

---

## 10. ECharts 图表组件设计

### 10.1 ECharts 使用原则

1. 优先使用 ECharts 作为基础图表引擎。
2. 图表组件统一通过标准 WidgetRuntimeProps 接收数据和配置。
3. ECharts option 在组件内部由 `buildOption` 生成。
4. 业务数据在 DataSource 层转换成标准 widget data。
5. Widget 不直接依赖 proto SDK response。
6. ECharts option 中不允许包含来自不可信配置的 JS 函数。
7. tooltip / label / legend 等文案通过 i18n 和 formatter 工具生成。
8. 复杂图表不足时，可以新增 Generated Chart Widget 或接入其他图表引擎。

### 10.2 ChartWidgetProps

```ts
export type WidgetRuntimeProps<TData = unknown, TProps = unknown> = {
  id: string;
  title?: string;
  data: TData;
  props: TProps;

  theme: DashboardTheme;

  locale: string;
  timezone?: string;

  t: (key: string, values?: Record<string, unknown>) => string;

  format: {
    number: (value: number, options?: Intl.NumberFormatOptions) => string;
    date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
    percent: (value: number, options?: Intl.NumberFormatOptions) => string;
  };

  loading?: boolean;
  error?: Error | null;

  width?: number;
  height?: number;

  emit?: (event: WidgetRuntimeEvent) => void;
};
```

### 10.3 ECharts 组件示例

```vue
<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import type { WidgetRuntimeProps } from '@dao-style-viz/ai-dashboard-runtime';

type LineChartDataItem = {
  name: string;
  value: number;
};

type LineChartProps = {
  xField?: string;
  yField?: string;
  smooth?: boolean;
  unit?: string;
};

const runtimeProps =
  defineProps<WidgetRuntimeProps<LineChartDataItem[], LineChartProps>>();

const xField = computed(() => runtimeProps.props.xField ?? 'name');
const yField = computed(() => runtimeProps.props.yField ?? 'value');

const option = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value: number) =>
      `${runtimeProps.format.number(value)}${runtimeProps.props.unit ?? ''}`,
  },
  grid: {
    left: 32,
    right: 24,
    top: 32,
    bottom: 32,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: runtimeProps.data.map(item => item[xField.value as keyof LineChartDataItem]),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'line',
      smooth: runtimeProps.props.smooth ?? false,
      data: runtimeProps.data.map(item => item[yField.value as keyof LineChartDataItem]),
    },
  ],
}));

function handleClick(params: { data?: unknown }) {
  runtimeProps.emit?.({
    trigger: 'clickItem',
    sourceWidgetId: runtimeProps.id,
    payload: {
      data: params.data,
    },
  });
}
</script>

<template>
  <VChart
    :option="option"
    autoresize
    style="width: 100%; height: 100%"
    @click="handleClick"
  />
</template>
```

### 10.4 ECharts dataset 建议

对于多 series、大数据、多图复用数据的图表，优先使用 ECharts `dataset` 和 `encode`，把数据和视觉映射分离。

标准方向：

```ts
const option = {
  dataset: {
    dimensions: ['date', 'cpu', 'memory'],
    source: data,
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [
    { type: 'line', encode: { x: 'date', y: 'cpu' } },
    { type: 'line', encode: { x: 'date', y: 'memory' } },
  ],
};
```

### 10.5 ECharts 安全规则

从配置生成 ECharts option 时必须限制：

1. 不允许来自 dashboard config 的任意 JS function。
2. 不允许不可信 HTML 直接进入 tooltip / label。
3. 不允许不可信 URL 进入 image / link / rich text。
4. 不允许不受控 regex transform。
5. 若后续开放 dataset transform，需要限制 transform 类型和参数。
6. formatter 逻辑应由组件代码提供，不应由用户配置直接注入函数。

---

## 11. 国际化设计

### 11.1 国际化目标

平台需要支持：

1. Dashboard 配置国际化。
2. DataSource metadata 国际化。
3. Widget metadata 国际化。
4. Widget 内部文案国际化。
5. ECharts 内置交互国际化。
6. 数字、百分比、日期、时间、单位格式化。
7. 传递 locale 到后端接口。
8. 切换语言时重新请求包含 locale 的数据源。

### 11.2 I18nText

所有用户可见文本使用 `I18nText`：

```ts
export type I18nText =
  | string
  | {
      key: string;
      defaultMessage?: string;
      values?: Record<string, ConfigValue>;
    };
```

示例：

```ts
title: {
  key: 'dashboard.clusterOverview.widget.cpuUsage.title',
  defaultMessage: 'CPU Usage',
}
```

### 11.3 Runtime i18n context

Runtime 需要接收：

```ts
export type RuntimeI18n = {
  locale: string;
  fallbackLocale?: string;
  timezone?: string;
  messages: Record<string, Record<string, string>>;
  t: (key: string, values?: Record<string, unknown>) => string;
};
```

### 11.4 格式化工具

Runtime 统一提供 format：

```ts
export function createFormatters(locale: string, timezone?: string) {
  return {
    number(value: number, options?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(locale, options).format(value);
    },

    percent(value: number, options?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 2,
        ...options,
      }).format(value);
    },

    date(value: Date | string | number, options?: Intl.DateTimeFormatOptions) {
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        ...options,
      }).format(new Date(value));
    },
  };
}
```

### 11.5 locale 变更触发重新请求

因为部分请求中包含 locale 信息，Runtime 必须把 `locale` 视为 data dependency。

当 locale 变化时：

1. 更新 runtime.locale。
2. 重新 resolve widget params。
3. 如果 data.params 中引用了 `context.locale` 或 dataSource 声明 `dependsOnLocale: true`，则重新请求。
4. 重新渲染所有依赖 i18n 文案的 widget。

DataSource 可以增加字段：

```ts
export type DataSourceDefinition<TParams, TOutput> = {
  // ...
  dependsOnLocale?: boolean;
  query: (ctx: DataSourceQueryContext<TParams>) => Promise<TOutput>;
};
```

若 `dependsOnLocale: true`，即使 params 中没有显式 locale，也在 locale 变化时重新请求。

### 11.6 ECharts locale

ECharts 初始化时需要传入 locale。Runtime 的 ECharts wrapper 应统一处理：

```ts
const chart = echarts.init(dom, themeName, {
  renderer: 'canvas',
  locale: runtime.locale,
});
```

如果使用 ECharts 内置或自定义语言包，需要在应用初始化时注册：

```ts
echarts.registerLocale('zh-CN', zhCNLocale);
echarts.registerLocale('en-US', enUSLocale);
```

### 11.7 AI 生成时的 i18n 要求

AI 生成 DashboardConfig 时必须：

1. 所有 title / description 使用 i18n key。
2. 提供 defaultMessage。
3. 同时输出按 locale 拆分的 JSON 文案资源，例如 `cluster-overview.i18n/zh-CN.json` 与 `cluster-overview.i18n/en-US.json`，供项目侧 merge。
4. 不在图表 option 中硬编码 tooltip 文案。
5. props 中如有单位、枚举展示名，应使用 i18n key 或由 formatter 处理。
6. 生成组件时必须通过 `t` 和 `format` 获取文案与格式化结果。

示例：

```ts
title: {
  key: 'dashboard.clusterOverview.widget.nodeHealth.title',
  defaultMessage: 'Node Health',
}
```

不推荐：

```ts
title: '节点健康状态'
```

---

## 12. Runtime 执行流程

### 12.1 渲染流程

```text
BigScreenRuntime
  ↓
validate DashboardConfig
  ↓
create runtime context
  ↓
render ScreenCanvas
  ↓
for each widget:
    resolve visible
    resolve i18n title
    find widget definition
    find dataSource definition
    resolve params
    validate paramsSchema
    query dataSource
    validate outputSchema
    render WidgetShell
    render Widget Component
```

### 12.2 数据加载伪代码

```ts
async function loadWidgetData(widget: WidgetConfig, options: {
  dataSources: DataSourceRegistry;
  runtimeContext: RuntimeContext;
}) {
  if (!widget.data) return undefined;

  const source = options.dataSources[widget.data.source];

  if (!source) {
    throw new Error(`DataSource not found: ${widget.data.source}`);
  }

  const resolvedParams = resolveRefs(
    widget.data.params ?? {},
    options.runtimeContext
  );

  const params = source.paramsSchema.parse(resolvedParams);

  const output = await source.query({
    params,
    runtime: options.runtimeContext,
    signal: options.runtimeContext.abortSignal,
  });

  return source.outputSchema.parse(output);
}
```

### 12.3 刷新策略

MVP 支持：

```ts
refresh: {
  type: 'manual' | 'interval';
  intervalMs?: number;
}
```

后续扩展：

```ts
refresh: {
  type: 'subscription';
}
```

### 12.4 请求取消

切换 dashboard、切换 filters、切换 locale 时，Runtime 应使用 AbortController 取消旧请求。

---

## 13. AI 生成 Dashboard 流程

### 13.1 输入

AI 生成 dashboard 时需要输入：

1. 用户自然语言需求。
2. DataSource Catalog。
3. Widget Catalog。
4. Theme Catalog。
5. Layout Presets。
6. i18n 规则。
7. 当前产品上下文。

### 13.2 输出分两步

#### 第一步：Dashboard Plan

```json
{
  "title": "Cluster Overview Dashboard",
  "intent": "Show cluster resource usage, pod status, node health, and alerts.",
  "widgets": [
    {
      "titleKey": "dashboard.clusterOverview.widget.cpuUsage.title",
      "dataSource": "cluster.cpuUsage",
      "widget": "GaugeChart",
      "reason": "CPU usage is a single percentage metric. GaugeChart is suitable."
    }
  ],
  "missingCapabilities": []
}
```

#### 第二步：DashboardConfig

AI 根据 plan 生成符合 schema 的 DashboardConfig。

### 13.3 AI 生成约束

AI 必须遵守：

1. 只能使用 catalog 中存在的 dataSource key。
2. 只能使用 registry 中存在的 widget type，除非明确进入新图表组件生成流程。
3. 所有用户可见文本必须使用 I18nText。
4. params 必须满足 dataSource 的 paramsSchema。
5. widget props 必须满足 widget 的 propsSchema。
6. layout 不得超出 canvas。
7. refresh interval 不得小于平台最小值，例如 5 秒。
8. 不得生成可执行代码。

---

## 14. AI 生成图表组件流程

### 14.1 触发条件

只有以下情况触发：

1. 现有组件无法表达用户需要的图表。
2. 用户明确要求特殊视觉效果。
3. 需要特殊组合图。
4. 需要特殊拓扑图、关系图、流程图、地图、时间轴等。
5. 现有 ECharts option 无法通过 props 表达。

### 14.2 生成内容

AI 生成一个标准组件包：

```text
custom-chart-xxx
  ├─ manifest.json
  ├─ Chart.vue
  ├─ schema.ts
  ├─ sample-data.json
  ├─ README.md
  └─ Chart.stories.ts
```

### 14.3 manifest.json

```json
{
  "type": "CustomNodeTrafficTopologyChart",
  "name": "Node Traffic Topology Chart",
  "description": "Show node topology and network traffic between nodes.",
  "category": "chart",
  "runtime": "vue",
  "chartEngine": "echarts",
  "inputType": "NodeTrafficTopologyData",
  "version": "0.1.0",
  "i18n": {
    "namespace": "generatedCharts",
    "labelKey": "chart.nodeTrafficTopology.name",
    "descriptionKey": "chart.nodeTrafficTopology.description"
  }
}
```

### 14.4 schema.ts

```ts
import { z } from 'zod';

export const dataSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      cpuUsage: z.number(),
      status: z.enum(['healthy', 'warning', 'error']),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      traffic: z.number(),
    })
  ),
});

export const propsSchema = z.object({
  showLabels: z.boolean().default(true),
  trafficUnit: z.string().default('Mbps'),
});
```

### 14.5 Chart.vue 约束

AI 生成的 Chart.vue 必须：

1. 是 Vue 3.3.x 单文件组件。
2. 使用标准 WidgetRuntimeProps 兼容 props / emits。
3. 不发起网络请求。
4. 不访问业务 SDK。
5. 不访问 token / cookie / storage。
6. 不使用 eval / new Function。
7. 不使用 `v-html`。
8. 所有文本通过 t / format 处理。
9. 仅使用白名单依赖。

### 14.6 校验流程

```text
Generate Chart Package
  ↓
TypeScript check
  ↓
ESLint
  ↓
AST safety scan
  ↓
Schema validation
  ↓
Bundle build
  ↓
Sandbox preview
  ↓
Human approve
  ↓
Publish as private/shared widget
```

### 14.7 AST 禁止清单

禁止出现：

```text
fetch
XMLHttpRequest
WebSocket
EventSource
localStorage
sessionStorage
document.cookie
eval
Function
import(...)
v-html
window.location
document.write
```

### 14.8 依赖白名单

MVP 允许：

```text
vue
echarts
vue-echarts
@dao-style-viz/ai-dashboard-runtime
lodash-es
```

其他依赖必须人工审核。

---

## 15. 权限与安全边界

### 15.1 数据权限

数据权限由业务系统与 dataSource 实现保证。Runtime 不越权查询数据。

DataSource query 内部可以使用当前产品已有权限逻辑：

```ts
async query(ctx) {
  assertCanViewCluster(ctx.runtime.user, ctx.params.clusterId);
  return ClusterService.GetOverview(...);
}
```

### 15.2 Dashboard 配置权限

需要区分：

* 查看 dashboard
* 编辑 dashboard
* 发布 dashboard
* 新增 dataSource
* 新增 generated widget
* 将私有组件提升为共享组件

### 15.3 AI 权限

AI 只能读取：

* dataSource metadata
* widget metadata
* theme metadata
* layout presets
* i18n key metadata

AI 不能读取：

* query 实现
* token
* 用户敏感数据
* 后端 SDK 源码，除非明确进入受控开发上下文

---

## 16. 文件结构建议

### 16.1 平台 SDK

```text
packages/
  ai-dashboard-schema/
    src/
      dashboard-config.ts
      widget-config.ts
      i18n.ts
      index.ts

  ai-dashboard-runtime/
    src/
      data-loader.ts
      ref-resolver.ts
      refresh-manager.ts
      event-dispatcher.ts
      renderer-adapter.ts
      i18n-runtime.ts
      formatters.ts
      index.ts

  ai-dashboard-vue/
    src/
      BigScreenRuntime.vue
      ScreenCanvas.vue
      WidgetRenderer.vue
      WidgetShell.vue
      WidgetErrorBoundary.vue
      define-vue-widget.ts
      index.ts

  ai-dashboard-widgets/
    src/
      MetricCard/
      RankingList/
      ScrollTable/
      AlarmList/
      FilterBar/
      index.ts

  ai-dashboard-echarts-vue/
    src/
      LineChart/
      BarChart/
      DonutChart/
      GaugeChart/
      RadarChart/
      utils/
        create-echarts-option.ts
        echarts-theme.ts
        echarts-locale.ts
      index.ts

  ai-dashboard-ai-catalog/
    src/
      create-data-source-catalog.ts
      create-widget-catalog.ts
      create-theme-catalog.ts
      index.ts

  ai-dashboard-sandbox/
    src/
      compile.ts
      ast-scan.ts
      preview-frame.vue
      index.ts
```

### 16.2 业务产品接入

```text
product-a/
  src/
    generated/
      sdk/

    big-screen/
      data-sources/
        cluster.data-sources.ts
        order.data-sources.ts
        index.ts

      dashboards/
        cluster-overview.dashboard.ts
        cluster-overview.i18n/
          zh-CN.json
          en-US.json

      i18n/
        zh-CN.json
        en-US.json

      screens/
        ClusterOverviewDashboard.vue
```

---

## 17. MVP 开发计划

### Phase 1：配置驱动 Runtime

目标：先跑通手写 DashboardConfig。

任务：

1. 定义 DashboardConfig schema。
2. 定义 WidgetConfig schema。
3. 实现 `$ref` resolver。
4. 实现 BigScreenRuntime。
5. 实现 ScreenCanvas 缩放。
6. 实现 WidgetRenderer。
7. 实现 loading / empty / error。
8. 实现 interval refresh。
9. 实现 i18n runtime。
10. 实现 locale 变化重新渲染。

验收标准：

* 可以通过 TS 配置渲染一个 1920x1080 大屏。
* 可以绑定 dataSource key 加载数据。
* 可以切换 locale 并更新标题、tooltip、数字格式。
* 可以通过 interval 自动刷新数据。

### Phase 2：DataSource Registry

目标：适配 proto generated TS SDK static method。

任务：

1. 实现 defineDataSources。
2. 实现 createSdkDataSource。
3. 支持 paramsSchema 校验。
4. 支持 outputSchema 校验。
5. 支持 createDataSourceCatalog。
6. 支持 dependsOnLocale。
7. 提供 3 个业务 dataSource 示例。

验收标准：

* 可以注册 `cluster.cpuUsage`。
* DashboardConfig 可以通过 `source: 'cluster.cpuUsage'` 使用该数据源。
* locale 变化时，dependsOnLocale 数据源会重新请求。
* AI Catalog 中不包含 query 实现。

### Phase 3：ECharts 组件库

目标：提供基础图表组件。

任务：

1. 实现 LineChart。
2. 实现 BarChart。
3. 实现 DonutChart。
4. 实现 GaugeChart。
5. 实现 RankingList 或基础列表组件。
6. 实现 ECharts locale 初始化。
7. 实现 tooltip / label i18n formatter。
8. 实现 widget metadata。

验收标准：

* 每个 widget 有 dataSchema / propsSchema / aiHints。
* 每个 widget 能被 WidgetRegistry 注册。
* DashboardConfig 能选择不同 chart type 渲染。
* 图表组件不直接依赖业务 SDK。

### Phase 4：AI 生成 DashboardConfig

目标：AI 根据 catalog 生成 dashboard config。

任务：

1. 实现 DataSource Catalog 导出。
2. 实现 Widget Catalog 导出。
3. 定义 AI prompt template。
4. 先生成 Dashboard Plan。
5. 再生成 DashboardConfig。
6. 对 AI 输出做 schema 校验。
7. 提供自动修复 prompt。

验收标准：

* 输入“生成一个集群监控大屏”，AI 能生成 dashboard plan。
* AI 只能引用已注册 dataSource 和 widget。
* AI 生成 config 可以被 Runtime 渲染。
* 生成的 title 使用 i18n key + defaultMessage。

### Phase 5：AI 图表组件生成 Sandbox

目标：受控生成 chart widget。

任务：

1. 定义 generated chart package 结构。
2. 实现 Vue SFC 编译。
3. 实现 AST 安全扫描。
4. 实现依赖白名单检查。
5. 实现 iframe sandbox preview。
6. 实现 manifest 校验。
7. 实现 generated widget registry。

验收标准：

* AI 可以生成一个 RadarChart 组件包。
* 组件通过类型检查与安全扫描。
* 组件可以使用 sample data 预览。
* 未通过扫描的组件不能注册。

---

## 18. Agent 开发任务拆分

以下任务可以直接交给 coding agent 逐步实现。

### Task 1：创建 schema 包

目标：实现 dashboard 配置核心类型与 zod schema。

输入：本文档第 6 节。

输出：

```text
packages/ai-dashboard-schema/src/dashboard-config.ts
packages/ai-dashboard-schema/src/widget-config.ts
packages/ai-dashboard-schema/src/i18n.ts
packages/ai-dashboard-schema/src/index.ts
```

验收：

* TypeScript 类型通过。
* Zod schema 可以校验示例 DashboardConfig。
* 单元测试覆盖合法配置与非法配置。

### Task 2：实现 ref resolver

目标：支持从 runtime context 中解析 `$ref`。

示例：

```ts
resolveRefs(
  { clusterId: { $ref: 'context.clusterId' } },
  { context: { clusterId: 'c1' } }
)
```

输出：

```ts
{ clusterId: 'c1' }
```

验收：

* 支持对象、数组、嵌套对象。
* 找不到 ref 时返回错误，不静默失败。
* 不支持 `$expr`。

### Task 3：实现 DataSource Registry

目标：实现 defineDataSources 与 createSdkDataSource。

输入：本文档第 8 节。

验收：

* query 前校验 params。
* query 后校验 output。
* 支持 signal 传入。
* 支持 metadata 导出。

### Task 4：实现 Runtime

目标：实现 BigScreenRuntime、WidgetRenderer、data-loader。

验收：

* 可以渲染多个 widget。
* 可以通过 dataSource 加载数据。
* loading / error / empty 正常显示。
* interval refresh 正常工作。
* 组件异常不会导致整个 dashboard 崩溃。

### Task 5：实现 i18n runtime

目标：实现 I18nText 解析、formatters、locale 变化重新加载。

验收：

* title 可以通过 key 翻译。
* number/date/percent 使用 locale 格式化。
* locale 变化触发视图刷新。
* dependsOnLocale 数据源重新请求。

### Task 6：实现 ECharts 基础组件

目标：实现 LineChart、BarChart、DonutChart、GaugeChart。

验收：

* 每个组件有 dataSchema / propsSchema。
* 每个组件有 widget metadata。
* tooltip 使用 format 工具。
* 文案通过 t 或 i18n config 处理。
* 不从组件内请求数据。

### Task 7：实现 AI Catalog

目标：导出 AI 可读 JSON。

验收：

* DataSource Catalog 不包含 query 函数。
* Widget Catalog 不包含 Vue component 源码。
* Catalog 包含 schema、examples、aiHints、i18n metadata。

### Task 8：实现 AI Dashboard 生成器

目标：基于 prompt + catalog 生成 DashboardPlan 和 DashboardConfig。

验收：

* AI 输出必须通过 schema 校验。
* 不允许引用未知 dataSource。
* 不允许引用未知 widget。
* 文案必须使用 I18nText。
* 提供自动修复机制。

### Task 9：实现 Generated Chart Sandbox

目标：支持 AI 生成 chart widget 的受控预览。

验收：

* Vue SFC 编译通过。
* AST 安全扫描通过。
* 依赖白名单通过。
* iframe sandbox 预览可用。
* 失败时输出明确错误。

---

## 19. AI Prompt 模板建议

### 19.1 Dashboard Plan Prompt

```text
You are an AI dashboard designer.

Generate a dashboard plan based on the user's request.

Rules:
- Use only dataSources from the provided DataSource Catalog.
- Use only widgets from the provided Widget Catalog.
- Do not invent dataSource keys.
- Do not invent widget types.
- All user-facing text must use i18n keys and defaultMessage.
- If existing widgets are insufficient, add an item to missingCapabilities.
- Output JSON only.
```

### 19.2 DashboardConfig Prompt

```text
Generate a DashboardConfig based on the approved dashboard plan.

Rules:
- Must conform to DashboardConfig schema.
- Use i18n text objects for title and description.
- Also generate locale JSON resources for every new i18n key used by the config.
- Keep generated i18n keys under the dashboard namespace to avoid host-project merge collisions.
- Params must match the selected dataSource paramsSchema.
- Props must match the selected widget propsSchema.
- Layout must fit within the canvas.
- refresh.intervalMs must not be lower than 5000.
- Do not output executable JavaScript code.
- Output DashboardConfig JSON and locale JSON resources only.
```

### 19.3 Chart Component Prompt

```text
Generate a Vue chart widget package.

Rules:
- Generate only chart presentation code.
- Use the standard WidgetRuntimeProps interface.
- Do not fetch data.
- Do not call any business SDK.
- Do not read localStorage/sessionStorage/cookie.
- Do not use eval/new Function/dynamic import.
- Do not use v-html.
- Use t() and format.*() for all user-facing text.
- Use only allowed dependencies.
- Output files: manifest.json, schema.ts, Chart.vue, sample-data.json, README.md.
```

---

## 20. 风险与应对

### 20.1 配置过度复杂

风险：配置层变成一门脚本语言。

应对：

* MVP 只支持 `$ref`。
* 不支持 `$expr`。
* 复杂逻辑放到 dataSource handler。

### 20.2 AI 生成代码不可控

风险：AI 生成不安全或难维护代码。

应对：

* 只允许生成 chart widget。
* AST 安全扫描。
* 依赖白名单。
* iframe sandbox。
* 人工确认后发布。

### 20.3 i18n 后补成本高

风险：后期再补国际化会改动大量配置和组件。

应对：

* 从第一版 schema 支持 I18nText。
* Runtime 统一提供 t / format。
* AI prompt 强制使用 i18n key。

### 20.4 数据源元信息维护成本高

风险：业务开发者不愿意写 examples / aiHints。

应对：

* paramsSchema / outputSchema 必填。
* examples / aiHints 初期可选，但推荐补齐。
* 提供脚手架生成 dataSource 模板。

### 20.5 ECharts 表现力不足

风险：复杂拓扑、流程、三维、特殊地图难以表达。

应对：

* ECharts 作为默认基础组件库。
* Generated Chart 支持 chartEngine 字段。
* 后续允许受控接入 G6 / L7 / D3 / Three.js。

---

## 21. 最终落地路线

推荐按以下顺序推进：

```text
1. Schema
2. Runtime
3. DataSource Registry
4. ECharts Widget Registry
5. i18n Runtime
6. AI Catalog
7. AI Dashboard Config Generator
8. Generated Chart Sandbox
9. Dashboard Editor
10. Component Marketplace
```

第一阶段目标不是一次性做完整低代码平台，而是先跑通：

```text
手写/AI 生成 DashboardConfig
  ↓
Runtime 渲染
  ↓
DataSource 调用 proto TS SDK
  ↓
ECharts Widget 展示
  ↓
locale 切换重新请求并更新展示
```

---

## 22. 一句话总结

本平台的核心设计是：

```text
AI 生成 dashboard 配置，Runtime 负责安全运行；
业务产品通过 DataSource Registry 接入现有 proto TS SDK；
图表组件通过 Widget Registry 统一复用；
AI 只能在受控范围内生成 chart widget；
i18n、schema 校验、安全扫描从第一版开始内置。
```
