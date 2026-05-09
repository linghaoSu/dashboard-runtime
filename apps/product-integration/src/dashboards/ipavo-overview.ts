import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";

export const ipavoOverviewDashboard: DashboardConfig = {
  version: "1.0.0",
  meta: {
    id: "ipavo-overview",
    name: {
      key: "dashboard.ipavo.name",
      defaultMessage: "Ipavo Overview"
    },
    owner: "ipavo",
    tags: ["ipavo", "cluster", "dashboard"]
  },
  canvas: {
    width: 1920,
    height: 760,
    scaleMode: "fit",
    theme: "dao-light",
    background: "#eef2f7",
    colors: {
      text: "#26394f",
      heading: "#1f2937",
      muted: "#7d8794",
      primary: "#43a1e5",
      success: "#32d475",
      warning: "#f4b434",
      danger: "#dd5250",
      axis: "#a4afbd",
      grid: "#edf0f5",
      widgetBackground: "#ffffff",
      widgetBorder: "transparent",
      widgetShadow: "0 4px 12px rgba(15, 23, 42, 0.12)"
    },
    chartPalette: ["#5b8ff9", "#32d475", "#f4b434", "#dd5250", "#2497df"]
  },
  i18n: {
    namespace: "dashboard.ipavo",
    defaultLocale: "zh-CN",
    supportedLocales: ["zh-CN", "en-US"]
  },
  widgets: [
    {
      id: "pod-statistics",
      type: "IpavoPodStatistics",
      title: {
        key: "dashboard.ipavo.widget.podStatistics",
        defaultMessage: "Pod Statistics"
      },
      layout: { x: 24, y: 20, w: 456, h: 318 },
      data: {
        source: "ipavo.podStatistics",
        params: {}
      }
    },
    {
      id: "cpu-usage",
      type: "AreaChart",
      title: {
        key: "dashboard.ipavo.widget.cpuUsage",
        defaultMessage: "CPU Usage"
      },
      layout: { x: 496, y: 20, w: 456, h: 146 },
      data: {
        source: "ipavo.cpuUsage",
        params: {}
      },
      props: {
        xField: "time",
        yField: "value",
        unit: " core",
        area: true,
        showLegend: false,
        showYAxis: false,
        palette: ["#5b8ff9"]
      }
    },
    {
      id: "memory-usage",
      type: "AreaChart",
      title: {
        key: "dashboard.ipavo.widget.memoryUsage",
        defaultMessage: "Memory Usage"
      },
      layout: { x: 496, y: 192, w: 456, h: 146 },
      data: {
        source: "ipavo.memoryUsage",
        params: {}
      },
      props: {
        xField: "time",
        yField: "value",
        unit: " GB",
        area: true,
        showLegend: false,
        showYAxis: false,
        palette: ["#5b8ff9"]
      }
    },
    {
      id: "health-status",
      type: "IpavoHealthStatus",
      title: {
        key: "dashboard.ipavo.widget.healthStatus",
        defaultMessage: "Health Status"
      },
      layout: { x: 968, y: 20, w: 456, h: 318 },
      data: {
        source: "ipavo.healthStatus",
        params: {}
      }
    },
    {
      id: "alert-status",
      type: "IpavoAlertStatus",
      title: {
        key: "dashboard.ipavo.widget.alert",
        defaultMessage: "Alert"
      },
      layout: { x: 1440, y: 20, w: 456, h: 318 },
      data: {
        source: "ipavo.alertStatus",
        params: {}
      },
      props: {
        maxMessages: 5
      }
    },
    {
      id: "cluster-count",
      type: "IpavoClusterCount",
      title: {
        key: "dashboard.ipavo.widget.clusterCount",
        defaultMessage: "Cluster Count"
      },
      layout: { x: 24, y: 388, w: 456, h: 320 },
      data: {
        source: "ipavo.clusterCount",
        params: {}
      }
    },
    {
      id: "resource-usage",
      type: "IpavoResourceUsage",
      title: {
        key: "dashboard.ipavo.widget.resourceUsage",
        defaultMessage: "Resource Usage"
      },
      layout: { x: 496, y: 388, w: 928, h: 320 },
      data: {
        source: "ipavo.resourceUsage",
        params: {}
      }
    },
    {
      id: "ability-overview",
      type: "IpavoAbilityOverview",
      title: {
        key: "dashboard.ipavo.widget.funcList",
        defaultMessage: "Function List"
      },
      layout: { x: 1440, y: 388, w: 456, h: 320 },
      data: {
        source: "ipavo.abilityOverview",
        params: {}
      }
    }
  ]
};
