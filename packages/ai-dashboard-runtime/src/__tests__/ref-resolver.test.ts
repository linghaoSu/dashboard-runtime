import { describe, expect, it } from "vitest";
import { resolveRefs } from "../ref-resolver.js";
import type { RefScope } from "../renderer-adapter.js";

const scope: RefScope = {
  runtime: {
    locale: "zh-CN",
    timezone: "Asia/Shanghai",
    route: {
      query: {
        clusterId: "cluster-1"
      }
    },
    user: {
      id: "user-1"
    }
  },
  context: {
    clusterId: "cluster-1"
  },
  globalFilters: {
    timeRange: {
      value: "last_24h"
    }
  }
};

describe("resolveRefs", () => {
  it("resolves nested object and array refs", () => {
    expect(
      resolveRefs(
        {
          clusterId: { $ref: "context.clusterId" },
          locale: { $ref: "runtime.locale" },
          filters: [{ $ref: "globalFilters.timeRange.value" }]
        },
        scope
      )
    ).toEqual({
      clusterId: "cluster-1",
      locale: "zh-CN",
      filters: ["last_24h"]
    });
  });

  it("supports route as a top-level alias", () => {
    expect(resolveRefs({ $ref: "route.query.clusterId" }, scope)).toBe(
      "cluster-1"
    );
  });

  it("throws when a ref cannot be resolved", () => {
    expect(() => resolveRefs({ $ref: "context.missing" }, scope)).toThrow(
      "Ref not found: context.missing"
    );
  });
});
