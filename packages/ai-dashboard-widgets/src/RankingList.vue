<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { RankingListData, RankingListProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<RankingListData, RankingListProps>>();

const items = computed(() =>
  runtimeProps.data.slice(0, runtimeProps.props.maxItems ?? 10)
);
const maxValue = computed(() =>
  Math.max(...items.value.map((item) => item.value), 1)
);

function valueText(value: number, unit: string | undefined) {
  return `${runtimeProps.format.number(value)}${runtimeProps.props.unit ?? unit ?? ""}`;
}
</script>

<template>
  <ol class="dao-ranking-list">
    <li v-for="(item, index) in items" :key="item.name" class="dao-ranking-list__item">
      <span class="dao-ranking-list__rank">{{ item.rank ?? index + 1 }}</span>
      <span class="dao-ranking-list__name">{{ item.name }}</span>
      <span class="dao-ranking-list__bar">
        <span :style="{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }" />
      </span>
      <span class="dao-ranking-list__value">{{ valueText(item.value, item.unit) }}</span>
    </li>
  </ol>
</template>

<style scoped>
.dao-ranking-list {
  display: grid;
  width: 100%;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dao-ranking-list__item {
  display: grid;
  grid-template-columns: 28px minmax(80px, 1fr) minmax(80px, 1.2fr) max-content;
  align-items: center;
  gap: 10px;
  color: #e5e7eb;
  font-size: 13px;
}

.dao-ranking-list__rank {
  color: #38bdf8;
  font-weight: 700;
}

.dao-ranking-list__name,
.dao-ranking-list__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-ranking-list__bar {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(51 65 85 / 72%);
}

.dao-ranking-list__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #38bdf8;
}
</style>
