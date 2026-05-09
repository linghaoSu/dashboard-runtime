<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { AlarmListData, AlarmListProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<AlarmListData, AlarmListProps>>();

const items = computed(() =>
  runtimeProps.data.slice(0, runtimeProps.props.maxItems ?? 10)
);

function timeText(value: string | number | undefined): string {
  if (value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return runtimeProps.format.date(value, {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return value;
}
</script>

<template>
  <ul class="dao-alarm-list">
    <li
      v-for="item in items"
      :key="item.id"
      :class="['dao-alarm-list__item', `dao-alarm-list__item--${item.severity}`]"
    >
      <span class="dao-alarm-list__marker" />
      <span class="dao-alarm-list__content">
        <strong>{{ item.title }}</strong>
        <small v-if="item.description">{{ item.description }}</small>
      </span>
      <time v-if="timeText(item.time)">{{ timeText(item.time) }}</time>
    </li>
  </ul>
</template>

<style scoped>
.dao-alarm-list {
  display: grid;
  width: 100%;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dao-alarm-list__item {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) max-content;
  align-items: center;
  gap: 10px;
  color: #e5e7eb;
}

.dao-alarm-list__marker {
  width: 8px;
  height: 32px;
  border-radius: 999px;
  background: #94a3b8;
}

.dao-alarm-list__item--success .dao-alarm-list__marker {
  background: #22c55e;
}

.dao-alarm-list__item--warning .dao-alarm-list__marker {
  background: #f59e0b;
}

.dao-alarm-list__item--danger .dao-alarm-list__marker {
  background: #ef4444;
}

.dao-alarm-list__content {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.dao-alarm-list__content strong,
.dao-alarm-list__content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-alarm-list__content small,
.dao-alarm-list time {
  color: #94a3b8;
  font-size: 12px;
}
</style>
