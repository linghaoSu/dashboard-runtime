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
import type { FunnelChartData, FunnelChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<FunnelChartData, FunnelChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const palette = createEchartsPalette(runtimeProps.theme);
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
    series: [
      {
        type: "funnel",
        left: "8%",
        top: 12,
        bottom: 12,
        width: "84%",
        sort: runtimeProps.props.sort ?? "descending",
        label: {
          color: textStyle.color
        },
        data: runtimeProps.data
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
