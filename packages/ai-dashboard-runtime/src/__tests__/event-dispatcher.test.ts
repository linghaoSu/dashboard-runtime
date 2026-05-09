import type { WidgetConfig } from "@dao-style-viz/ai-dashboard-schema";
import { describe, expect, it } from "vitest";
import { dispatchWidgetEvent } from "../event-dispatcher.js";
import type { RuntimeContext } from "../renderer-adapter.js";

const runtime: RuntimeContext = {
  locale: "en-US",
  context: {
    filterKey: "clusterId"
  },
  globalFilters: {
    currentClusterId: "cluster-1"
  }
};

describe("dispatchWidgetEvent", () => {
  it("resolves event payload refs for setFilter events", () => {
    const widget: WidgetConfig = {
      id: "filter",
      type: "FilterBar",
      layout: { x: 0, y: 0, w: 100, h: 40 },
      events: [
        {
          trigger: "change",
          action: "setFilter",
          payload: {
            key: { $ref: "context.filterKey" },
            value: { $ref: "event.payload.value" }
          }
        }
      ]
    };

    expect(
      dispatchWidgetEvent(
        widget,
        {
          trigger: "change",
          sourceWidgetId: "filter",
          payload: {
            value: "cluster-2"
          }
        },
        runtime
      )
    ).toEqual([
      {
        type: "setFilter",
        sourceWidgetId: "filter",
        payload: {
          key: "clusterId",
          value: "cluster-2"
        }
      }
    ]);
  });

  it("rejects unknown refreshWidget targets when widget ids are provided", () => {
    const widget: WidgetConfig = {
      id: "source",
      type: "ActionButton",
      layout: { x: 0, y: 0, w: 100, h: 40 },
      events: [
        {
          trigger: "refresh",
          action: "refreshWidget",
          target: "missing-widget"
        }
      ]
    };

    expect(() =>
      dispatchWidgetEvent(
        widget,
        {
          trigger: "refresh",
          sourceWidgetId: "source"
        },
        runtime,
        {
          knownWidgetIds: ["source", "target"]
        }
      )
    ).toThrow("refreshWidget target not found: missing-widget");
  });
});
