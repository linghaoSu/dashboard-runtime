import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";

const tenantContextParams = {
  tenantId: { $ref: "context.tenantId" },
  workspaceId: { $ref: "context.workspaceId" }
};

const localizedTenantContextParams = {
  ...tenantContextParams,
  locale: { $ref: "runtime.locale" }
};

const namespaceFilterParams = {
  ...tenantContextParams,
  namespace: { $ref: "globalFilters.namespace" }
};

export const tenantCapacityDashboard: DashboardConfig = {
  version: "1.0.0",
  meta: {
    id: "tenant-capacity",
    name: {
      key: "dashboard.tenantCapacity.name",
      defaultMessage: "Tenant Capacity"
    },
    owner: "platform-observability",
    tags: ["tenant", "capacity", "product-integration"]
  },
  canvas: {
    width: 1440,
    height: 900,
    scaleMode: "fit",
    theme: "dao-dark",
    background: "#08111f",
    colors: {
      text: "#dbeafe",
      primary: "#38bdf8",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      accent: "#a78bfa",
      axis: "rgba(148, 163, 184, 0.35)",
      grid: "rgba(148, 163, 184, 0.14)"
    },
    chartPalette: [
      "#38bdf8",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a78bfa",
      "#14b8a6",
      "#f472b6",
      "#eab308"
    ]
  },
  i18n: {
    namespace: "dashboard.tenantCapacity",
    defaultLocale: "en-US",
    supportedLocales: ["en-US", "zh-CN"]
  },
  context: {
    tenantId: { $ref: "route.query.tenantId" },
    workspaceId: { $ref: "route.query.workspaceId" }
  },
  globalFilters: {
    namespace: "all"
  },
  widgets: [
    {
      id: "namespace-filter",
      type: "FilterBar",
      title: {
        key: "dashboard.tenantCapacity.widget.namespaceFilter.title",
        defaultMessage: "Namespace"
      },
      layout: { x: 32, y: 28, w: 760, h: 88 },
      data: {
        source: "tenant.capacity.namespaceOptions",
        params: namespaceFilterParams
      },
      props: {
        trigger: "change"
      },
      events: [
        {
          trigger: "change",
          action: "setFilter",
          payload: {
            key: "namespace",
            value: { $ref: "event.payload.value" }
          }
        }
      ]
    },
    {
      id: "capacity-note",
      type: "Panel",
      title: {
        key: "dashboard.tenantCapacity.widget.capacityNote.title",
        defaultMessage: "SLO"
      },
      layout: { x: 820, y: 28, w: 588, h: 88 },
      data: {
        source: "tenant.capacity.sloNote",
        params: localizedTenantContextParams
      },
      props: {
        tone: "success"
      }
    },
    {
      id: "cpu-capacity",
      type: "MetricCard",
      title: {
        key: "dashboard.tenantCapacity.widget.cpu.title",
        defaultMessage: "CPU Capacity"
      },
      layout: { x: 32, y: 148, w: 320, h: 188 },
      data: {
        source: "tenant.capacity.cpu",
        params: localizedTenantContextParams,
        fallback: {
          emptyText: {
            key: "dashboard.tenantCapacity.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.tenantCapacity.state.error",
            defaultMessage: "Failed to load capacity data"
          }
        }
      },
      props: {
        precision: 1
      }
    },
    {
      id: "memory-capacity",
      type: "MetricCard",
      title: {
        key: "dashboard.tenantCapacity.widget.memory.title",
        defaultMessage: "Memory Capacity"
      },
      layout: { x: 384, y: 148, w: 320, h: 188 },
      data: {
        source: "tenant.capacity.memory",
        params: localizedTenantContextParams,
        fallback: {
          emptyText: {
            key: "dashboard.tenantCapacity.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.tenantCapacity.state.error",
            defaultMessage: "Failed to load capacity data"
          }
        }
      },
      props: {
        precision: 1
      }
    },
    {
      id: "tenant-alerts",
      type: "AlarmList",
      title: {
        key: "dashboard.tenantCapacity.widget.alerts.title",
        defaultMessage: "Active Alerts"
      },
      layout: { x: 736, y: 148, w: 672, h: 188 },
      data: {
        source: "tenant.capacity.alerts",
        params: localizedTenantContextParams,
        fallback: {
          emptyText: {
            key: "dashboard.tenantCapacity.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.tenantCapacity.state.error",
            defaultMessage: "Failed to load capacity data"
          }
        }
      },
      props: {
        maxItems: 6
      }
    },
    {
      id: "namespace-usage",
      type: "BarChart",
      title: {
        key: "dashboard.tenantCapacity.widget.namespaceUsage.title",
        defaultMessage: "Namespace CPU"
      },
      layout: { x: 32, y: 372, w: 1376, h: 464 },
      data: {
        source: "tenant.capacity.namespaceUsage",
        params: namespaceFilterParams,
        fallback: {
          emptyText: {
            key: "dashboard.tenantCapacity.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.tenantCapacity.state.error",
            defaultMessage: "Failed to load capacity data"
          }
        }
      },
      props: {
        xField: "namespace",
        yField: "value",
        unit: " cores",
        showLegend: false,
        palette: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"]
      }
    }
  ]
};
