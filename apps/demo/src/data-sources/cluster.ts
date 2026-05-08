import {
  createSdkDataSource,
  defineDataSources
} from "@dao-style-viz/ai-dashboard-runtime";
import { z } from "zod";
import { ClusterService } from "../mock-sdk";
import type {
  GetResourceUsageRequest,
  GetResourceUsageResponse
} from "../mock-sdk";

const clusterParamsSchema = z.object({
  clusterId: z.string(),
  locale: z.string().optional()
});

const metricValueSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional()
});

type ClusterParams = z.infer<typeof clusterParamsSchema>;
type MetricValueData = z.infer<typeof metricValueSchema>;

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
    compatibleWidgets: ["MetricValue"],
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
  })
});
