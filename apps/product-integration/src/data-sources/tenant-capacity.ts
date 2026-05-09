import {
  createSdkDataSource,
  defineDataSources
} from "@dao-style-viz/ai-dashboard-runtime";
import {
  alarmListDataSchema,
  filterBarDataSchema,
  metricCardDataSchema,
  panelDataSchema
} from "@dao-style-viz/ai-dashboard-widgets";
import { barChartDataSchema } from "@dao-style-viz/ai-dashboard-echarts-vue";
import { z } from "zod";
import {
  TenantCapacityService,
  type GetSloStatusNoteRequest,
  type GetSloStatusNoteResponse,
  type GetTenantCapacityOverviewRequest,
  type GetTenantCapacityOverviewResponse,
  type ListNamespaceOptionsRequest,
  type ListNamespaceOptionsResponse,
  type ListNamespaceUsageRequest,
  type ListNamespaceUsageResponse,
  type ListTenantAlertsRequest,
  type ListTenantAlertsResponse
} from "../product-sdk/generated/tenant-capacity";

const tenantWorkspaceParamsSchema = z.object({
  tenantId: z.string(),
  workspaceId: z.string()
});

const namespaceUsageParamsSchema = tenantWorkspaceParamsSchema.extend({
  namespace: z.string()
});

const localizedTenantParamsSchema = tenantWorkspaceParamsSchema.extend({
  locale: z.string().optional()
});

type NamespaceUsageParams = z.infer<typeof namespaceUsageParamsSchema>;
type LocalizedTenantParams = z.infer<typeof localizedTenantParamsSchema>;
type MetricCardOutput = z.infer<typeof metricCardDataSchema>;
type BarChartOutput = z.infer<typeof barChartDataSchema>;
type AlarmListOutput = z.infer<typeof alarmListDataSchema>;
type FilterBarOutput = z.infer<typeof filterBarDataSchema>;
type PanelOutput = z.infer<typeof panelDataSchema>;

