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
import { formatWithUnit, readDimension, readMetric } from "./option-utils.js";
import "./register-echarts.js";
import type { ScatterChartData, ScatterChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<ScatterChartData, ScatterChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const xField = runtimeProps.props.xField ?? "x";
  const yField = runtimeProps.props.yField ?? "y";
  const seriesField = runtimeProps.props.seriesField;
  const sizeField = runtimeProps.props.sizeField;
  const palette = createEchartsPalette(runtimeProps.theme);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const axisStyle = createEchartsAxisStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);
  const names = seriesField
    ? [...new Set(runtimeProps.data.map((item) => readDimension(item, seriesField)))]
    : [runtimeProps.title ?? runtimeProps.t("chart.scatter.series.default")];
  const series = names.map((name) => ({
    name,
    type: "scatter",
    symbolSize: (point: unknown[]) =>
      sizeField && typeof point[2] === "number"
        ? Math.max(6, Math.min(28, point[2]))
        : 10,
    data: runtimeProps.data
      .filter((item) => !seriesField || readDimension(item, seriesField) === name)
      .map((item) => [
        readMetric(item, xField),
        readMetric(item, yField),
        sizeField ? readMetric(item, sizeField) : undefined
      ])
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
      show: (runtimeProps.props.showLegend ?? true) && series.length > 1,
      top: 0,
      textStyle
    },
    grid: {
      left: 42,
      right: 24,
      top: series.length > 1 ? 34 : 12,
      bottom: 34,
      containLabel: true
    },
    xAxis: {
      type: "value",
      ...axisStyle
    },
    yAxis: {
      type: "value",
      ...axisStyle
    },
    series
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
