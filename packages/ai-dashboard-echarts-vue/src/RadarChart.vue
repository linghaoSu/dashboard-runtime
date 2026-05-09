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
import type { RadarChartData, RadarChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<RadarChartData, RadarChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const palette = createEchartsPalette(runtimeProps.theme, runtimeProps.props.palette);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const maxValue =
    runtimeProps.props.max ??
    Math.max(...runtimeProps.data.map((item) => item.max ?? item.value), 1);
  const formatNumber = (value: number) => runtimeProps.format.number(value);

  return {
    backgroundColor: "transparent",
    color: palette,
    textStyle,
    tooltip: {
      valueFormatter: (value: unknown) =>
        formatWithUnit(value, runtimeProps.props.unit, formatNumber)
    },
    radar: {
      radius: "68%",
      indicator: runtimeProps.data.map((item) => ({
        name: item.name,
        max: item.max ?? maxValue
      })),
      axisName: textStyle,
      splitLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.24)"
        }
      },
      splitArea: {
        areaStyle: {
          color: ["rgba(15, 23, 42, 0.18)", "rgba(30, 41, 59, 0.18)"]
        }
      }
    },
    series: [
      {
        type: "radar",
        areaStyle: {
          opacity: 0.18
        },
        data: [
          {
            name: runtimeProps.title,
            value: runtimeProps.data.map((item) => item.value)
          }
        ]
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
