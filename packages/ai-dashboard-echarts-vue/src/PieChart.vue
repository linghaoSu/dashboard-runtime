<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import EchartsContainer from "./EchartsContainer.vue";
import {
  createEchartsInitOptions,
  createEchartsPalette,
  createEchartsTextStyle
} from "./echarts-adapter.js";
import { formatWithUnit } from "./option-utils.js";
import "./register-echarts.js";
import type { PieChartData, PieChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<PieChartData, PieChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const palette = createEchartsPalette(runtimeProps.theme, runtimeProps.props.palette);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);

  return {
    backgroundColor: "transparent",
    color: palette,
    textStyle,
    tooltip: {
      trigger: "item",
      valueFormatter: (value: unknown) =>
        formatWithUnit(value, runtimeProps.props.unit, formatNumber)
    },
    legend: {
      show: runtimeProps.props.showLegend ?? true,
      bottom: 0,
      textStyle
    },
    series: [
      {
        type: "pie",
        radius: runtimeProps.props.radius ?? "70%",
        center: ["50%", (runtimeProps.props.showLegend ?? true) ? "42%" : "50%"],
        data: runtimeProps.data
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
