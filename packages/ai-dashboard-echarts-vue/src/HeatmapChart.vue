<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import EchartsContainer from "./EchartsContainer.vue";
import {
  createEchartsAxisStyle,
  createEchartsInitOptions,
  createEchartsPalette,
  createEchartsTextStyle
} from "./echarts-adapter.js";
import { formatWithUnit } from "./option-utils.js";
import "./register-echarts.js";
import type { HeatmapChartData, HeatmapChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<HeatmapChartData, HeatmapChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const xValues = [...new Set(runtimeProps.data.map((item) => item.x))];
  const yValues = [...new Set(runtimeProps.data.map((item) => item.y))];
  const values = runtimeProps.data.map((item) => item.value);
  const min = runtimeProps.props.min ?? Math.min(...values, 0);
  const max = runtimeProps.props.max ?? Math.max(...values, 1);
  const palette = createEchartsPalette(runtimeProps.theme);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const axisStyle = createEchartsAxisStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);

  return {
    backgroundColor: "transparent",
    textStyle,
    tooltip: {
      valueFormatter: (value: unknown) =>
        formatWithUnit(value, runtimeProps.props.unit, formatNumber)
    },
    grid: {
      left: 56,
      right: 20,
      top: 20,
      bottom: 48
    },
    xAxis: {
      type: "category",
      data: xValues,
      ...axisStyle
    },
    yAxis: {
      type: "category",
      data: yValues,
      ...axisStyle
    },
    visualMap: {
      min,
      max,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      textStyle,
      inRange: {
        color: [palette[0], palette[2], palette[3]]
      }
    },
    series: [
      {
        type: "heatmap",
        data: runtimeProps.data.map((item) => [
          xValues.indexOf(item.x),
          yValues.indexOf(item.y),
          item.value
        ])
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
