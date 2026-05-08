import { describe, expect, it } from "vitest";
import { clusterOverviewDashboard } from "../__fixtures__/cluster-overview.js";
import { dashboardConfigSchema } from "../dashboard-config.js";

describe("dashboardConfigSchema", () => {
  it("accepts the cluster overview dashboard fixture", () => {
    expect(dashboardConfigSchema.safeParse(clusterOverviewDashboard).success).toBe(
      true
    );
  });

  it("rejects a config without canvas settings", () => {
    const invalidConfig: unknown = {
      ...clusterOverviewDashboard,
      canvas: undefined
    };

    expect(dashboardConfigSchema.safeParse(invalidConfig).success).toBe(false);
  });

  it("rejects widget layouts without positive size", () => {
    const invalidConfig: unknown = {
      ...clusterOverviewDashboard,
      widgets: [
        {
          ...clusterOverviewDashboard.widgets[0],
          layout: { x: 0, y: 0, w: 0, h: 220 }
        }
      ]
    };

    expect(dashboardConfigSchema.safeParse(invalidConfig).success).toBe(false);
  });

  it("rejects executable values in widget props", () => {
    const invalidConfig: unknown = {
      ...clusterOverviewDashboard,
      widgets: [
        {
          ...clusterOverviewDashboard.widgets[0],
          props: {
            formatter: () => "unsafe"
          }
        }
      ]
    };

    expect(dashboardConfigSchema.safeParse(invalidConfig).success).toBe(false);
  });

  it("rejects malformed config refs", () => {
    const invalidConfig: unknown = {
      ...clusterOverviewDashboard,
      context: {
        clusterId: {
          $ref: "route.query.clusterId",
          fallback: "demo-cluster"
        }
      }
    };

    expect(dashboardConfigSchema.safeParse(invalidConfig).success).toBe(false);
  });
});
