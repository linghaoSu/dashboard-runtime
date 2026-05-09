import {
  createFormatters,
  type WidgetRuntimeProps
} from "@dao-style-viz/ai-dashboard-runtime";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import FilterBar from "../FilterBar.vue";
import Panel from "../Panel.vue";
import TimeRangePicker from "../TimeRangePicker.vue";
import { basicWidgetRegistry } from "../basic-widgets.js";
import type {
  FilterBarData,
  FilterBarProps,
  PanelData,
  PanelProps,
  TimeRangePickerData,
  TimeRangePickerProps
} from "../schemas.js";

const baseRuntime = {
  title: "Widget",
  theme: {
    name: "test"
  },
  locale: "en-US",
  timezone: "UTC",
  t: (key: string) => key,
  format: createFormatters("en-US", "UTC"),
  loading: false,
  error: null,
  width: 320,
  height: 180
};

describe("basicWidgetRegistry", () => {
  it("exports all Stage 6 basic widget definitions", () => {
    expect(Object.keys(basicWidgetRegistry).sort()).toEqual([
      "AlarmList",
      "FilterBar",
      "MetricCard",
      "Panel",
      "RankingList",
      "ScrollTable",
      "StatusBadge",
      "TimeRangePicker"
    ]);
  });
});

describe("data-less basic widgets", () => {
  it("renders Panel content from props when no data binding is present", () => {
    const wrapper = mount(Panel, {
      props: runtimeProps<PanelData, PanelProps>("panel", undefined, {
        tone: "success",
        subtitle: "SLO",
        content: "No availability breach in the current window."
      })
    });

    expect(wrapper.text()).toContain("SLO");
    expect(wrapper.text()).toContain("No availability breach");
  });

  it("emits FilterBar selections from static props options", async () => {
    const emit = vi.fn();
    const wrapper = mount(FilterBar, {
      props: runtimeProps<FilterBarData, FilterBarProps>(
        "cluster-filter",
        undefined,
        {
          trigger: "change",
          options: [
            { label: "Cluster A", value: "cluster-a", active: true },
            { label: "Cluster B", value: "cluster-b" }
          ]
        },
        emit
      )
    });

    await wrapper.findAll("button")[1]?.trigger("click");

    expect(emit).toHaveBeenCalledWith({
      trigger: "change",
      sourceWidgetId: "cluster-filter",
      payload: {
        label: "Cluster B",
        value: "cluster-b"
      }
    });
  });

  it("renders TimeRangePicker options from props without a dataSource", () => {
    const wrapper = mount(TimeRangePicker, {
      props: runtimeProps<TimeRangePickerData, TimeRangePickerProps>(
        "time-range",
        undefined,
        {
          trigger: "change",
          options: [
            { label: "1h", value: "last_1h" },
            { label: "24h", value: "last_24h", active: true }
          ]
        }
      )
    });

    expect(wrapper.findAll("button").map((button) => button.text())).toEqual([
      "1h",
      "24h"
    ]);
  });
});

function runtimeProps<TData, TProps>(
  id: string,
  data: TData,
  props: TProps,
  emit?: WidgetRuntimeProps<TData, TProps>["emit"]
): WidgetRuntimeProps<TData, TProps> {
  return {
    ...baseRuntime,
    id,
    data,
    props,
    emit
  };
}
