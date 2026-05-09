<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import type { IpavoPodStatisticsData } from "./schemas";

const statusClass = {
  healthy: "ipavo-pods__cell--healthy",
  warning: "ipavo-pods__cell--warning",
  critical: "ipavo-pods__cell--critical",
  unknown: "ipavo-pods__cell--unknown"
};

defineProps<WidgetRuntimeProps<IpavoPodStatisticsData, Record<string, never>>>();
</script>

<template>
  <div class="ipavo-pods">
    <div class="ipavo-pods__map">
      <div class="ipavo-pods__cells">
        <span
          v-for="cell in data.cells"
          :key="cell.id"
          class="ipavo-pods__cell"
          :class="statusClass[cell.status]"
          :title="cell.label"
        />
      </div>
      <div class="ipavo-pods__legend">
        <div v-for="item in data.legend" :key="item.label">
          <span :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="ipavo-pods__summary">
      <div>
        <span>{{ t("dashboard.ipavo.label.pods") }}</span>
        <strong>{{ data.totalPods }}</strong>
      </div>
      <div class="ipavo-pods__summary-item ipavo-pods__summary-item--running">
        <span>{{ t("dashboard.ipavo.label.running") }}</span>
        <strong>{{ data.runningPods }}</strong>
      </div>
      <div class="ipavo-pods__summary-item ipavo-pods__summary-item--other">
        <span>{{ t("dashboard.ipavo.label.other") }}</span>
        <strong>{{ data.otherPods }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-pods {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.ipavo-pods__map {
  display: grid;
  flex: 1 1 auto;
  align-content: center;
  justify-items: center;
  background: #f6f8fb;
  gap: 28px;
}

.ipavo-pods__cells {
  display: grid;
  max-width: 240px;
  grid-template-columns: repeat(9, 14px);
  gap: 6px 5px;
}

.ipavo-pods__cell {
  width: 14px;
  height: 12px;
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
}

.ipavo-pods__cell--healthy {
  background: #32d475;
}

.ipavo-pods__cell--warning {
  background: #ffcc5a;
}

.ipavo-pods__cell--critical {
  background: #ff6b6b;
}

.ipavo-pods__cell--unknown {
  background: #c9ced6;
}

.ipavo-pods__legend {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 7px 18px;
  color: #919aa7;
  font-size: 12px;
}

.ipavo-pods__legend div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ipavo-pods__legend span {
  width: 8px;
  height: 8px;
}

.ipavo-pods__summary {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 20px;
  padding-top: 12px;
}

.ipavo-pods__summary div {
  min-width: 0;
}

.ipavo-pods__summary span {
  display: block;
  color: #6b7280;
  font-size: 12px;
}

.ipavo-pods__summary strong {
  display: block;
  color: #111827;
  font-size: 24px;
  line-height: 1.1;
}

.ipavo-pods__summary-item {
  border-left: 2px solid #cbd5e1;
  padding-left: 10px;
}

.ipavo-pods__summary-item--running {
  border-left-color: #32d475;
}

.ipavo-pods__summary-item--other {
  border-left-color: #ffcc5a;
}
</style>
