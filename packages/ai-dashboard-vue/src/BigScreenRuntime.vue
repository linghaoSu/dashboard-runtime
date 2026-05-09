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

type ConfigErrorMode = "development" | "production";

const props = defineProps<{
  config: DashboardConfig;
  widgets: WidgetRegistry;
  dataSources: DataSourceRegistry;
  runtime: RuntimeInput;
  configErrorMode?: ConfigErrorMode;
  configErrorTitle?: string;
  configErrorMessage?: string;
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
      error: result.error,
      issues: result.error.issues
    };
  }

  return {
    config: result.data,
    error: null,
    issues: []
  };
});

const configErrorMode = computed<ConfigErrorMode>(() =>
  props.configErrorMode ?? (import.meta.env.DEV ? "development" : "production")
);

const configErrorTitle = computed(
  () =>
    props.configErrorTitle ??
    (configErrorMode.value === "development"
      ? "Dashboard config validation failed"
      : "Dashboard unavailable")
);

const configErrorMessage = computed(
  () =>
    props.configErrorMessage ??
    (configErrorMode.value === "development"
      ? "Fix the DashboardConfig issues below before rendering."
      : "The dashboard configuration is invalid. Contact the dashboard owner.")
);

const configErrorDetails = computed(() =>
  parsedConfig.value.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  })
);

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
  <div v-if="parsedConfig.error" class="dao-runtime-error" role="alert">
    <strong class="dao-runtime-error__title">{{ configErrorTitle }}</strong>
    <p class="dao-runtime-error__message">{{ configErrorMessage }}</p>
    <ul
      v-if="configErrorMode === 'development'"
      class="dao-runtime-error__details"
    >
      <li v-for="issue in configErrorDetails" :key="issue">{{ issue }}</li>
    </ul>
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
  display: flex;
  min-height: 240px;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  color: #b91c1c;
  font-size: 14px;
  padding: 24px;
  text-align: center;
}

.dao-runtime-error__title {
  color: #991b1b;
  font-size: 16px;
}

.dao-runtime-error__message {
  margin: 0;
}

.dao-runtime-error__details {
  display: inline-grid;
  align-self: center;
  margin: 4px 0 0;
  max-width: min(720px, 100%);
  gap: 4px;
  color: #7f1d1d;
  padding-left: 18px;
  text-align: left;
}
</style>
