<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { FilterBarData, FilterBarProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<FilterBarData, FilterBarProps>>();

const options = computed(() =>
  runtimeProps.data ?? runtimeProps.props.options ?? []
);

function selectOption(option: NonNullable<FilterBarData>[number]) {
  runtimeProps.emit?.({
    trigger: runtimeProps.props.trigger ?? "change",
    sourceWidgetId: runtimeProps.id,
    payload: {
      label: option.label,
      value: option.value
    }
  });
}
</script>

<template>
  <div class="dao-filter-bar">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      :class="['dao-filter-bar__option', { 'dao-filter-bar__option--active': option.active }]"
      @click="selectOption(option)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.dao-filter-bar {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.dao-filter-bar__option {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 32%);
  border-radius: 6px;
  background: rgb(15 23 42 / 64%);
  color: #cbd5e1;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-filter-bar__option--active {
  border-color: #38bdf8;
  background: rgb(14 165 233 / 18%);
  color: #e0f2fe;
}
</style>
