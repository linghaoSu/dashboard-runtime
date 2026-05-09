import {
  createSdkDataSource,
  defineDataSources
} from "@dao-style-viz/ai-dashboard-runtime";
import { z } from "zod";
import { ClusterService } from "../mock-sdk";
import type {
  GetCpuTrendRequest,
  GetCpuTrendResponse,
  GetResourceUsageRequest,
  GetResourceUsageResponse,
  ListPodStatusRequest,
  ListPodStatusResponse
} from "../mock-sdk";

const clusterParamsSchema = z.object({
  clusterId: z.string(),
  locale: z.string().optional()
});

const clusterIdParamsSchema = z.object({
  clusterId: z.string()
});

const metricValueSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional()
});

const lineChartDataSchema = z.array(
  z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
);

const donutChartDataSchema = z.array(
  z.object({
    name: z.string(),
    value: z.number()
  })
);

type ClusterParams = z.infer<typeof clusterParamsSchema>;
type ClusterIdParams = z.infer<typeof clusterIdParamsSchema>;
type MetricValueData = z.infer<typeof metricValueSchema>;
type LineChartData = z.infer<typeof lineChartDataSchema>;
type DonutChartData = z.infer<typeof donutChartDataSchema>;

export const clusterDataSources = defineDataSources({
  "cluster.cpuUsage": createSdkDataSource<
    ClusterParams,
    GetResourceUsageRequest,
    GetResourceUsageResponse,
    MetricValueData
  >({
    name: "CPU Usage",
    description: "Get the current CPU usage for a cluster",
    category: "cluster",
    paramsSchema: clusterParamsSchema,
    outputSchema: metricValueSchema,
    compatibleWidgets: ["MetricValue", "GaugeChart"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          clusterId: "demo-cluster",
          locale: "en-US"
        },
        output: {
          label: "CPU Usage",
          value: 72.5,
          unit: "%"
        }
      }
    ],
    request: (params, ctx) => ({
      clusterId: params.clusterId,
      locale: params.locale ?? ctx.runtime.locale
    }),
    call: (request) => ClusterService.GetResourceUsage(request),
    transform: (response, ctx) => ({
      label:
        ctx.runtime.locale === "zh-CN"
          ? "CPU 使用率"
          : "CPU Usage",
      value: response.cpuUsage,
      unit: "%"
    })
  }),
  "cluster.cpuTrend": createSdkDataSource<
    ClusterIdParams,
    GetCpuTrendRequest,
    GetCpuTrendResponse,
    LineChartData
  >({
    name: "CPU Trend",
    description: "Get recent CPU usage trend points for a cluster",
    category: "cluster",
    paramsSchema: clusterIdParamsSchema,
    outputSchema: lineChartDataSchema,
    compatibleWidgets: ["LineChart"],
    examples: [
      {
        params: {
          clusterId: "demo-cluster"
        },
        output: [
          { time: "10:00", value: 62 },
          { time: "10:05", value: 66 }
        ]
      }
    ],
    request: (params) => ({
      clusterId: params.clusterId
    }),
    call: (request) => ClusterService.GetCpuTrend(request),
    transform: (response) => response.points
  }),
  "cluster.podStatusDistribution": createSdkDataSource<
    ClusterParams,
    ListPodStatusRequest,
    ListPodStatusResponse,
    DonutChartData
  >({
    name: "Pod Status Distribution",
    description: "Get pod status counts for a cluster",
    category: "cluster",
    paramsSchema: clusterParamsSchema,
    outputSchema: donutChartDataSchema,
    compatibleWidgets: ["DonutChart"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          clusterId: "demo-cluster",
          locale: "en-US"
        },
        output: [
          { name: "Running", value: 42 },
          { name: "Pending", value: 3 },
          { name: "Failed", value: 1 }
        ]
      }
    ],
    request: (params, ctx) => ({
      clusterId: params.clusterId,
      locale: params.locale ?? ctx.runtime.locale
    }),
    call: (request) => ClusterService.ListPodStatus(request),
    transform: (response) => response.items
  })
});
