import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import { describe, expect, it } from "vitest";
import { createRuntimeContext } from "../runtime-context.js";

const baseConfig: DashboardConfig = {
  version: "1.0.0",
  canvas: {
    width: 960,
    height: 540,
    scaleMode: "fit",
    theme: "default"
  },
  widgets: []
};

describe("createRuntimeContext", () => {
  it("resolves context refs through other context keys before widgets query", () => {
    expect(
      createRuntimeContext(
        {
          ...baseConfig,
          context: {
            cluster: {
              id: "cluster-1"
            },
            clusterId: {
              $ref: "context.cluster.id"
            }
          }
        },
        {
          locale: "en-US"
        }
      ).context
    ).toEqual({
      cluster: {
        id: "cluster-1"
      },
      clusterId: "cluster-1"
    });
  });

  it("fails context ref cycles before widgets query", () => {
    expect(() =>
      createRuntimeContext(
        {
          ...baseConfig,
          context: {
            a: {
              $ref: "context.b"
            },
            b: {
              $ref: "context.a"
            }
          }
        },
        {
          locale: "en-US"
        }
      )
    ).toThrow("Ref cycle detected: context.a -> context.b -> context.a");
  });

  it("rejects globalFilters refs that point back into config state", () => {
    expect(() =>
      createRuntimeContext(
        {
          ...baseConfig,
          globalFilters: {
            clusterId: {
              $ref: "context.clusterId"
            }
          },
          context: {
            clusterId: "cluster-1"
          }
        },
        {
          locale: "en-US"
        }
      )
    ).toThrow("globalFilters cannot reference context");
  });
});
