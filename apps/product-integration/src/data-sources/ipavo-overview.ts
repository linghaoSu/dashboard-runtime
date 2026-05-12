import {
  createSdkDataSource,
  defineDataSources
} from "@dao-style-viz/ai-dashboard-runtime";
import { lineChartDataSchema } from "@dao-style-viz/ai-dashboard-echarts-vue";
import { z } from "zod";
import {
  displayType,
  IPavo,
  type EmptyRequest,
  type GetAlertSummaryResponse,
  type GetPodSummaryRequest,
  type GetPodSummaryResponse,
  type GetResourceSummaryResponse,
  type GetResourceUsageResponse,
  type ListProductsResponse
} from "../product-sdk/generated/ipavo-overview";
import {
  ipavoAbilityOverviewDataSchema,
  ipavoAlertStatusDataSchema,
  ipavoClusterCountDataSchema,
  ipavoHealthStatusDataSchema,
  ipavoPodStatisticsDataSchema,
  ipavoResourceUsageDataSchema
} from "../widgets/ipavo";

// The reference ipavo-ui pins @daocloud-proto/ipavo@0.13.0-20. Live pilots should
// replace the local fixture above with:
// import { IPavo } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo.pb";
// import type { ... } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo_type.pb";
// Backend URL and JWT auth headers belong to the host/server proxy, not
// DashboardConfig or AI-facing catalog output.
const emptyParamsSchema = z.object({});

const legend = [
  { label: "90~100%", color: "#32d475" },
  { label: "80~90%", color: "#ffcc5a" },
  { label: "60~80%", color: "#ff8787" },
  { label: "40~60%", color: "#f03e3e" },
  { label: "0~40%", color: "#c92a2a" },
  { label: "未知", color: "#c9ced6" }
];

export const ipavoOverviewDataSources = defineDataSources({
  "ipavo.podStatistics": createSdkDataSource<
    Record<string, never>,
    GetPodSummaryRequest,
    GetPodSummaryResponse,
    z.infer<typeof ipavoPodStatisticsDataSchema>
  >({
    name: "Ipavo Pod Statistics",
    description: "Pod health distribution by cluster or namespace",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoPodStatisticsDataSchema,
    compatibleWidgets: ["IpavoPodStatistics"],
    examples: [
      {
        params: {},
        output: {
          cells: [{ id: "cluster-1", label: "minquan-dev", status: "healthy" }],
          legend,
          totalPods: 278,
          runningPods: 241,
          otherPods: 37
        }
      }
    ],
    request: () => ({ type: displayType.BY_CLUSTER }),
    call: (request) => IPavo.GetPodSummary(request),
    transform: (response) => {
      let totalPods = 0;
      let runningPods = 0;
      const cells = (response.items ?? []).flatMap((item, itemIndex) => {
        const total = item.podCount?.total ?? 0;
        const healthy = item.podCount?.healthy ?? 0;
        if (total <= 0) {
          return [];
        }

        totalPods += total;
        runningPods += healthy;
        const unhealthy = Math.max(total - healthy, 0);
        const healthyCells = Math.max(Math.round((healthy / total) * 14), 1);
        const unhealthyCells = Math.max(Math.round((unhealthy / total) * 4), 1);
        const label = item.cluster ?? item.namespace ?? item.pod ?? `pod-${itemIndex + 1}`;

        return [
          ...Array.from({ length: healthyCells }, (_, index) => ({
            id: `${label}-healthy-${itemIndex}-${index}`,
            label,
            status: "healthy" as const
          })),
          ...Array.from({ length: unhealthyCells }, (_, index) => ({
            id: `${label}-warning-${itemIndex}-${index}`,
            label,
            status: "warning" as const
          }))
        ];
      });

      return {
        cells,
        legend,
        totalPods,
        runningPods,
        otherPods: Math.max(totalPods - runningPods, 0)
      };
    }
  }),
  "ipavo.cpuUsage": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetResourceUsageResponse,
    z.infer<typeof lineChartDataSchema>
  >({
    name: "Ipavo CPU Usage",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: lineChartDataSchema,
    compatibleWidgets: ["LineChart", "AreaChart"],
    examples: [{ params: {}, output: [{ time: "15:00", value: 9.2 }] }],
    request: () => ({}),
    call: (request) => IPavo.GetResourceUsage(request),
    transform: (response) => toLineData(response.cpu?.history ?? [], (value) => value)
  }),
  "ipavo.memoryUsage": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetResourceUsageResponse,
    z.infer<typeof lineChartDataSchema>
  >({
    name: "Ipavo Memory Usage",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: lineChartDataSchema,
    compatibleWidgets: ["LineChart", "AreaChart"],
    examples: [{ params: {}, output: [{ time: "15:00", value: 48.2 }] }],
    request: () => ({}),
    call: (request) => IPavo.GetResourceUsage(request),
    transform: (response) =>
      toLineData(response.memory?.history ?? [], (value) => value / 1024 ** 3)
  }),
  "ipavo.healthStatus": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetResourceSummaryResponse,
    z.infer<typeof ipavoHealthStatusDataSchema>
  >({
    name: "Ipavo Health Status",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoHealthStatusDataSchema,
    compatibleWidgets: ["IpavoHealthStatus"],
    examples: [
      {
        params: {},
        output: {
          status: "healthy",
          label: "健康",
          items: []
        }
      }
    ],
    request: () => ({}),
    call: (request) => IPavo.GetResourceSummary(request),
    transform: (response) => {
      const items = [
        toHealthItem("集群", "C", response.clusterCount, response.threshold ?? 0.8),
        toHealthItem("节点", "N", response.nodeCount, response.threshold ?? 0.8),
        toHealthItem("容器组", "P", response.podCount, response.threshold ?? 0.8)
      ];
      const healthy = items.every((item) => item.status === "healthy");

      return {
        status: healthy ? "healthy" : "unhealthy",
        label: healthy ? "健康" : "不健康",
        items
      };
    }
  }),
  "ipavo.alertStatus": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetAlertSummaryResponse,
    z.infer<typeof ipavoAlertStatusDataSchema>
  >({
    name: "Ipavo Alert Status",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoAlertStatusDataSchema,
    compatibleWidgets: ["IpavoAlertStatus"],
    examples: [
      {
        params: {},
        output: {
          counts: [],
          messages: []
        }
      }
    ],
    request: () => ({}),
    call: (request) => IPavo.GetAlertSummary(request),
    transform: (response) => ({
      counts: [
        {
          label: "紧急",
          value: response.alertCount?.critical ?? 0,
          status: "critical",
          color: "#dd5250"
        },
        {
          label: "警告",
          value: response.alertCount?.warning ?? 0,
          status: "warning",
          color: "#f4a62a"
        },
        {
          label: "提示",
          value: response.alertCount?.info ?? 0,
          status: "info",
          color: "#2497df"
        }
      ],
      messages: response.alertMessages ?? []
    })
  }),
  "ipavo.clusterCount": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetResourceSummaryResponse,
    z.infer<typeof ipavoClusterCountDataSchema>
  >({
    name: "Ipavo Cluster Count",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoClusterCountDataSchema,
    compatibleWidgets: ["IpavoClusterCount"],
    examples: [{ params: {}, output: { clusters: [], nodes: 8 } }],
    request: () => ({}),
    call: (request) => IPavo.GetResourceSummary(request),
    transform: (response) => ({
      clusters: (response.clusterItems ?? []).map(toClusterItem),
      nodes: response.nodeCount?.total ?? 0
    })
  }),
  "ipavo.resourceUsage": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    GetResourceUsageResponse,
    z.infer<typeof ipavoResourceUsageDataSchema>
  >({
    name: "Ipavo Resource Usage",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoResourceUsageDataSchema,
    compatibleWidgets: ["IpavoResourceUsage"],
    examples: [{ params: {}, output: { items: [] } }],
    request: () => ({}),
    call: (request) => IPavo.GetResourceUsage(request),
    transform: (response) => ({
      items: [
        toUsageItem("CPU", response.cpu, "core"),
        toUsageItem("内存", response.memory, "bytes"),
        toUsageItem("容器组", response.pod, "count"),
        toUsageItem("磁盘", response.disk, "bytes")
      ]
    })
  }),
  "ipavo.abilityOverview": createSdkDataSource<
    Record<string, never>,
    EmptyRequest,
    ListProductsResponse,
    z.infer<typeof ipavoAbilityOverviewDataSchema>
  >({
    name: "Ipavo Ability Overview",
    category: "ipavo",
    paramsSchema: emptyParamsSchema,
    outputSchema: ipavoAbilityOverviewDataSchema,
    compatibleWidgets: ["IpavoAbilityOverview"],
    examples: [{ params: {}, output: { products: [] } }],
    request: () => ({}),
    call: (request) => IPavo.ListProducts(request),
    transform: (response) => ({
      products: (response.items ?? []).map((item, index) => {
        const title = item.title ?? item.id ?? `Product ${index + 1}`;

        return {
          title,
          icon: title.slice(0, 1),
          features: item.features ?? []
        };
      })
    })
  })
});

