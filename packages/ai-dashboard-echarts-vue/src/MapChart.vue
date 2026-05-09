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
import type { MapChartData, MapChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<MapChartData, MapChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const palette = createEchartsPalette(runtimeProps.theme);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const axisStyle = createEchartsAxisStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);

  return {
    backgroundColor: "transparent",
    color: palette,
    textStyle,
    tooltip: {
      trigger: "item",
      formatter: (params: { name?: string; value?: unknown[] }) => {
        const value = Array.isArray(params.value) ? params.value[2] : undefined;
        const formatted =
          typeof value === "number"
            ? formatWithUnit(value, runtimeProps.props.unit, formatNumber)
            : "";
        return [params.name, formatted].filter(Boolean).join(": ");
      }
    },
    grid: {
      left: 48,
      right: 24,
      top: 20,
      bottom: 34,
      containLabel: true
    },
    xAxis: {
      type: "value",
      min: -180,
      max: 180,
      ...axisStyle
    },
    yAxis: {
      type: "value",
      min: -90,
      max: 90,
      ...axisStyle
    },
    series: [
      {
        type: "scatter",
        symbolSize: runtimeProps.props.symbolSize ?? 12,
        data: runtimeProps.data.map((item) => ({
          name: item.name,
          value: [item.longitude, item.latitude, item.value]
        }))
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
