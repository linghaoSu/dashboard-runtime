<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { StatusBadgeData, StatusBadgeProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<StatusBadgeData, StatusBadgeProps>>();

const className = computed(() => [
  "dao-status-badge",
  `dao-status-badge--${runtimeProps.data.status}`
]);
</script>

<template>
  <div :class="className">
    <span class="dao-status-badge__dot" />
    <span class="dao-status-badge__label">{{ data.label }}</span>
    <span v-if="data.description" class="dao-status-badge__description">
      {{ data.description }}
    </span>
  </div>
</template>

<style scoped>
.dao-status-badge {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
  font-size: 14px;
}

.dao-status-badge__dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #94a3b8;
}

.dao-status-badge--success .dao-status-badge__dot {
  background: #22c55e;
}

.dao-status-badge--warning .dao-status-badge__dot {
  background: #f59e0b;
}

.dao-status-badge--danger .dao-status-badge__dot {
  background: #ef4444;
}

.dao-status-badge__label,
.dao-status-badge__description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-status-badge__description {
  color: #94a3b8;
}
</style>
