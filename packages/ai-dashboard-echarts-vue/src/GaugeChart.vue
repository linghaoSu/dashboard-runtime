<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import EchartsContainer from "./EchartsContainer.vue";
import {
  createEchartsInitOptions,
  createEchartsTextStyle
} from "./echarts-adapter.js";
import { formatWithUnit } from "./option-utils.js";
import "./register-echarts.js";
import type { GaugeChartData, GaugeChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<GaugeChartData, GaugeChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const unit = computed(() => runtimeProps.props.unit ?? runtimeProps.data.unit);

const gaugeColor = computed(() => {
  const { value } = runtimeProps.data;
  const { dangerThreshold, warningThreshold } = runtimeProps.props;

  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    return runtimeProps.theme.colors?.danger ?? "#ef4444";
  }

  if (warningThreshold !== undefined && value >= warningThreshold) {
    return runtimeProps.theme.colors?.warning ?? "#f59e0b";
  }

  return runtimeProps.props.palette?.[0] ?? runtimeProps.theme.colors?.success ?? "#22c55e";
});

const option = computed(() => {
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const precision = runtimeProps.props.precision ?? 1;
  const formatNumber = (value: number) =>
    runtimeProps.format.number(value, {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision
    });

  return {
    backgroundColor: "transparent",
    tooltip: {
      valueFormatter: (value: unknown) =>
        formatWithUnit(value, unit.value, formatNumber)
    },
    series: [
      {
        type: "gauge",
        min: runtimeProps.props.min ?? 0,
        max: runtimeProps.props.max ?? 100,
        radius: "92%",
        center: ["50%", "58%"],
        progress: {
          show: true,
          width: 14,
          itemStyle: {
            color: gaugeColor.value
          }
        },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [[1, "rgba(148, 163, 184, 0.18)"]]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          length: 8,
          lineStyle: {
            color: "rgba(203, 213, 225, 0.45)"
          }
        },
        axisLabel: {
          color: textStyle.color,
          fontSize: 10
        },
        pointer: {
          width: 4,
          itemStyle: {
            color: gaugeColor.value
          }
        },
        title: {
          offsetCenter: [0, "58%"],
          color: textStyle.color,
          fontSize: 13
        },
        detail: {
          offsetCenter: [0, "28%"],
          color: gaugeColor.value,
          fontSize: 28,
          fontWeight: 700,
          formatter: (value: number) => formatWithUnit(value, unit.value, formatNumber)
        },
        data: [
          {
            value: runtimeProps.data.value,
            name: runtimeProps.data.label
          }
        ]
      }
    ]
  };
});
</script>

<template>
  <EchartsContainer
    :option="option"
    :init-options="initOptions"
  />
</template>
