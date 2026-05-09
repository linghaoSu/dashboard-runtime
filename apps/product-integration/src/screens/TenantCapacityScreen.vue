<script setup lang="ts">
import { createTranslator } from "@dao-style-viz/ai-dashboard-runtime";
import { BigScreenRuntime } from "@dao-style-viz/ai-dashboard-vue";
import { computed, ref } from "vue";
import { ipavoOverviewDataSources } from "../data-sources/ipavo-overview";
import { tenantCapacityDataSources } from "../data-sources/tenant-capacity";
import {
  ipavoOverviewValidation,
  tenantCapacityValidation
} from "../dashboard-validation";
import { ipavoOverviewDashboard } from "../dashboards/ipavo-overview";
import { tenantCapacityDashboard } from "../dashboards/tenant-capacity";
import { messages } from "../i18n/messages";
import { productWidgetRegistry } from "../widgets";

const locale = ref<"en-US" | "zh-CN">("en-US");
const tenantId = ref("tenant-alpha");
const workspaceId = ref("prod");
const dashboardId = ref<"ipavo" | "tenant-capacity">("ipavo");

const runtime = computed(() => ({
  locale: locale.value,
  fallbackLocale: "en-US",
  route: {
    query: {
      tenantId: tenantId.value,
      workspaceId: workspaceId.value
    }
  },
  messages
}));

const translator = computed(() => createTranslator(runtime.value));
const activeDashboard = computed(() =>
  dashboardId.value === "ipavo" ? ipavoOverviewDashboard : tenantCapacityDashboard
);
const activeDataSources = computed(() =>
  dashboardId.value === "ipavo" ? ipavoOverviewDataSources : tenantCapacityDataSources
);
const activeValidation = computed(() =>
  dashboardId.value === "ipavo" ? ipavoOverviewValidation : tenantCapacityValidation
);
const screenTitle = computed(() =>
  translator.value(
    dashboardId.value === "ipavo"
      ? "dashboard.ipavo.name"
      : "dashboard.tenantCapacity.name"
  )
);
const validationIssues = computed(() =>
  activeValidation.value.success
    ? []
    : activeValidation.value.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      )
);
</script>

<template>
  <main class="product-screen">
    <header class="product-screen__toolbar">
      <div class="product-screen__title">
        <span>Product Observability</span>
        <strong>{{ screenTitle }}</strong>
      </div>
      <div class="product-screen__controls">
        <label>
          <span>Dashboard</span>
          <select v-model="dashboardId">
            <option value="ipavo">ipavo-overview</option>
            <option value="tenant-capacity">tenant-capacity</option>
          </select>
        </label>
        <label>
          <span>Tenant</span>
          <select v-model="tenantId">
            <option value="tenant-alpha">tenant-alpha</option>
          </select>
        </label>
        <label>
          <span>Workspace</span>
          <select v-model="workspaceId">
            <option value="prod">prod</option>
          </select>
        </label>
        <button type="button" @click="locale = locale === 'en-US' ? 'zh-CN' : 'en-US'">
          {{ locale }}
        </button>
      </div>
    </header>

    <section v-if="validationIssues.length" class="product-screen__validation">
      <strong>Dashboard config validation failed</strong>
      <ul>
        <li v-for="issue in validationIssues" :key="issue">{{ issue }}</li>
      </ul>
    </section>

    <section v-else class="product-screen__stage">
      <BigScreenRuntime
        :config="activeDashboard"
        :widgets="productWidgetRegistry"
        :data-sources="activeDataSources"
        :runtime="runtime"
      />
    </section>
  </main>
</template>

<style scoped>
.product-screen {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto minmax(0, 1fr);
  background: #020617;
}

.product-screen__toolbar {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid rgb(148 163 184 / 18%);
  background: #07111f;
  padding: 14px 20px;
}

.product-screen__title {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.product-screen__title span {
  color: #94a3b8;
  font-size: 12px;
}

.product-screen__title strong {
  overflow: hidden;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-screen__controls {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.product-screen__controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.product-screen__controls select,
.product-screen__controls button {
  min-height: 32px;
  border: 1px solid rgb(148 163 184 / 32%);
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  cursor: pointer;
  padding: 5px 9px;
}

.product-screen__stage {
  min-width: 0;
  min-height: 0;
  padding: 18px;
}

.product-screen__validation {
  margin: 18px;
  border: 1px solid rgb(248 113 113 / 42%);
  border-radius: 6px;
  background: rgb(127 29 29 / 22%);
  color: #fecaca;
  padding: 14px;
}

.product-screen__validation ul {
  margin: 10px 0 0;
  padding-left: 18px;
}

@media (max-width: 760px) {
  .product-screen__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .product-screen__controls {
    justify-content: flex-start;
  }
}
</style>
