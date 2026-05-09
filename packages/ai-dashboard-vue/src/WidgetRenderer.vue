<script setup lang="ts">
import type { WidgetConfig } from "@dao-style-viz/ai-dashboard-schema";
import {
  createFormatters,
  createTranslator,
  dispatchWidgetEvent,
  getWidgetDefinition,
  loadWidgetData,
  parseWidgetProps,
  resolveI18nText,
  type DashboardTheme,
  type DataSourceRegistry,
  type RuntimeContext,
  type WidgetEmittedEvent,
  type WidgetRegistry,
  type WidgetRuntimeEvent,
  type WidgetRuntimeProps
} from "@dao-style-viz/ai-dashboard-runtime";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import WidgetErrorBoundary from "./WidgetErrorBoundary.vue";
import WidgetShell from "./WidgetShell.vue";

const props = defineProps<{
  widget: WidgetConfig;
  widgets: WidgetRegistry;
  dataSources: DataSourceRegistry;
  runtime: RuntimeContext;
  theme: DashboardTheme;
  refreshKey?: number;
  knownWidgetIds?: readonly string[];
}>();

const emit = defineEmits<{
  "runtime-event": [event: WidgetRuntimeEvent];
}>();

const data = ref<unknown>();
const loading = ref(false);
const error = ref<Error | null>(null);
let abortController: AbortController | undefined;
let loadVersion = 0;
let refreshTimer: number | undefined;

const translator = computed(() => createTranslator(props.runtime));
const title = computed(() => resolveI18nText(props.widget.title, translator.value));
const emptyText = computed(() =>
  resolveI18nText(props.widget.data?.fallback?.emptyText, translator.value)
);
const errorText = computed(() =>
  resolveI18nText(props.widget.data?.fallback?.errorText, translator.value)
);
const definition = computed(() => getWidgetDefinition(props.widget, props.widgets));
const widgetProps = computed(() =>
  parseWidgetProps(props.widget, props.widgets)
);
const format = computed(() =>
  createFormatters(props.runtime.locale, props.runtime.timezone)
);

const isEmpty = computed(() => {
  if (data.value === undefined || data.value === null) {
    return true;
  }

  return Array.isArray(data.value) && data.value.length === 0;
});

const runtimeProps = computed<WidgetRuntimeProps>(() => ({
  id: props.widget.id,
  title: title.value,
  data: data.value,
  props: widgetProps.value,
  theme: props.theme,
  locale: props.runtime.locale,
  timezone: props.runtime.timezone,
  t: translator.value,
  format: format.value,
  loading: loading.value,
  error: error.value,
  width: props.widget.layout.w,
  height: props.widget.layout.h,
  emit: handleWidgetEmit
}));

async function load() {
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;
  loadVersion += 1;
  const currentLoadVersion = loadVersion;

  if (!props.widget.data) {
    data.value = undefined;
    error.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await loadWidgetData(props.widget, {
      dataSources: props.dataSources,
      widgets: props.widgets,
      runtime: props.runtime,
      signal: controller.signal
    });

    if (isCurrentLoad(controller, currentLoadVersion)) {
      data.value = result;
    }
  } catch (caught) {
    if (isCurrentLoad(controller, currentLoadVersion)) {
      error.value = caught instanceof Error ? caught : new Error(String(caught));
    }
  } finally {
    if (isCurrentLoad(controller, currentLoadVersion)) {
      loading.value = false;
    }
  }
}

function handleWidgetEmit(event: WidgetEmittedEvent) {
  try {
    const runtimeEvents = dispatchWidgetEvent(props.widget, event, props.runtime, {
      knownWidgetIds: props.knownWidgetIds
    });
    runtimeEvents.forEach((runtimeEvent) => emit("runtime-event", runtimeEvent));
  } catch (caught) {
    error.value = caught instanceof Error ? caught : new Error(String(caught));
  }
}

function isCurrentLoad(
  controller: AbortController,
  version: number
): boolean {
  return (
    abortController === controller &&
    loadVersion === version &&
    !controller.signal.aborted
  );
}

watch(
  () => [
    props.widget,
    props.runtime.locale,
    props.runtime.context,
    props.runtime.globalFilters
  ],
  () => {
    void load();
  },
  { deep: true, immediate: true }
);

watch(
  () => props.refreshKey,
  (refreshKey, previousRefreshKey) => {
    if (
      refreshKey !== undefined &&
      previousRefreshKey !== undefined &&
      refreshKey !== previousRefreshKey
    ) {
      void load();
    }
  }
);

watch(
  () => props.widget.data?.refresh,
  (refresh) => {
    if (refreshTimer) {
      window.clearInterval(refreshTimer);
      refreshTimer = undefined;
    }

    if (refresh?.type === "interval") {
      refreshTimer = window.setInterval(() => {
        void load();
      }, refresh.intervalMs);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  abortController?.abort();
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
  }
});
</script>

<template>
  <WidgetShell
    :title="title"
    :layout="widget.layout"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
    :empty-text="emptyText"
    :error-text="errorText"
  >
    <WidgetErrorBoundary>
      <component :is="definition.component" v-bind="runtimeProps" />
    </WidgetErrorBoundary>
  </WidgetShell>
</template>
