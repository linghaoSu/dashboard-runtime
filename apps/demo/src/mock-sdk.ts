export type GetResourceUsageRequest = {
  clusterId: string;
  locale?: string;
};

export type GetResourceUsageResponse = {
  cpuUsage: number;
};

export type GetCpuTrendRequest = {
  clusterId: string;
};

export type CpuTrendPoint = {
  time: string;
  value: number;
};

export type GetCpuTrendResponse = {
  points: CpuTrendPoint[];
};

export type ListPodStatusRequest = {
  clusterId: string;
  locale?: string;
};

export type PodStatusItem = {
  name: string;
  value: number;
};

export type ListPodStatusResponse = {
  items: PodStatusItem[];
};

export class ClusterService {
  static async GetResourceUsage(
    request: GetResourceUsageRequest
  ): Promise<GetResourceUsageResponse> {
    await new Promise((resolve) => window.setTimeout(resolve, 120));

    return {
      cpuUsage: request.clusterId === "demo-cluster" ? 72.5 : 0
    };
  }

  static async GetCpuTrend(
    request: GetCpuTrendRequest
  ): Promise<GetCpuTrendResponse> {
    await new Promise((resolve) => window.setTimeout(resolve, 120));

    return {
      points:
        request.clusterId === "demo-cluster"
          ? [
              { time: "10:00", value: 62 },
              { time: "10:05", value: 66 },
              { time: "10:10", value: 71 },
              { time: "10:15", value: 69 },
              { time: "10:20", value: 74 },
              { time: "10:25", value: 72.5 }
            ]
          : []
    };
  }

  static async ListPodStatus(
    request: ListPodStatusRequest
  ): Promise<ListPodStatusResponse> {
    await new Promise((resolve) => window.setTimeout(resolve, 120));

    if (request.clusterId !== "demo-cluster") {
      return {
        items: []
      };
    }

    const zhCN = request.locale === "zh-CN";

    return {
      items: [
        { name: zhCN ? "运行中" : "Running", value: 42 },
        { name: zhCN ? "等待中" : "Pending", value: 3 },
        { name: zhCN ? "失败" : "Failed", value: 1 }
      ]
    };
  }
}
