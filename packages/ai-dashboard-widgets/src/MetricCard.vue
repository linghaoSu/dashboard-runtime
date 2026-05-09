<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { MetricCardData, MetricCardProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<MetricCardData, MetricCardProps>>();

const precision = computed(() => runtimeProps.props.precision ?? 1);
const unit = computed(() => runtimeProps.props.unit ?? runtimeProps.data.unit ?? "");
const valueText = computed(() =>
  runtimeProps.format.number(runtimeProps.data.value, {
    maximumFractionDigits: precision.value,
    minimumFractionDigits: precision.value
  })
);
const trendText = computed(() => {
  if (runtimeProps.data.trend === undefined) {
    return "";
  }

  const sign = runtimeProps.data.trend > 0 ? "+" : "";
  return `${sign}${runtimeProps.format.percent(runtimeProps.data.trend)}`;
});
const className = computed(() => [
  "dao-metric-card",
  `dao-metric-card--${runtimeProps.data.status ?? "normal"}`
]);
</script>

<template>
  <div :class="className">
    <div class="dao-metric-card__label">{{ data.label }}</div>
    <div class="dao-metric-card__value">
      <span>{{ valueText }}</span>
      <small v-if="unit">{{ unit }}</small>
    </div>
    <div v-if="trendText" class="dao-metric-card__trend">{{ trendText }}</div>
  </div>
</template>

<style scoped>
.dao-metric-card {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.dao-metric-card__label {
  overflow: hidden;
  color: #94a3b8;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-metric-card__value {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 6px;
  color: #f8fafc;
}

.dao-metric-card__value span {
  overflow: hidden;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-metric-card__value small,
.dao-metric-card__trend {
  color: #cbd5e1;
  font-size: 13px;
}

.dao-metric-card--success .dao-metric-card__value {
  color: #86efac;
}

.dao-metric-card--warning .dao-metric-card__value {
  color: #fcd34d;
}

.dao-metric-card--danger .dao-metric-card__value {
  color: #fca5a5;
}
</style>
