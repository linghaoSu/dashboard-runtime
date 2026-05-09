<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import type { IpavoResourceUsageData } from "./schemas";

defineProps<WidgetRuntimeProps<IpavoResourceUsageData, Record<string, never>>>();
</script>

<template>
  <div class="ipavo-usage">
    <div v-for="item in data.items" :key="item.label" class="ipavo-usage__item">
      <div class="ipavo-usage__title">{{ item.label }}</div>
      <div
        class="ipavo-usage__ring"
        :style="{
          background: `conic-gradient(${item.color} ${Math.round(item.percent * 100)}%, #e4e7ed 0)`
        }"
      >
        <div class="ipavo-usage__inner">
          <strong>{{ Math.floor(item.percent * 100) }}%</strong>
          <span>{{ t("dashboard.ipavo.label.used") }}</span>
        </div>
      </div>
      <div class="ipavo-usage__meta">
        <div>{{ t("dashboard.ipavo.label.usedValue") }} {{ item.usedLabel }}</div>
        <div>{{ t("dashboard.ipavo.label.total") }} {{ item.totalLabel }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-usage {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.ipavo-usage__item {
  display: grid;
  align-content: center;
  justify-items: center;
  border-left: 1px solid #edf0f5;
  gap: 24px;
}

.ipavo-usage__item:first-child {
  border-left: 0;
}

.ipavo-usage__title {
  color: #252b33;
  font-size: 14px;
  font-weight: 700;
}

.ipavo-usage__ring {
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  border-radius: 50%;
}

.ipavo-usage__inner {
  display: grid;
  width: 78px;
  height: 78px;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  background: #fff;
  gap: 4px;
}

.ipavo-usage__inner strong {
  color: #303842;
  font-size: 18px;
}

.ipavo-usage__inner span,
.ipavo-usage__meta {
  color: #7d8794;
  font-size: 12px;
}

.ipavo-usage__meta {
  display: grid;
  gap: 8px;
  text-align: center;
}
</style>
