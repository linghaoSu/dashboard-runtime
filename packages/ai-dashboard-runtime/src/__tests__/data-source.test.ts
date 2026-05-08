import { z } from "zod";
import { describe, expect, it } from "vitest";
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
});
