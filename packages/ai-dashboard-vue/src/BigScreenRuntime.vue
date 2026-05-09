<script setup lang="ts">
import {
  dashboardConfigSchema,
  type DashboardConfig,
  type WidgetConfig
} from "@dao-style-viz/ai-dashboard-schema";
import {
  createRuntimeContext,
  resolveRefs,
  type DashboardTheme,
  type DataSourceRegistry,
  type RuntimeInput,
  type WidgetRegistry,
  type WidgetRuntimeEvent
} from "@dao-style-viz/ai-dashboard-runtime";
import { computed, ref } from "vue";
import ScreenCanvas from "./ScreenCanvas.vue";
import WidgetRenderer from "./WidgetRenderer.vue";

const props = defineProps<{
  config: DashboardConfig;
  widgets: WidgetRegistry;
  dataSources: DataSourceRegistry;
  runtime: RuntimeInput;
}>();

const emit = defineEmits<{
  "runtime-event": [event: WidgetRuntimeEvent];
}>();

const globalFilterOverrides = ref<Record<string, unknown>>({});
const refreshRequests = ref<Record<string, number>>({});

const parsedConfig = computed(() => {
  const result = dashboardConfigSchema.safeParse(props.config);
  if (!result.success) {
    return {
      config: null,
      error: new Error(result.error.message)
    };
  }

  return {
    config: result.data,
    error: null
  };
});

const runtimeContext = computed(() => {
  if (!parsedConfig.value.config) {
    return null;
  }

  return createRuntimeContext(parsedConfig.value.config, props.runtime, {
    globalFilterOverrides: globalFilterOverrides.value
  });
});

const theme = computed<DashboardTheme>(() => {
  const canvas = parsedConfig.value.config?.canvas;

  return {
    name: canvas?.theme ?? "default",
    colors: canvas?.colors,
    palette: canvas?.chartPalette ? [...canvas.chartPalette] : undefined
  };
});

const visibleWidgets = computed<WidgetConfig[]>(() => {
  const config = parsedConfig.value.config;
  const runtime = runtimeContext.value;

  if (!config || !runtime) {
    return [];
  }

  return config.widgets.filter((widget) => {
    if (widget.visible === undefined) {
      return true;
    }

    if (typeof widget.visible === "boolean") {
      return widget.visible;
    }

    return Boolean(resolveRefs(widget.visible, {
      runtime: {
        locale: runtime.locale,
        timezone: runtime.timezone,
        route: runtime.route,
        user: runtime.user
      },
      context: runtime.context,
      globalFilters: runtime.globalFilters
    }));
  });
});

const widgetIds = computed(() =>
  parsedConfig.value.config?.widgets.map((widget) => widget.id) ?? []
);

function handleRuntimeEvent(event: WidgetRuntimeEvent) {
  if (event.type === "setFilter") {
    globalFilterOverrides.value = {
      ...globalFilterOverrides.value,
      [event.payload.key]: event.payload.value
    };
  }

  if (event.type === "refreshWidget" && widgetIds.value.includes(event.targetWidgetId)) {
    refreshRequests.value = {
      ...refreshRequests.value,
      [event.targetWidgetId]: (refreshRequests.value[event.targetWidgetId] ?? 0) + 1
    };
  }

  emit("runtime-event", event);
}
</script>

<template>
  <div v-if="parsedConfig.error" class="dao-runtime-error">
    {{ parsedConfig.error.message }}
  </div>
  <ScreenCanvas v-else-if="parsedConfig.config && runtimeContext" :canvas="parsedConfig.config.canvas">
    <WidgetRenderer
      v-for="widget in visibleWidgets"
      :key="widget.id"
      :widget="widget"
      :widgets="widgets"
      :data-sources="dataSources"
      :runtime="runtimeContext"
      :theme="theme"
      :refresh-key="refreshRequests[widget.id] ?? 0"
      :known-widget-ids="widgetIds"
      @runtime-event="handleRuntimeEvent"
    />
  </ScreenCanvas>
</template>

<style scoped>
.dao-runtime-error {
  display: grid;
  min-height: 240px;
  place-items: center;
  color: #b91c1c;
  font-size: 14px;
}
</style>
