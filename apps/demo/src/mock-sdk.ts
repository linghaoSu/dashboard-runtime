export type GetResourceUsageRequest = {
  clusterId: string;
  locale?: string;
};

export type GetResourceUsageResponse = {
  cpuUsage: number;
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
}
