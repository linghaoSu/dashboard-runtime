<script setup lang="ts">
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
  messages,
  t(key: string, values?: Record<string, unknown>) {
    const message = messages[locale.value]?.[key] ?? messages["en-US"]?.[key] ?? key;
    if (!values) {
      return message;
    }

    return message.replace(/\{([^}]+)\}/g, (_, token: string) =>
      values[token] === undefined ? `{${token}}` : String(values[token])
    );
  }
}));
</script>

<template>
  <main class="demo-page">
    <header class="demo-toolbar">
      <strong>{{ runtime.t("dashboard.clusterOverview.name") }}</strong>
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
