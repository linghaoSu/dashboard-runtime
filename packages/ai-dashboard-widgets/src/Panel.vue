<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { PanelData, PanelProps } from "./schemas.js";

const runtimeProps = defineProps<WidgetRuntimeProps<PanelData, PanelProps>>();

const className = computed(() => [
  "dao-basic-panel",
  `dao-basic-panel--${runtimeProps.props.tone ?? "normal"}`
]);
const subtitle = computed(() =>
  runtimeProps.data?.subtitle ?? runtimeProps.props.subtitle
);
const content = computed(() =>
  runtimeProps.data?.content ?? runtimeProps.props.content
);
</script>

<template>
  <div :class="className">
    <p v-if="subtitle" class="dao-basic-panel__subtitle">
      {{ subtitle }}
    </p>
    <p v-if="content" class="dao-basic-panel__content">
      {{ content }}
    </p>
  </div>
</template>

<style scoped>
.dao-basic-panel {
  width: 100%;
  min-height: 100%;
  border-left: 3px solid rgb(148 163 184 / 36%);
  padding: 2px 0 2px 12px;
}

.dao-basic-panel--success {
  border-left-color: #22c55e;
}

.dao-basic-panel--warning {
  border-left-color: #f59e0b;
}

.dao-basic-panel--danger {
  border-left-color: #ef4444;
}

.dao-basic-panel__subtitle {
  margin: 0 0 8px;
  color: #94a3b8;
  font-size: 13px;
}

.dao-basic-panel__content {
  margin: 0;
  color: #e5e7eb;
  font-size: 15px;
  line-height: 1.5;
}
</style>
