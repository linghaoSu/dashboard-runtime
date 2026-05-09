export type GetTenantCapacityOverviewRequest = {
  tenantId: string;
  workspaceId: string;
};

export type GetTenantCapacityOverviewResponse = {
  cpuUsedCores: number;
  cpuTotalCores: number;
  memoryUsedGiB: number;
  memoryTotalGiB: number;
};

export type ListNamespaceUsageRequest = {
  tenantId: string;
  workspaceId: string;
  namespace: string;
};

export type ListNamespaceOptionsRequest = {
  tenantId: string;
  workspaceId: string;
  namespace: string;
  locale?: string;
};

export type NamespaceOptionRecord = {
  label: string;
  value: string;
  active?: boolean;
};

export type ListNamespaceOptionsResponse = {
  options: NamespaceOptionRecord[];
};

export type NamespaceUsageRecord = {
  namespace: string;
  cpuCores: number;
  memoryGiB: number;
};

export type ListNamespaceUsageResponse = {
  records: NamespaceUsageRecord[];
};

export type ListTenantAlertsRequest = {
  tenantId: string;
  workspaceId: string;
  locale?: string;
};

export type TenantAlertRecord = {
  id: string;
  title: string;
  severity: "normal" | "success" | "warning" | "danger";
  time: string;
  description?: string;
};

export type ListTenantAlertsResponse = {
  alerts: TenantAlertRecord[];
};

export type GetSloStatusNoteRequest = {
  tenantId: string;
  workspaceId: string;
  locale?: string;
};

export type GetSloStatusNoteResponse = {
  subtitle: string;
  content: string;
};

const namespaceUsage: NamespaceUsageRecord[] = [
  { namespace: "frontend", cpuCores: 16.2, memoryGiB: 72 },
  { namespace: "backend", cpuCores: 22.8, memoryGiB: 96 },
  { namespace: "jobs", cpuCores: 9.4, memoryGiB: 42 },
  { namespace: "observability", cpuCores: 6.1, memoryGiB: 28 }
];

export class TenantCapacityService {
  static async GetTenantCapacityOverview(
    request: GetTenantCapacityOverviewRequest
  ): Promise<GetTenantCapacityOverviewResponse> {
    validateTenantRequest(request);

    return {
      cpuUsedCores: 54.5,
      cpuTotalCores: 96,
      memoryUsedGiB: 238,
      memoryTotalGiB: 384
    };
  }

  static async ListNamespaceUsage(
    request: ListNamespaceUsageRequest
  ): Promise<ListNamespaceUsageResponse> {
    validateTenantRequest(request);

    return {
      records:
        request.namespace === "all"
          ? namespaceUsage
          : namespaceUsage.filter(
              (record) => record.namespace === request.namespace
            )
    };
  }

  static async ListNamespaceOptions(
    request: ListNamespaceOptionsRequest
  ): Promise<ListNamespaceOptionsResponse> {
    validateTenantRequest(request);
    const zhCN = request.locale === "zh-CN";
    const selectedNamespace = request.namespace || "all";

    return {
      options: [
        { label: zhCN ? "全部" : "All", value: "all" },
        ...namespaceUsage.map((record) => ({
          label: record.namespace,
          value: record.namespace
        }))
      ].map((option) => ({
        ...option,
        active: option.value === selectedNamespace
      }))
    };
  }

  static async ListTenantAlerts(
    request: ListTenantAlertsRequest
  ): Promise<ListTenantAlertsResponse> {
    validateTenantRequest(request);
    const zhCN = request.locale === "zh-CN";

    return {
      alerts: [
        {
          id: "alert-1",
          title: zhCN ? "后端 CPU 压力" : "Backend CPU pressure",
          severity: "warning",
          time: "10:24",
          description: zhCN
            ? "backend 命名空间超过 80% 请求阈值"
            : "backend namespace is above the 80% request threshold"
        },
        {
          id: "alert-2",
          title: zhCN ? "批处理延迟恢复" : "Batch latency recovered",
          severity: "success",
          time: "09:58"
        }
      ]
    };
  }

  static async GetSloStatusNote(
    request: GetSloStatusNoteRequest
  ): Promise<GetSloStatusNoteResponse> {
    validateTenantRequest(request);
    const zhCN = request.locale === "zh-CN";

    return {
      subtitle: "platform-observability",
      content: zhCN
        ? "容量请求处于租户安全边界内。"
        : "Capacity requests are within the tenant safety envelope."
    };
  }
}

function validateTenantRequest(request: {
  tenantId: string;
  workspaceId: string;
}) {
  if (request.tenantId !== "tenant-alpha" || request.workspaceId !== "prod") {
    throw new Error("Unknown tenant workspace");
  }
}
