<script setup lang="ts">
import { createTranslator } from "@dao-style-viz/ai-dashboard-runtime";
import { BigScreenRuntime } from "@dao-style-viz/ai-dashboard-vue";
import { computed, ref } from "vue";
import { clusterDataSources } from "./data-sources/cluster";
import { clusterOverviewDashboard } from "./dashboards/cluster-overview";
import { messages } from "./i18n/messages";
import { widgetRegistry } from "./widgets";

const locale = ref<"en-US" | "zh-CN">("en-US");

const runtime = computed(() => ({
  locale: locale.value,
  fallbackLocale: "en-US",
  route: {
    query: {
      clusterId: "demo-cluster"
    }
  },
  messages
}));

const title = computed(() =>
  createTranslator(runtime.value)("dashboard.clusterOverview.name")
);
</script>

<template>
  <main class="demo-page">
    <header class="demo-toolbar">
      <strong>{{ title }}</strong>
      <button type="button" @click="locale = locale === 'en-US' ? 'zh-CN' : 'en-US'">
        {{ locale }}
      </button>
    </header>
    <section class="demo-stage">
      <BigScreenRuntime
        :config="clusterOverviewDashboard"
        :widgets="widgetRegistry"
        :data-sources="clusterDataSources"
        :runtime="runtime"
      />
    </section>
  </main>
</template>

<style scoped>
.demo-page {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr;
  background: #020617;
  color: #f8fafc;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgb(148 163 184 / 18%);
}

.demo-toolbar button {
  border: 1px solid rgb(148 163 184 / 32%);
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  cursor: pointer;
  padding: 6px 10px;
}

.demo-stage {
  min-height: 0;
  padding: 20px;
}
</style>
