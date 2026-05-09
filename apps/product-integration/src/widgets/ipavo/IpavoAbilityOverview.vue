<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import type { IpavoAbilityOverviewData } from "./schemas";

defineProps<WidgetRuntimeProps<IpavoAbilityOverviewData, Record<string, never>>>();
</script>

<template>
  <div class="ipavo-ability">
    <div v-for="product in data.products" :key="product.title" class="ipavo-ability__item">
      <div class="ipavo-ability__icon">{{ product.icon }}</div>
      <div class="ipavo-ability__title">{{ product.title }}</div>
      <div class="ipavo-ability__features">
        <span v-for="feature in product.features.slice(0, 4)" :key="feature">
          {{ feature }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipavo-ability {
  display: grid;
  width: 100%;
  align-content: start;
  gap: 6px;
}

.ipavo-ability__item {
  display: grid;
  min-width: 0;
  height: 38px;
  align-items: center;
  border-radius: 4px;
  background: #eef2f7;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  padding: 0 12px;
}

.ipavo-ability__icon {
  color: #26394f;
  font-size: 17px;
}

.ipavo-ability__title {
  overflow: hidden;
  color: #26394f;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ipavo-ability__features {
  display: flex;
  gap: 10px;
}

.ipavo-ability__features span {
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  color: #0ea5e9;
  font-size: 11px;
  font-weight: 700;
}
</style>
