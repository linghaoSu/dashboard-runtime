import {
  createFormatters,
  type WidgetRuntimeProps
} from "@dao-style-viz/ai-dashboard-runtime";
import { shallowMount } from "@vue/test-utils";
import { defineComponent, h, type Component } from "vue";
import { describe, expect, it } from "vitest";
import AreaChart from "../AreaChart.vue";
import BarChart from "../BarChart.vue";
import FunnelChart from "../FunnelChart.vue";
import GaugeChart from "../GaugeChart.vue";
import HeatmapChart from "../HeatmapChart.vue";
import MapChart from "../MapChart.vue";
import PieChart from "../PieChart.vue";
import RadarChart from "../RadarChart.vue";
import ScatterChart from "../ScatterChart.vue";
import { echartsWidgetRegistry } from "../echarts-widgets.js";

type SeriesOption = {
  type?: string;
  areaStyle?: unknown;
  colorBy?: string;
  data?: unknown[];
  progress?: {
    itemStyle?: {
      color?: string;
    };
  };
};

type ChartOption = {
  color?: string[];
  series?: SeriesOption[];
  radar?: {
    indicator?: unknown[];
  };
  visualMap?: {
    inRange?: {
      color?: string[];
    };
  };
};

const baseRuntime = {
  title: "Chart",
  theme: {
    name: "test"
  },
  locale: "en-US",
  timezone: "UTC",
  t: (key: string) => key,
  format: createFormatters("en-US", "UTC"),
  loading: false,
  error: null,
  width: 420,
  height: 260
};

describe("echartsWidgetRegistry", () => {
  it("exports all Stage 6 chart definitions", () => {
    expect(Object.keys(echartsWidgetRegistry).sort()).toEqual([
      "AreaChart",
      "BarChart",
      "DonutChart",
      "FunnelChart",
      "GaugeChart",
      "HeatmapChart",
      "LineChart",
      "MapChart",
      "PieChart",
      "RadarChart",
      "ScatterChart"
    ]);
  });
});

