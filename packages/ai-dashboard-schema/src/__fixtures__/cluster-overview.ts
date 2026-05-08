import type { DashboardConfig } from "../dashboard-config.js";

export const clusterOverviewDashboard: DashboardConfig = {
  version: "1.0.0",
  meta: {
    id: "cluster-overview",
    name: {
      key: "dashboard.clusterOverview.name",
      defaultMessage: "Cluster Overview"
    }
  },
  canvas: {
    width: 1920,
    height: 1080,
    scaleMode: "fit",
    theme: "dark-blue"
  },
  i18n: {
    namespace: "clusterDashboard",
    defaultLocale: "zh-CN",
    supportedLocales: ["zh-CN", "en-US"]
  },
  context: {
    clusterId: { $ref: "route.query.clusterId" },
    locale: { $ref: "runtime.locale" },
    timeRange: { $ref: "globalFilters.timeRange" }
  },
  globalFilters: {
    timeRange: {
      type: "relative",
      value: "last_24h"
    }
  },
  widgets: [
    {
      id: "cpu-usage",
      type: "GaugeChart",
      title: {
        key: "widget.cpuUsage.title",
        defaultMessage: "CPU Usage"
      },
      layout: { x: 40, y: 40, w: 360, h: 220 },
      data: {
        source: "cluster.cpuUsage",
        params: {
          clusterId: { $ref: "context.clusterId" },
          locale: { $ref: "context.locale" }
        },
        refresh: {
          type: "interval",
          intervalMs: 10000
        }
      },
      props: {
        unit: "%",
        max: 100,
        warningThreshold: 80
      }
    },
    {
      id: "pod-status",
      type: "DonutChart",
      title: {
        key: "widget.podStatus.title",
        defaultMessage: "Pod Status"
      },
      layout: { x: 420, y: 40, w: 360, h: 220 },
      data: {
        source: "cluster.podStatusDistribution",
        params: {
          clusterId: { $ref: "context.clusterId" }
        }
      },
      props: {
        nameField: "name",
        valueField: "value",
        showLegend: true
      }
    }
  ]
};
