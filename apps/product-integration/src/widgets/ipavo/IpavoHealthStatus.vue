<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import type { IpavoHealthStatusData } from "./schemas";

defineProps<WidgetRuntimeProps<IpavoHealthStatusData, Record<string, never>>>();
</script>

<template>
  <div class="ipavo-health">
    <div
      class="ipavo-health__headline"
      :class="{ 'ipavo-health__headline--bad': data.status === 'unhealthy' }"
    >
      {{ data.label }}
    </div>
    <div v-for="item in data.items" :key="item.label" class="ipavo-health__row">
      <div class="ipavo-health__icon">{{ item.icon }}</div>
      <div class="ipavo-health__label">{{ item.label }}</div>
      <div class="ipavo-health__count">
        <span :class="{ 'ipavo-health__count--bad': item.status === 'unhealthy' }">
          {{ item.healthy }}
        </span>/{{ item.total }}
      </div>
      <div
        class="ipavo-health__tag"
        :class="{ 'ipavo-health__tag--bad': item.status === 'unhealthy' }"
      >
        {{ data.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-health {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.ipavo-health__headline {
  display: grid;
  flex: 1 1 auto;
  min-height: 110px;
  place-items: center;
  color: #61a867;
  font-size: 30px;
  font-weight: 700;
}

.ipavo-health__headline--bad {
  color: #dd5250;
}

.ipavo-health__row {
  display: grid;
  min-height: 40px;
  align-items: center;
  border-top: 1px solid #edf0f5;
  grid-template-columns: 28px 1fr 88px 48px;
}

.ipavo-health__icon {
  color: #26394f;
  font-size: 17px;
}

.ipavo-health__label,
.ipavo-health__count {
  color: #26394f;
  font-size: 13px;
}

.ipavo-health__count span {
  color: #31b76a;
}

.ipavo-health__count--bad {
  color: #dd5250;
}

.ipavo-health__tag {
  border-radius: 4px;
  background: #daf5df;
  color: #3d9f4b;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}

.ipavo-health__tag--bad {
  background: #ffe1df;
  color: #dd5250;
}
</style>
