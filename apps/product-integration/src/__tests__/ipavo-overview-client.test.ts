import { afterEach, describe, expect, it, vi } from "vitest";
import {
  displayType,
  readIpavoDataMode,
  selectIpavoOverviewClient
} from "../product-sdk/ipavo-overview-client";

describe("ipavo overview client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the mock fixture client by default", async () => {
    const client = selectIpavoOverviewClient("mock");

    await expect(client.GetResourceSummary({})).resolves.toMatchObject({
      clusterCount: { healthy: 2, total: 2 }
    });
  });

  it("uses the real generated SDK through relative /apis requests in live mode", async () => {
    const controller = new AbortController();
    const responses = new Map<string, unknown>([
      [
        "/apis/ipavo.io/v1alpha1/resource/summary?",
        {
          clusterCount: { healthy: 1, total: 1 },
          nodeCount: { healthy: 3, total: 3 },
          podCount: { healthy: 21, total: 24 },
          clusterItems: [
            {
              name: "live-cluster",
              provider: "GENERIC",
              clusterFeatures: ["cilium"]
            }
          ]
        }
      ],
      [
        "/apis/ipavo.io/v1alpha1/resource/pods?type=BY_CLUSTER",
        {
          items: [
            {
              cluster: "live-cluster",
              podCount: { healthy: 21, total: 24 }
            }
          ]
        }
      ],
      [
        "/apis/ipavo.io/v1alpha1/resource/usage?",
        {
          cpu: {
            usage: 7.5,
            total: 64,
            history: [{ timestamp: "1715163600", value: "7.5" }]
          }
        }
      ],
      [
        "/apis/ipavo.io/v1alpha1/alert/summary?",
        {
          alertCount: { critical: 1, warning: 2, info: 3 },
          alertMessages: ["live-alert"]
        }
      ],
      [
        "/apis/ipavo.io/v1alpha1/products?",
        {
          items: [
            {
              id: "GHIPPO",
              title: "Global Management",
              status: true,
              features: ["KARMADA"]
            }
          ]
        }
      ]
    ]);
    const fetchMock = vi.fn(async (url: string) => {
      const body = responses.get(url);
      if (!body) {
        throw new Error(`Unexpected live ipavo request: ${url}`);
      }

      return {
        ok: true,
        json: async () => body
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = selectIpavoOverviewClient("live");
    const requestInit = { signal: controller.signal };

    await expect(
      client.GetResourceSummary({}, requestInit)
    ).resolves.toMatchObject({
      clusterCount: { healthy: 1, total: 1 },
      clusterItems: [
        {
          name: "live-cluster",
          provider: "GENERIC",
          clusterFeatures: ["cilium"]
        }
      ]
    });
    await expect(
      client.GetPodSummary({ type: displayType.BY_CLUSTER }, requestInit)
    ).resolves.toMatchObject({
      items: [{ cluster: "live-cluster", podCount: { healthy: 21, total: 24 } }]
    });
    await expect(
      client.GetResourceUsage({}, requestInit)
    ).resolves.toMatchObject({
      cpu: { usage: 7.5, total: 64 }
    });
    await expect(
      client.GetAlertSummary({}, requestInit)
    ).resolves.toMatchObject({
      alertCount: { critical: 1, warning: 2, info: 3 },
      alertMessages: ["live-alert"]
    });
    await expect(client.ListProducts({}, requestInit)).resolves.toMatchObject({
      items: [
        {
          id: "GHIPPO",
          title: "Global Management",
          status: true,
          features: ["KARMADA"]
        }
      ]
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/apis/ipavo.io/v1alpha1/resource/summary?",
      { signal: controller.signal, method: "GET" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/apis/ipavo.io/v1alpha1/resource/pods?type=BY_CLUSTER",
      { signal: controller.signal, method: "GET" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/apis/ipavo.io/v1alpha1/resource/usage?",
      { signal: controller.signal, method: "GET" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/apis/ipavo.io/v1alpha1/alert/summary?",
      { signal: controller.signal, method: "GET" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/apis/ipavo.io/v1alpha1/products?",
      { signal: controller.signal, method: "GET" }
    );
  });

  it("validates the browser-side live data mode flag", () => {
    expect(readIpavoDataMode({})).toBe("mock");
    expect(readIpavoDataMode({ VITE_PRODUCT_IPAVO_DATA_MODE: "live" })).toBe(
      "live"
    );
    expect(() =>
      readIpavoDataMode({
        VITE_PRODUCT_IPAVO_DATA_MODE: "preview"
      } as unknown as ImportMetaEnv)
    ).toThrow("VITE_PRODUCT_IPAVO_DATA_MODE");
  });
});
