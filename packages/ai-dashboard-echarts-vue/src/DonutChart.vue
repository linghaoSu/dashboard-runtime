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
import type { DonutChartData, DonutChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<DonutChartData, DonutChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const palette = createEchartsPalette(runtimeProps.theme, runtimeProps.props.palette);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);
  const seriesData = runtimeProps.data.map((item, index) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color ?? palette[index % palette.length]
    }
  }));

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
      orient: "vertical",
      right: 0,
      top: "middle",
      width: "36%",
      textStyle,
      formatter: (name: string) => {
        const item = runtimeProps.data.find((entry) => entry.name === name);
        return item
          ? `${name}  ${formatWithUnit(
              item.value,
              runtimeProps.props.unit,
              formatNumber
            )}`
          : name;
      }
    },
    series: [
      {
        type: "pie",
        radius: [
          runtimeProps.props.innerRadius ?? "52%",
          runtimeProps.props.outerRadius ?? "76%"
        ],
        center: [(runtimeProps.props.showLegend ?? true) ? "34%" : "50%", "50%"],
        avoidLabelOverlap: true,
        label: {
          color: textStyle.color,
          formatter: "{b}"
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: "bold"
          }
        },
        data: seriesData
      }
    ]
  };
});

function handleClick(params: { data?: unknown; name?: string }) {
  runtimeProps.emit?.({
    trigger: "clickItem",
    sourceWidgetId: runtimeProps.id,
    payload: {
      name: params.name,
      data: params.data
    }
  });
}
</script>

<template>
  <EchartsContainer
    :option="option"
    :init-options="initOptions"
    @click="handleClick"
  />
</template>
