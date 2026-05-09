import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import {
  createSdkDataSource,
  defineDataSources,
  defineWidget
} from "@dao-style-viz/ai-dashboard-runtime";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createDataSourceCatalog } from "../create-data-source-catalog.js";
import { createWidgetCatalog } from "../create-widget-catalog.js";
import { validateDashboardConfig } from "../validate-dashboard-config.js";

const paramsSchema = z.object({
  clusterId: z.string()
});

const metricDataSchema = z.object({
  label: z.string(),
  value: z.number()
});

const metricPropsSchema = z.object({
  precision: z.number().int().nonnegative().default(1)
});

const dataSources = defineDataSources({
  "cluster.cpuUsage": createSdkDataSource({
    name: "CPU Usage",
    description: "Current CPU usage",
    category: "cluster",
    paramsSchema,
    outputSchema: metricDataSchema,
    compatibleWidgets: ["MetricValue"],
    examples: [
      {
        params: {
          clusterId: "demo-cluster"
        },
        output: {
          label: "CPU Usage",
          value: 72.5
        }
      }
    ],
    request: (params) => params,
    call: async () => ({
      cpuUsage: 72.5
    }),
    transform: (response) => ({
      label: "CPU Usage",
      value: response.cpuUsage
    })
  })
});

const widgets = {
  MetricValue: defineWidget({
    type: "MetricValue",
    name: "Metric Value",
    category: "metric",
    framework: "vue",
    component: () => null,
    dataSchema: metricDataSchema,
    propsSchema: metricPropsSchema,
    examples: [
      {
        title: "CPU Usage",
        data: {
          label: "CPU Usage",
          value: 72.5
        },
        props: {
          precision: 1
        }
      }
    ]
  })
};

const validConfig: DashboardConfig = {
  version: "1.0.0",
  meta: {
    name: {
      key: "dashboard.cluster.name",
      defaultMessage: "Cluster"
    }
  },
  canvas: {
    width: 960,
    height: 540,
    scaleMode: "fit",
    theme: "dao-dark"
  },
  context: {
    clusterId: "demo-cluster"
  },
  widgets: [
    {
      id: "cpu",
      type: "MetricValue",
      title: {
        key: "dashboard.cluster.widget.cpu.title",
        defaultMessage: "CPU Usage"
      },
      layout: {
        x: 16,
        y: 16,
        w: 280,
        h: 160
      },
      data: {
        source: "cluster.cpuUsage",
        params: {
          clusterId: {
            $ref: "context.clusterId"
          }
        },
        refresh: {
          type: "interval",
          intervalMs: 5000
        },
        fallback: {
          emptyText: {
            key: "dashboard.cluster.state.empty",
            defaultMessage: "No data"
          }
        }
      },
      props: {
        precision: 1
      }
    }
  ]
};

describe("catalog creators", () => {
  it("exports dataSource metadata without query implementation", () => {
    const catalog = createDataSourceCatalog(dataSources);
    const serialized = JSON.stringify(catalog);

    expect(catalog[0]?.key).toBe("cluster.cpuUsage");
    expect(serialized).not.toContain("query");
    expect(serialized).not.toContain("function");
    expect(catalog[0]?.paramsSchema).toMatchObject({
      kind: "object"
    });
  });

  it("exports widget metadata without component implementation", () => {
    const catalog = createWidgetCatalog(widgets);
    const serialized = JSON.stringify(catalog);

    expect(catalog[0]?.type).toBe("MetricValue");
    expect(serialized).not.toContain("component");
    expect(serialized).not.toContain("function");
    expect(catalog[0]?.propsSchema).toMatchObject({
      kind: "object"
    });
  });
});

describe("validateDashboardConfig", () => {
  it("accepts a catalog-compatible dashboard config", () => {
    expect(
      validateDashboardConfig(validConfig, {
        dataSources,
        widgets
      })
    ).toMatchObject({
      success: true
    });
  });

  it("rejects AI output that bypasses catalog and config gates", () => {
    const baseWidget = validConfig.widgets[0];
    if (!baseWidget?.data) {
      throw new Error("Expected fixture widget with data binding");
    }

    const invalidConfig: DashboardConfig = {
      ...validConfig,
      meta: {
        name: "Cluster"
      },
      widgets: [
        {
          ...baseWidget,
          type: "UnknownWidget",
          title: "CPU Usage",
          layout: {
            x: 900,
            y: 16,
            w: 280,
            h: 160
          },
          data: {
            ...baseWidget.data,
            source: "cluster.unknown",
            refresh: {
              type: "interval",
              intervalMs: 1000
            }
          },
          props: {
            precision: -1
          }
        }
      ]
    };

    const result = validateDashboardConfig(invalidConfig, {
      dataSources,
      widgets
    });

    expect(result.success).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing_i18n_key",
        "unknown_widget",
        "unknown_data_source",
        "layout_overflow",
        "refresh_interval_too_low"
      ])
    );
  });
});
