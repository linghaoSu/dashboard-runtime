import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { createSdkDataSource } from "../data-source.js";
import type { RuntimeContext } from "../renderer-adapter.js";

const runtime: RuntimeContext = {
  locale: "zh-CN",
  context: {},
  globalFilters: {}
};

describe("createSdkDataSource", () => {
  it("maps params to request, calls SDK method, and validates output", async () => {
    const source = createSdkDataSource({
      name: "CPU Usage",
      paramsSchema: z.object({
        clusterId: z.string()
      }),
      outputSchema: z.object({
        value: z.number(),
        unit: z.string()
      }),
      request: (params) => ({
        id: params.clusterId
      }),
      call: async (request) => ({
        cpuUsage: request.id === "cluster-1" ? 72 : 0
      }),
      transform: (response) => ({
        value: response.cpuUsage,
        unit: "%"
      })
    });

    await expect(
      source.query({
        params: {
          clusterId: "cluster-1"
        },
        runtime
      })
    ).resolves.toEqual({
      value: 72,
      unit: "%"
    });
  });

  it("rejects invalid params before calling the SDK method", async () => {
    const call = vi.fn(async () => ({
      cpuUsage: 72
    }));
    const source = createSdkDataSource({
      name: "CPU Usage",
      paramsSchema: z.object({
        clusterId: z.string()
      }),
      outputSchema: z.object({
        value: z.number()
      }),
      request: (params) => ({
        id: params.clusterId
      }),
      call,
      transform: (response) => ({
        value: response.cpuUsage
      })
    });

    await expect(
      source.query({
        params: {} as { clusterId: string },
        runtime
      })
    ).rejects.toThrow();
    expect(call).not.toHaveBeenCalled();
  });

  it("rejects transformed output that fails the output schema", async () => {
    type Output = {
      value: number;
    };
    const source = createSdkDataSource<
      { clusterId: string },
      { id: string },
      { cpuUsage: string },
      Output
    >({
      name: "CPU Usage",
      paramsSchema: z.object({
        clusterId: z.string()
      }),
      outputSchema: z.object({
        value: z.number()
      }),
      request: (params) => ({
        id: params.clusterId
      }),
      call: async () => ({
        cpuUsage: "bad"
      }),
      transform: (response) =>
        ({
          value: response.cpuUsage
        }) as unknown as Output
    });

    await expect(
      source.query({
        params: {
          clusterId: "cluster-1"
        },
        runtime
      })
    ).rejects.toThrow();
  });
});
