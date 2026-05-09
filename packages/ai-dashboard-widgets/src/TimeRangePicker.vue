<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { TimeRangePickerData, TimeRangePickerProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<TimeRangePickerData, TimeRangePickerProps>>();

const options = computed(() =>
  runtimeProps.data ?? runtimeProps.props.options ?? []
);

function selectOption(option: NonNullable<TimeRangePickerData>[number]) {
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
  <div class="dao-time-range-picker">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      :class="[
        'dao-time-range-picker__option',
        { 'dao-time-range-picker__option--active': option.active }
      ]"
      @click="selectOption(option)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.dao-time-range-picker {
  display: inline-flex;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 28%);
  border-radius: 7px;
}

.dao-time-range-picker__option {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-right: 1px solid rgb(148 163 184 / 22%);
  background: rgb(15 23 42 / 64%);
  color: #cbd5e1;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-time-range-picker__option:last-child {
  border-right: 0;
}

.dao-time-range-picker__option--active {
  background: rgb(14 165 233 / 20%);
  color: #e0f2fe;
}
</style>
