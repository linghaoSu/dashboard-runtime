<script setup lang="ts">
import type { WidgetLayout } from "@dao-style-viz/ai-dashboard-schema";
import { computed } from "vue";

const props = defineProps<{
  title?: string;
  layout: WidgetLayout;
  loading?: boolean;
  empty?: boolean;
  error?: Error | null;
  emptyText?: string;
  errorText?: string;
}>();

const shellStyle = computed(() => ({
  left: `${props.layout.x}px`,
  top: `${props.layout.y}px`,
  width: `${props.layout.w}px`,
  height: `${props.layout.h}px`,
  zIndex: props.layout.zIndex ?? 1
}));
</script>

<template>
  <section class="dao-widget-shell" :style="shellStyle">
    <header v-if="title" class="dao-widget-shell__header">
      {{ title }}
    </header>
    <div class="dao-widget-shell__body">
      <div v-if="loading" class="dao-widget-shell__state">Loading</div>
      <div v-else-if="error" class="dao-widget-shell__state dao-widget-shell__state--error">
        {{ errorText || error.message }}
      </div>
      <div v-else-if="empty" class="dao-widget-shell__state">
        {{ emptyText || "No data" }}
      </div>
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.dao-widget-shell {
  position: absolute;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 24%);
  border-radius: 8px;
  background: rgb(15 23 42 / 72%);
  color: #e5e7eb;
}

.dao-widget-shell__header {
  flex: 0 0 auto;
  padding: 10px 12px 6px;
  font-size: 16px;
  font-weight: 600;
}

.dao-widget-shell__body {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: 12px;
}

.dao-widget-shell__state {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #cbd5e1;
  font-size: 14px;
}

.dao-widget-shell__state--error {
  color: #fca5a5;
}
</style>
