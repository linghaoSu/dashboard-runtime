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
import type { LineChartData, LineChartProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<LineChartData, LineChartProps>>();

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
  const buildLineSeries = (name: string, values: Array<number | null>) => ({
    name,
    type: "line",
    smooth: runtimeProps.props.smooth ?? false,
    showSymbol: false,
    areaStyle: (runtimeProps.props.area ?? false) ? {} : undefined,
    data: values
  });

  const series = seriesField
    ? Array.from(
        new Set(runtimeProps.data.map((item) => readDimension(item, seriesField)))
      ).map((seriesName) =>
        buildLineSeries(
          seriesName,
          categories.map((category) => {
            const point = runtimeProps.data.find(
              (item) =>
                readDimension(item, xField) === category &&
                readDimension(item, seriesField) === seriesName
            );

            return point ? readMetric(point, yField) : null;
          })
        )
      )
    : [
        buildLineSeries(
          runtimeProps.title ?? runtimeProps.t("chart.line.series.default"),
          runtimeProps.data.map((item) => readMetric(item, yField))
        )
      ];

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
      left: 36,
      right: 24,
      top: series.length > 1 ? 34 : 12,
      bottom: 28,
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: categories,
      ...axisStyle
    },
    yAxis: {
      type: "value",
      ...axisStyle
    },
    series
  };
});

function handleClick(params: { data?: unknown; name?: string; seriesName?: string }) {
  runtimeProps.emit?.({
    trigger: "clickItem",
    sourceWidgetId: runtimeProps.id,
    payload: {
      name: params.name,
      seriesName: params.seriesName,
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
