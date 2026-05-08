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
}>();

const emit = defineEmits<{
  "runtime-event": [event: WidgetRuntimeEvent];
}>();

const data = ref<unknown>();
const loading = ref(false);
const error = ref<Error | null>(null);
let abortController: AbortController | undefined;
let refreshTimer: ReturnType<typeof window.setInterval> | undefined;

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
  abortController = new AbortController();

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
      signal: abortController.signal
    });

    if (!abortController.signal.aborted) {
      data.value = result;
    }
  } catch (caught) {
    if (!abortController.signal.aborted) {
      error.value = caught instanceof Error ? caught : new Error(String(caught));
    }
  } finally {
    if (!abortController.signal.aborted) {
      loading.value = false;
    }
  }
}

function handleWidgetEmit(event: WidgetEmittedEvent) {
  const runtimeEvents = dispatchWidgetEvent(props.widget, event, props.runtime);
  runtimeEvents.forEach((runtimeEvent) => emit("runtime-event", runtimeEvent));
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
