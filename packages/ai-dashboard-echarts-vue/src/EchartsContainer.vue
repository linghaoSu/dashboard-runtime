<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import VChart from "vue-echarts";

defineProps<{
  option: Record<string, unknown>;
  initOptions: Record<string, unknown>;
}>();

const emit = defineEmits<{
  click: [params: { data?: unknown; name?: string; seriesName?: string }];
}>();

const containerRef = ref<HTMLElement>();
const ready = ref(false);
let resizeObserver: ResizeObserver | undefined;
let animationFrame = 0;

function updateReady() {
  const element = containerRef.value;
  ready.value = Boolean(element?.clientWidth && element.clientHeight);
}

onMounted(() => {
  const element = containerRef.value;
  if (!element) {
    return;
  }

  resizeObserver = new ResizeObserver(() => updateReady());
  resizeObserver.observe(element);

  void nextTick(() => {
    animationFrame = window.requestAnimationFrame(updateReady);
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
});
</script>

<template>
  <div ref="containerRef" class="dao-echarts-container">
    <VChart
      v-if="ready"
      :option="option"
      :init-options="initOptions"
      autoresize
      class="dao-echarts-chart"
      @click="emit('click', $event)"
    />
  </div>
</template>

<style scoped>
.dao-echarts-container {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dao-echarts-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
