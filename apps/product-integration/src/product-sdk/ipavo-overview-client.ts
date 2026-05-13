import { IPavo as LiveIPavo } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo.pb";
import {
  displayType,
  IPavo as MockIPavo,
  type ClusterInfo,
  type EmptyRequest,
  type GetAlertSummaryResponse,
  type GetPodSummaryRequest,
  type GetPodSummaryResponse,
  type GetResourceSummaryResponse,
  type GetResourceUsageResponse,
  type ListProductsResponse,
  type product
} from "./generated/ipavo-overview";

export { displayType };
export type {
  EmptyRequest,
  GetAlertSummaryResponse,
  GetPodSummaryRequest,
  GetPodSummaryResponse,
  GetResourceSummaryResponse,
  GetResourceUsageResponse,
  ListProductsResponse
};

export type IpavoDataMode = "mock" | "live";

type LiveClusterInfo = {
  name?: string;
  provider?: string;
  clusterFeatures?: string[];
};

type LiveProduct = {
  id?: string;
  title?: string;
  status?: boolean;
  features?: string[];
};

type IpavoOverviewClient = {
  GetResourceSummary: (
    request: EmptyRequest,
    init?: RequestInit
  ) => Promise<GetResourceSummaryResponse>;
  GetResourceUsage: (
    request: EmptyRequest,
    init?: RequestInit
  ) => Promise<GetResourceUsageResponse>;
  GetAlertSummary: (
    request: EmptyRequest,
    init?: RequestInit
  ) => Promise<GetAlertSummaryResponse>;
  ListProducts: (
    request: EmptyRequest,
    init?: RequestInit
  ) => Promise<ListProductsResponse>;
  GetPodSummary: (
    request: GetPodSummaryRequest,
    init?: RequestInit
  ) => Promise<GetPodSummaryResponse>;
};

const liveIpavoOverviewClient: IpavoOverviewClient = {
  async GetResourceSummary(request, init) {
    const response = await LiveIPavo.GetResourceSummary(request, init);

    return {
      ...response,
      clusterItems: response.clusterItems?.map(toClusterInfo)
    };
  },
  GetResourceUsage: (request, init) => LiveIPavo.GetResourceUsage(request, init),
  GetAlertSummary: (request, init) => LiveIPavo.GetAlertSummary(request, init),
  async ListProducts(request, init) {
    const response = await LiveIPavo.ListProducts(request, init);

    return {
      items: response.items?.map(toProduct)
    };
  },
  GetPodSummary: (request, init) =>
    LiveIPavo.GetPodSummary(
      request as Parameters<typeof LiveIPavo.GetPodSummary>[0],
      init
    )
};

export function selectIpavoOverviewClient(
  mode: IpavoDataMode = readIpavoDataMode()
): IpavoOverviewClient {
  return mode === "live" ? liveIpavoOverviewClient : MockIPavo;
}

export function readIpavoDataMode(
  env: Pick<ImportMetaEnv, "VITE_PRODUCT_IPAVO_DATA_MODE"> = import.meta.env
): IpavoDataMode {
  const rawMode = env.VITE_PRODUCT_IPAVO_DATA_MODE?.trim();
  if (!rawMode) {
    return "mock";
  }

  if (rawMode === "mock" || rawMode === "live") {
    return rawMode;
  }

  throw new Error(
    "VITE_PRODUCT_IPAVO_DATA_MODE must be either \"mock\" or \"live\" when configured"
  );
}

export const ipavoDataMode = readIpavoDataMode();
export const IPavo = selectIpavoOverviewClient(ipavoDataMode);

function toClusterInfo(item: LiveClusterInfo): ClusterInfo {
  return {
    name: item.name,
    provider: item.provider,
    clusterFeatures: item.clusterFeatures?.map(String),
    features: item.clusterFeatures?.map(String)
  };
}

function toProduct(item: LiveProduct): product {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    features: item.features?.map(String)
  };
}
