<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";

type MetricValueData = {
  label: string;
  value: number;
  unit?: string;
};

type MetricValueProps = {
  precision?: number;
};

const runtimeProps =
  defineProps<WidgetRuntimeProps<MetricValueData, MetricValueProps>>();

const formattedValue = computed(() =>
  runtimeProps.format.number(runtimeProps.data.value, {
    maximumFractionDigits: runtimeProps.props.precision ?? 1,
    minimumFractionDigits: runtimeProps.props.precision ?? 1
  })
);
</script>

<template>
  <div class="metric-value">
    <div class="metric-value__label">{{ data.label }}</div>
    <div class="metric-value__number">
      {{ formattedValue }}<span v-if="data.unit">{{ data.unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.metric-value {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.metric-value__label {
  color: #94a3b8;
  font-size: 14px;
}

.metric-value__number {
  color: #f8fafc;
  font-size: 46px;
  font-weight: 700;
  line-height: 1;
}

.metric-value__number span {
  margin-left: 4px;
  color: #38bdf8;
  font-size: 20px;
}
</style>