function toLineData(
  history: Array<{ timestamp?: string | number; value?: string | number }>,
  readValue: (value: number) => number
) {
  return history.map((item) => ({
    time: new Date(toNumber(item.timestamp) * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }),
    value: readValue(toNumber(item.value))
  }));
}

function toHealthItem(
  label: string,
  icon: string,
  count: { healthy?: number; total?: number } | undefined,
  threshold: number
) {
  const total = count?.total ?? 0;
  const healthyCount = count?.healthy ?? 0;
  const healthy = total === 0 || healthyCount / total > threshold;

  return {
    label,
    icon,
    healthy: healthyCount,
    total,
    status: healthy ? "healthy" as const : "unhealthy" as const
  };
}

function toUsageItem(
  label: string,
  usage: { usage?: number; total?: number } | undefined,
  unit: "bytes" | "core" | "count"
) {
  const used = usage?.usage ?? 0;
  const total = usage?.total ?? 0;
  const percent = total === 0 ? 0 : used / total;

  return {
    label,
    percent,
    usedLabel: formatUsage(used, unit),
    totalLabel: formatUsage(total, unit),
    color: percent >= 0.8 ? "#dd5250" : percent >= 0.6 ? "#f4b434" : "#43a1e5"
  };
}

function toClusterItem(item: {
  name?: string;
  provider?: string;
  clusterFeatures?: string[];
  features?: string[];
}) {
  return {
    name: item.name ?? "unknown",
    provider: item.provider ?? "unknown",
    features: item.clusterFeatures ?? item.features ?? []
  };
}

function formatUsage(value: number, unit: "bytes" | "core" | "count") {
  if (unit === "bytes") {
    if (value >= 1024 ** 4) {
      return `${(value / 1024 ** 4).toFixed(2)} TB`;
    }
    return `${(value / 1024 ** 3).toFixed(2)} GB`;
  }

  if (unit === "core") {
    return `${Number(value.toFixed(3))} core`;
  }

  return String(Math.round(value));
}

function toNumber(value: string | number | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