export const tenantCapacityDataSources = defineDataSources({
  "tenant.capacity.cpu": createSdkDataSource<
    LocalizedTenantParams,
    GetTenantCapacityOverviewRequest,
    GetTenantCapacityOverviewResponse,
    MetricCardOutput
  >({
    name: "Tenant CPU Capacity",
    description: "Current CPU allocation and usage for a tenant workspace",
    category: "tenant-capacity",
    paramsSchema: localizedTenantParamsSchema,
    outputSchema: metricCardDataSchema,
    compatibleWidgets: ["MetricCard"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          locale: "en-US"
        },
        output: {
          label: "CPU Used",
          value: 56.8,
          unit: "%",
          trend: 0.043,
          status: "warning"
        }
      }
    ],
    request: (params) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId
    }),
    call: (request) => TenantCapacityService.GetTenantCapacityOverview(request),
    transform: (response, ctx) => ({
      label:
        (ctx.params.locale ?? ctx.runtime.locale) === "zh-CN"
          ? "CPU 已用"
          : "CPU Used",
      value: (response.cpuUsedCores / response.cpuTotalCores) * 100,
      unit: "%",
      trend: 0.043,
      status:
        response.cpuUsedCores / response.cpuTotalCores > 0.75
          ? "warning"
          : "success"
    })
  }),
  "tenant.capacity.memory": createSdkDataSource<
    LocalizedTenantParams,
    GetTenantCapacityOverviewRequest,
    GetTenantCapacityOverviewResponse,
    MetricCardOutput
  >({
    name: "Tenant Memory Capacity",
    description: "Current memory allocation and usage for a tenant workspace",
    category: "tenant-capacity",
    paramsSchema: localizedTenantParamsSchema,
    outputSchema: metricCardDataSchema,
    compatibleWidgets: ["MetricCard"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          locale: "en-US"
        },
        output: {
          label: "Memory Used",
          value: 62,
          unit: "%",
          trend: -0.012,
          status: "success"
        }
      }
    ],
    request: (params) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId
    }),
    call: (request) => TenantCapacityService.GetTenantCapacityOverview(request),
    transform: (response, ctx) => ({
      label:
        (ctx.params.locale ?? ctx.runtime.locale) === "zh-CN"
          ? "内存已用"
          : "Memory Used",
      value: (response.memoryUsedGiB / response.memoryTotalGiB) * 100,
      unit: "%",
      trend: -0.012,
      status:
        response.memoryUsedGiB / response.memoryTotalGiB > 0.75
          ? "warning"
          : "success"
    })
  }),
  "tenant.capacity.namespaceOptions": createSdkDataSource<
    NamespaceUsageParams,
    ListNamespaceOptionsRequest,
    ListNamespaceOptionsResponse,
    FilterBarOutput
  >({
    name: "Namespace Options",
    description: "Localized namespace filter options for a tenant workspace",
    category: "tenant-capacity",
    paramsSchema: namespaceUsageParamsSchema,
    outputSchema: filterBarDataSchema,
    compatibleWidgets: ["FilterBar"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          namespace: "all"
        },
        output: [
          { label: "All", value: "all", active: true },
          { label: "frontend", value: "frontend" }
        ]
      }
    ],
    request: (params, ctx) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
      namespace: params.namespace,
      locale: ctx.runtime.locale
    }),
    call: (request) => TenantCapacityService.ListNamespaceOptions(request),
    transform: (response) => response.options
  }),
  "tenant.capacity.namespaceUsage": createSdkDataSource<
    NamespaceUsageParams,
    ListNamespaceUsageRequest,
    ListNamespaceUsageResponse,
    BarChartOutput
  >({
    name: "Namespace Usage",
    description: "CPU usage by namespace in a tenant workspace",
    category: "tenant-capacity",
    paramsSchema: namespaceUsageParamsSchema,
    outputSchema: barChartDataSchema,
    compatibleWidgets: ["BarChart"],
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          namespace: "all"
        },
        output: [
          { namespace: "frontend", value: 16.2 },
          { namespace: "backend", value: 22.8 }
        ]
      }
    ],
    request: (params) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
      namespace: params.namespace
    }),
    call: (request) => TenantCapacityService.ListNamespaceUsage(request),
    transform: (response) =>
      response.records.map((record) => ({
        namespace: record.namespace,
        value: record.cpuCores,
        memoryGiB: record.memoryGiB
      }))
  }),
  "tenant.capacity.sloNote": createSdkDataSource<
    LocalizedTenantParams,
    GetSloStatusNoteRequest,
    GetSloStatusNoteResponse,
    PanelOutput
  >({
    name: "Tenant SLO Note",
    description: "Localized SLO note for the tenant capacity dashboard",
    category: "tenant-capacity",
    paramsSchema: localizedTenantParamsSchema,
    outputSchema: panelDataSchema,
    compatibleWidgets: ["Panel"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          locale: "en-US"
        },
        output: {
          subtitle: "platform-observability",
          content: "Capacity requests are within the tenant safety envelope."
        }
      }
    ],
    request: (params, ctx) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
      locale: params.locale ?? ctx.runtime.locale
    }),
    call: (request) => TenantCapacityService.GetSloStatusNote(request),
    transform: (response) => response
  }),
  "tenant.capacity.alerts": createSdkDataSource<
    LocalizedTenantParams,
    ListTenantAlertsRequest,
    ListTenantAlertsResponse,
    AlarmListOutput
  >({
    name: "Tenant Alerts",
    description: "Active operational alerts for a tenant workspace",
    category: "tenant-capacity",
    paramsSchema: localizedTenantParamsSchema,
    outputSchema: alarmListDataSchema,
    compatibleWidgets: ["AlarmList"],
    dependsOnLocale: true,
    examples: [
      {
        params: {
          tenantId: "tenant-alpha",
          workspaceId: "prod",
          locale: "en-US"
        },
        output: [
          {
            id: "alert-1",
            title: "Backend CPU pressure",
            severity: "warning",
            time: "10:24"
          }
        ]
      }
    ],
    request: (params, ctx) => ({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
      locale: params.locale ?? ctx.runtime.locale
    }),
    call: (request) => TenantCapacityService.ListTenantAlerts(request),
    transform: (response) => response.alerts
  })
});
