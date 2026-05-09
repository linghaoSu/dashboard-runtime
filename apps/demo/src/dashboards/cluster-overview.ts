import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";

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
    width: 960,
    height: 540,
    scaleMode: "fit",
    theme: "dao-dark",
    background: "#111827"
  },
  i18n: {
    namespace: "clusterDashboard",
    defaultLocale: "en-US",
    supportedLocales: ["en-US", "zh-CN"]
  },
  context: {
    clusterId: { $ref: "route.query.clusterId" },
    locale: { $ref: "runtime.locale" }
  },
  widgets: [
    {
      id: "cpu-usage",
      type: "GaugeChart",
      title: {
        key: "dashboard.clusterOverview.widget.cpuUsage.title",
        defaultMessage: "CPU Usage"
      },
      layout: { x: 32, y: 32, w: 280, h: 160 },
      data: {
        source: "cluster.cpuUsage",
        params: {
          clusterId: { $ref: "context.clusterId" },
          locale: { $ref: "context.locale" }
        },
        fallback: {
          emptyText: {
            key: "dashboard.clusterOverview.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.clusterOverview.state.error",
            defaultMessage: "Failed to load"
          }
        }
      },
      props: {
        max: 100,
        precision: 1,
        unit: "%",
        warningThreshold: 75,
        dangerThreshold: 90
      }
    },
    {
      id: "cpu-trend",
      type: "LineChart",
      title: {
        key: "dashboard.clusterOverview.widget.cpuTrend.title",
        defaultMessage: "CPU Trend"
      },
      layout: { x: 336, y: 32, w: 592, h: 220 },
      data: {
        source: "cluster.cpuTrend",
        params: {
          clusterId: { $ref: "context.clusterId" }
        },
        fallback: {
          emptyText: {
            key: "dashboard.clusterOverview.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.clusterOverview.state.error",
            defaultMessage: "Failed to load"
          }
        }
      },
      props: {
        xField: "time",
        yField: "value",
        smooth: true,
        area: true,
        unit: "%",
        showLegend: false
      }
    },
    {
      id: "pod-status",
      type: "DonutChart",
      title: {
        key: "dashboard.clusterOverview.widget.podStatus.title",
        defaultMessage: "Pod Status"
      },
      layout: { x: 32, y: 284, w: 420, h: 220 },
      data: {
        source: "cluster.podStatusDistribution",
        params: {
          clusterId: { $ref: "context.clusterId" },
          locale: { $ref: "context.locale" }
        },
        fallback: {
          emptyText: {
            key: "dashboard.clusterOverview.state.empty",
            defaultMessage: "No data"
          },
          errorText: {
            key: "dashboard.clusterOverview.state.error",
            defaultMessage: "Failed to load"
          }
        }
      },
      props: {
        unit: "",
        showLegend: true
      }
    }
  ]
};