describe("Stage 6 chart options", () => {
  it.each([
    [
      "BarChart",
      BarChart,
      [
        { name: "prod", value: 91 },
        { name: "staging", value: 66 }
      ],
      { xField: "name", yField: "value" },
      "bar"
    ],
    [
      "AreaChart",
      AreaChart,
      [
        { time: "10:00", value: 120 },
        { time: "10:05", value: 180 }
      ],
      { xField: "time", yField: "value" },
      "line"
    ],
    [
      "PieChart",
      PieChart,
      [
        { name: "Running", value: 42 },
        { name: "Pending", value: 3 }
      ],
      {},
      "pie"
    ],
    [
      "HeatmapChart",
      HeatmapChart,
      [
        { x: "Mon", y: "00:00", value: 12 },
        { x: "Mon", y: "01:00", value: 18 }
      ],
      {},
      "heatmap"
    ],
    [
      "ScatterChart",
      ScatterChart,
      [
        { x: 42, y: 68, size: 10 },
        { x: 75, y: 82, size: 18 }
      ],
      { xField: "x", yField: "y", sizeField: "size" },
      "scatter"
    ],
    [
      "FunnelChart",
      FunnelChart,
      [
        { name: "Received", value: 1000 },
        { name: "Scheduled", value: 920 }
      ],
      {},
      "funnel"
    ],
    [
      "MapChart",
      MapChart,
      [
        { name: "Shanghai", longitude: 121.47, latitude: 31.23, value: 12 },
        { name: "Beijing", longitude: 116.4, latitude: 39.9, value: 8 }
      ],
      {},
      "scatter"
    ]
  ])("builds a %s ECharts series", (_name, component, data, props, type) => {
    const option = mountChart(component, data, props);

    expect(option.series?.[0]?.type).toBe(type);
  });

  it("builds filled area chart options", () => {
    const option = mountChart(
      AreaChart,
      [
        { time: "10:00", value: 120 },
        { time: "10:05", value: 180 }
      ],
      { xField: "time", yField: "value" }
    );

    expect(option.series?.[0]?.areaStyle).toEqual({});
  });

  it("builds radar indicators and heatmap visual mapping", () => {
    const radarOption = mountChart(
      RadarChart,
      [
        { name: "CPU", value: 72, max: 100 },
        { name: "Memory", value: 64, max: 100 }
      ],
      {}
    );
    const heatmapOption = mountChart(
      HeatmapChart,
      [
        { x: "Mon", y: "00:00", value: 12 },
        { x: "Mon", y: "01:00", value: 18 }
      ],
      {}
    );

    expect(radarOption.radar?.indicator).toHaveLength(2);
    expect(heatmapOption.visualMap).toBeDefined();
  });

  it("uses global chart palettes and lets chart props override them", () => {
    const data = [
      { name: "prod", value: 91 },
      { name: "staging", value: 66 }
    ];
    const globalOption = mountChart(
      BarChart,
      data,
      { xField: "name", yField: "value" },
      {
        theme: {
          name: "test",
          palette: ["#111827", "#22c55e"]
        }
      }
    );
    const overrideOption = mountChart(
      BarChart,
      data,
      {
        xField: "name",
        yField: "value",
        palette: ["#0ea5e9", "#8b5cf6"]
      },
      {
        theme: {
          name: "test",
          palette: ["#111827", "#22c55e"]
        }
      }
    );

    expect(globalOption.color).toEqual(["#111827", "#22c55e"]);
    expect(overrideOption.color).toEqual(["#0ea5e9", "#8b5cf6"]);
    expect(globalOption.series?.[0]?.colorBy).toBe("data");
  });

  it("does not emit undefined heatmap colors when a short palette is provided", () => {
    const option = mountChart(
      HeatmapChart,
      [
        { x: "Mon", y: "00:00", value: 12 },
        { x: "Mon", y: "01:00", value: 18 }
      ],
      {
        palette: ["#0ea5e9"]
      }
    );

    expect(option.visualMap?.inRange?.color).toEqual([
      "#0ea5e9",
      "#0ea5e9",
      "#0ea5e9"
    ]);
  });

  it("keeps gauge semantic success color unless the gauge has an explicit palette", () => {
    const globalOption = mountChart(
      GaugeChart,
      {
        label: "CPU",
        value: 42
      },
      {},
      {
        theme: {
          name: "test",
          colors: {
            success: "#16a34a"
          },
          palette: ["#111827"]
        }
      }
    );
    const overrideOption = mountChart(
      GaugeChart,
      {
        label: "CPU",
        value: 42
      },
      {
        palette: ["#0ea5e9"]
      },
      {
        theme: {
          name: "test",
          colors: {
            success: "#16a34a"
          },
          palette: ["#111827"]
        }
      }
    );

    expect(globalOption.series?.[0]?.progress?.itemStyle?.color).toBe("#16a34a");
    expect(overrideOption.series?.[0]?.progress?.itemStyle?.color).toBe("#0ea5e9");
  });
});

function mountChart(
  component: Component,
  data: unknown,
  props: Record<string, unknown>,
  runtimeOverrides: Record<string, unknown> = {}
): ChartOption {
  let option: ChartOption | undefined;
  const EchartsContainerStub = defineComponent({
    name: "EchartsContainer",
    props: {
      option: {
        type: Object,
        required: true
      }
    },
    setup(childProps) {
      option = childProps.option as ChartOption;
      return () => h("div", { class: "echarts-stub" });
    }
  });

  shallowMount(component, {
    props: {
      ...runtimeProps("chart", data, props),
      ...runtimeOverrides
    },
    global: {
      stubs: {
        EchartsContainer: EchartsContainerStub
      }
    }
  });

  if (!option) {
    throw new Error("Expected EchartsContainer option to be captured");
  }

  return option;
}

function runtimeProps<TData, TProps>(
  id: string,
  data: TData,
  props: TProps
): WidgetRuntimeProps<TData, TProps> {
  return {
    ...baseRuntime,
    id,
    data,
    props
  };
}
