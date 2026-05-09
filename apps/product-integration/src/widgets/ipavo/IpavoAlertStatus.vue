<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { IpavoAlertStatusData } from "./schemas";

const runtimeProps =
  defineProps<WidgetRuntimeProps<IpavoAlertStatusData, { maxMessages?: number }>>();

const visibleMessages = computed(() =>
  runtimeProps.data.messages.slice(0, runtimeProps.props.maxMessages ?? 5)
);
</script>

<template>
  <div class="ipavo-alert">
    <div class="ipavo-alert__counts">
      <div v-for="count in data.counts" :key="count.status" class="ipavo-alert__count">
        <div class="ipavo-alert__dot" :style="{ backgroundColor: count.color }">!</div>
        <div class="ipavo-alert__label">{{ count.label }}</div>
        <div class="ipavo-alert__value" :style="{ color: count.color }">
          {{ count.value }}
        </div>
      </div>
    </div>
    <div class="ipavo-alert__messages">
      <div v-for="message in visibleMessages" :key="message" class="ipavo-alert__message">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-alert {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.ipavo-alert__counts {
  display: grid;
  min-height: 124px;
  grid-template-columns: repeat(3, 1fr);
}

.ipavo-alert__count {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 7px;
}

.ipavo-alert__dot {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.ipavo-alert__label {
  color: #303842;
  font-size: 13px;
}

.ipavo-alert__value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.ipavo-alert__messages {
  min-width: 0;
  border-top: 1px solid #edf0f5;
}

.ipavo-alert__message {
  overflow: hidden;
  border-bottom: 1px solid #edf0f5;
  color: #687485;
  font-size: 12px;
  line-height: 31px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
