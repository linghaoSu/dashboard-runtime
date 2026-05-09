<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import type { IpavoClusterCountData } from "./schemas";

defineProps<WidgetRuntimeProps<IpavoClusterCountData, Record<string, never>>>();
</script>

<template>
  <div class="ipavo-clusters">
    <div class="ipavo-clusters__summary">
      <div>
        <strong>{{ data.clusters.length }}</strong>
        <span>{{ t("dashboard.ipavo.label.cluster") }}</span>
      </div>
      <div class="ipavo-clusters__divider" />
      <div>
        <strong>{{ data.nodes }}</strong>
        <span>{{ t("dashboard.ipavo.label.node") }}</span>
      </div>
    </div>
    <div class="ipavo-clusters__list">
      <div v-for="cluster in data.clusters" :key="cluster.name" class="ipavo-clusters__item">
        <div class="ipavo-clusters__provider">{{ cluster.provider.slice(0, 1) }}</div>
        <div class="ipavo-clusters__name">{{ cluster.name }}</div>
        <div class="ipavo-clusters__features">
          <span v-for="feature in cluster.features.slice(0, 3)" :key="feature">
            {{ feature.slice(0, 2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-clusters {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.ipavo-clusters__summary {
  display: grid;
  min-height: 72px;
  align-items: center;
  grid-template-columns: 1fr 1px 1fr;
}

.ipavo-clusters__summary div:not(.ipavo-clusters__divider) {
  display: grid;
  justify-items: center;
  gap: 6px;
}

.ipavo-clusters__summary strong {
  color: #252b33;
  font-size: 26px;
  line-height: 1;
}

.ipavo-clusters__summary span {
  color: #7d8794;
  font-size: 12px;
}

.ipavo-clusters__divider {
  height: 70px;
  background: #edf0f5;
}

.ipavo-clusters__list {
  display: grid;
  gap: 4px;
}

.ipavo-clusters__item {
  display: grid;
  min-width: 0;
  height: 38px;
  align-items: center;
  border-radius: 4px;
  background: #eef2f7;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  padding: 0 12px;
}

.ipavo-clusters__provider {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: #3778ff;
  color: white;
  font-size: 11px;
  font-weight: 800;
}

.ipavo-clusters__name {
  overflow: hidden;
  color: #26394f;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ipavo-clusters__features {
  display: flex;
  gap: 10px;
}

.ipavo-clusters__features span {
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  color: #1c7ed6;
  font-size: 11px;
  font-weight: 700;
}
</style>
