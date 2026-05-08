import { z } from "zod";
import { describe, expect, it } from "vitest";
import { loadWidgetData } from "../data-loader.js";
import { defineDataSources } from "../data-source.js";
import type { RuntimeContext } from "../renderer-adapter.js";
import { defineWidget } from "../widget-registry.js";

const runtime: RuntimeContext = {
  locale: "zh-CN",
  route: {
    query: {
      clusterId: "cluster-1"
    }
  },
  context: {
    clusterId: "cluster-1"
  },
  globalFilters: {}
};

const widget = {
  id: "cpu",
  type: "MetricValue",
  layout: { x: 0, y: 0, w: 200, h: 120 },
  data: {
    source: "cluster.cpu",
    params: {
      clusterId: { $ref: "context.clusterId" }
    }
  }
};

describe("loadWidgetData", () => {
  it("loads data through a dataSource and validates against widget dataSchema", async () => {
    const dataSources = defineDataSources({
      "cluster.cpu": {
        name: "CPU",
        paramsSchema: z.object({
          clusterId: z.string()
        }),
        outputSchema: z.object({
          value: z.number()
        }),
        query: async () => ({
          value: 88
        })
      }
    });
    const widgets = {
      MetricValue: defineWidget({
        type: "MetricValue",
        name: "Metric Value",
        category: "metric",
        framework: "vue",
        component: {},
        dataSchema: z.object({
          value: z.number()
        }),
        propsSchema: z.object({})
      })
    };

    await expect(
      loadWidgetData(widget, {
        dataSources,
        widgets,
        runtime
      })
    ).resolves.toEqual({
      value: 88
    });
  });

  it("rejects dataSource output that does not match widget dataSchema", async () => {
    const dataSources = defineDataSources({
      "cluster.cpu": {
        name: "CPU",
        paramsSchema: z.object({
          clusterId: z.string()
        }),
        outputSchema: z.object({
          value: z.number()
        }),
        query: async () => ({
          value: 88
        })
      }
    });
    const widgets = {
      MetricValue: defineWidget({
        type: "MetricValue",
        name: "Metric Value",
        category: "metric",
        framework: "vue",
        component: {},
        dataSchema: z.object({
          label: z.string()
        }),
        propsSchema: z.object({})
      })
    };

    await expect(
      loadWidgetData(widget, {
        dataSources,
        widgets,
        runtime
      })
    ).rejects.toThrow();
  });
});
