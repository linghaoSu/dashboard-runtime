export type EmptyRequest = Record<string, never>;
export type empty = EmptyRequest;

export enum displayType {
  BY_NAMESPACE = "BY_NAMESPACE",
  BY_CLUSTER = "BY_CLUSTER",
  BY_POD = "BY_POD"
}

export type CountSummary = {
  healthy?: number;
  total?: number;
};

export type ClusterInfo = {
  name?: string;
  provider?: string;
  clusterFeatures?: string[];
  features?: string[];
};

export type GetResourceSummaryResponse = {
  clusterCount?: CountSummary;
  nodeCount?: CountSummary;
  podCount?: CountSummary;
  threshold?: number;
  namespaceCount?: number;
  clusterItems?: ClusterInfo[];
};

export type SamplePair = {
  timestamp?: string;
  value?: string;
};

export type ResourceUsage = {
  usage?: number;
  total?: number;
  history?: SamplePair[];
};

export type GetResourceUsageRequest = EmptyRequest;

export type GetResourceUsageResponse = {
  thresholds?: number[];
  cpu?: ResourceUsage;
  memory?: ResourceUsage;
  pod?: ResourceUsage;
  disk?: ResourceUsage;
};

export type GetAlertSummaryResponse = {
  alertCount?: Record<string, number>;
  alertMessages?: string[];
};

export type product = {
  id?: string;
  title?: string;
  status?: boolean;
  features?: string[];
};

export type ListProductsResponse = {
  items?: product[];
};

export type GetPodSummaryRequest = {
  type?: displayType;
};

export type summaryInstance = {
  cluster?: string;
  namespace?: string;
  pod?: string;
  podCount?: CountSummary;
};

export type GetPodSummaryResponse = {
  items?: summaryInstance[];
};

const nowSeconds = 1_715_163_600;

const cpuHistory = [
  9.2, 5.1, 10.8, 11.6, 8.2, 8.7, 9.9, 9.5, 9.1, 10.1, 9.5, 7.9, 8.4, 11.7,
  10.1, 7.5, 7.7, 10.9, 13.3, 10.4, 8.0, 11.2, 10.8, 12.0, 5.8, 4.4, 2.9,
  6.2, 11.1, 10.2
];

const memoryHistory = [
  42, 43, 51, 44, 53, 31, 50, 47, 22, 49, 46, 50, 55, 36, 45, 69, 55, 35, 47,
  42, 52, 41, 54, 38, 39, 67, 32, 36, 24, 34, 59, 56
];

function history(values: number[]): SamplePair[] {
  return values.map((value, index) => ({
    timestamp: String(nowSeconds + index * 120),
    value: String(value)
  }));
}

export class IPavo {
  static async GetResourceSummary(
    request: EmptyRequest
  ): Promise<GetResourceSummaryResponse> {
    void request;

    return {
      clusterCount: { healthy: 2, total: 2 },
      nodeCount: { healthy: 8, total: 8 },
      podCount: { healthy: 241, total: 278 },
      threshold: 0.8,
      clusterItems: [
        {
          name: "minquan-dev",
          provider: "k",
          clusterFeatures: ["ds", "is", "more"]
        },
        {
          name: "kpanda-global-cluster",
          provider: "c",
          clusterFeatures: ["ds", "sp", "more"]
        }
      ]
    };
  }

  static async GetResourceUsage(
    request: GetResourceUsageRequest
  ): Promise<GetResourceUsageResponse> {
    void request;

    return {
      thresholds: [0.6, 0.8],
      cpu: { usage: 12.275, total: 88, history: history(cpuHistory) },
      memory: {
        usage: 48.2 * 1024 ** 3,
        total: 172.04 * 1024 ** 3,
        history: history(memoryHistory.map((value) => value * 1024 ** 3))
      },
      pod: { usage: 278, total: 970, history: [] },
      disk: {
        usage: 325.81 * 1024 ** 3,
        total: 1.43 * 1024 ** 4,
        history: []
      }
    };
  }

  static async GetAlertSummary(
    request: EmptyRequest
  ): Promise<GetAlertSummaryResponse> {
    void request;

    return {
      alertCount: {
        critical: 20,
        warning: 128,
        info: 7
      },
      alertMessages: [
        "2026-05-08T07:41:36 etcdGRPCRequestsSlow: etcd cluster istio-system/ms...",
        "2026-05-08T07:16:36 CPUThrottlingHigh: 51.57% throttling of CPU in names...",
        "2026-05-08T07:36:36 KubeDeploymentReplicasMismatch: Deployment defaul...",
        "2026-05-08T07:16:36 CPUThrottlingHigh: 60.56% throttling of CPU in names...",
        "2026-05-08T07:16:36 CPUThrottlingHigh: 64.29% throttling of CPU in names..."
      ]
    };
  }

  static async ListProducts(request: EmptyRequest): Promise<ListProductsResponse> {
    void request;

    return {
      items: [
        { id: "container", title: "容器管理", features: ["kp", "tm", "sp"] },
        { id: "observability", title: "可观测性", features: ["in", "tr", "al", "..."] },
        { id: "global", title: "全局管理", features: [] }
      ]
    };
  }

  static async GetPodSummary(
    request: GetPodSummaryRequest
  ): Promise<GetPodSummaryResponse> {
    void request;

    return {
      items: [
        { cluster: "minquan-dev", podCount: { healthy: 96, total: 110 } },
        { cluster: "kpanda-global-cluster", podCount: { healthy: 145, total: 168 } }
      ]
    };
  }
}
