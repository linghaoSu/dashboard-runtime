<script setup lang="ts">
import type { CanvasConfig } from "@dao-style-viz/ai-dashboard-schema";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

const props = defineProps<{
  canvas: CanvasConfig;
}>();

const containerRef = ref<HTMLElement>();
const containerSize = reactive({
  width: 0,
  height: 0
});

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) {
      return;
    }

    containerSize.width = entry.contentRect.width;
    containerSize.height = entry.contentRect.height;
  });
  resizeObserver.observe(containerRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

const scale = computed(() => {
  if (props.canvas.scaleMode === "scroll") {
    return 1;
  }

  if (!containerSize.width || !containerSize.height) {
    return 1;
  }

  const scaleX = containerSize.width / props.canvas.width;
  const scaleY = containerSize.height / props.canvas.height;

  return props.canvas.scaleMode === "fill"
    ? Math.max(scaleX, scaleY)
    : Math.min(scaleX, scaleY);
});

const canvasStyle = computed(() => ({
  width: `${props.canvas.width}px`,
  height: `${props.canvas.height}px`,
  transform: `scale(${scale.value})`,
  background: props.canvas.background ?? "transparent"
}));

const containerClass = computed(() => ({
  "dao-screen-canvas": true,
  "dao-screen-canvas--scroll": props.canvas.scaleMode === "scroll"
}));
</script>

<template>
  <div ref="containerRef" :class="containerClass">
    <div class="dao-screen-canvas__surface" :style="canvasStyle">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dao-screen-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: #0f172a;
}

.dao-screen-canvas--scroll {
  overflow: auto;
}

.dao-screen-canvas__surface {
  position: relative;
  transform-origin: top left;
}
</style>
