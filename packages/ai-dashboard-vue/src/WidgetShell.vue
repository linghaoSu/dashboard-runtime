<script setup lang="ts">
import type { WidgetLayout } from "@dao-style-viz/ai-dashboard-schema";
import type { DashboardTheme } from "@dao-style-viz/ai-dashboard-runtime";
import { computed, type CSSProperties } from "vue";

const props = defineProps<{
  title?: string;
  layout: WidgetLayout;
  theme?: DashboardTheme;
  loading?: boolean;
  empty?: boolean;
  error?: Error | null;
  emptyText?: string;
  errorText?: string;
}>();

const shellStyle = computed<CSSProperties>(() => ({
  left: `${props.layout.x}px`,
  top: `${props.layout.y}px`,
  width: `${props.layout.w}px`,
  height: `${props.layout.h}px`,
  zIndex: props.layout.zIndex ?? 1,
  "--dao-widget-shell-bg":
    props.theme?.colors?.widgetBackground ?? "rgb(15 23 42 / 72%)",
  "--dao-widget-shell-border":
    props.theme?.colors?.widgetBorder ?? "rgb(148 163 184 / 24%)",
  "--dao-widget-shell-shadow": props.theme?.colors?.widgetShadow ?? "none",
  "--dao-widget-shell-text": props.theme?.colors?.text ?? "#e5e7eb",
  "--dao-widget-shell-header": props.theme?.colors?.heading ?? props.theme?.colors?.text ?? "#e5e7eb",
  "--dao-widget-shell-state": props.theme?.colors?.muted ?? "#cbd5e1",
  "--dao-widget-shell-error": props.theme?.colors?.danger ?? "#fca5a5"
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
  border: 1px solid var(--dao-widget-shell-border);
  border-radius: 8px;
  background: var(--dao-widget-shell-bg);
  box-shadow: var(--dao-widget-shell-shadow);
  color: var(--dao-widget-shell-text);
}

.dao-widget-shell__header {
  flex: 0 0 auto;
  padding: 10px 12px 6px;
  color: var(--dao-widget-shell-header);
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
  color: var(--dao-widget-shell-state);
  font-size: 14px;
}

.dao-widget-shell__state--error {
  color: var(--dao-widget-shell-error);
}
</style>
