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
import type { BarChartData, BarChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<BarChartData, BarChartProps>>();

const initOptions = computed(() =>
  createEchartsInitOptions(runtimeProps.locale)
);

const option = computed(() => {
  const xField = runtimeProps.props.xField ?? "name";
  const yField = runtimeProps.props.yField ?? "value";
  const seriesField = runtimeProps.props.seriesField;
  const categories = [
    ...new Set(runtimeProps.data.map((item) => readDimension(item, xField)))
  ];
  const palette = createEchartsPalette(runtimeProps.theme);
  const textStyle = createEchartsTextStyle(runtimeProps.theme);
  const axisStyle = createEchartsAxisStyle(runtimeProps.theme);
  const formatNumber = (value: number) => runtimeProps.format.number(value);
  const buildSeries = (name: string, values: number[]) => ({
    name,
    type: "bar",
    stack: (runtimeProps.props.stack ?? false) ? "total" : undefined,
    data: values
  });
  const series = seriesField
    ? Array.from(
        new Set(runtimeProps.data.map((item) => readDimension(item, seriesField)))
      ).map((seriesName) =>
        buildSeries(
          seriesName,
          categories.map((category) => {
            const point = runtimeProps.data.find(
              (item) =>
                readDimension(item, xField) === category &&
                readDimension(item, seriesField) === seriesName
            );
            return point ? readMetric(point, yField) : 0;
          })
        )
      )
    : [
        buildSeries(
          runtimeProps.title ?? runtimeProps.t("chart.bar.series.default"),
          runtimeProps.data.map((item) => readMetric(item, yField))
        )
      ];
  const horizontal = runtimeProps.props.orientation === "horizontal";

  return {
    backgroundColor: "transparent",
    color: palette,
    textStyle,
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: unknown) =>
        formatWithUnit(value, runtimeProps.props.unit, formatNumber)
    },
    legend: {
      show: (runtimeProps.props.showLegend ?? true) && series.length > 1,
      top: 0,
      textStyle
    },
    grid: {
      left: horizontal ? 88 : 36,
      right: 24,
      top: series.length > 1 ? 34 : 12,
      bottom: 28,
      containLabel: true
    },
    xAxis: {
      type: horizontal ? "value" : "category",
      data: horizontal ? undefined : categories,
      ...axisStyle
    },
    yAxis: {
      type: horizontal ? "category" : "value",
      data: horizontal ? categories : undefined,
      ...axisStyle
    },
    series
  };
});
</script>

<template>
  <EchartsContainer :option="option" :init-options="initOptions" />
</template>
