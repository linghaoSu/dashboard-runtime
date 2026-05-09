import { defineVueWidget } from "@dao-style-viz/ai-dashboard-vue";
import AreaChart from "./AreaChart.vue";
import BarChart from "./BarChart.vue";
import DonutChart from "./DonutChart.vue";
import FunnelChart from "./FunnelChart.vue";
import GaugeChart from "./GaugeChart.vue";
import HeatmapChart from "./HeatmapChart.vue";
import LineChart from "./LineChart.vue";
import MapChart from "./MapChart.vue";
import PieChart from "./PieChart.vue";
import RadarChart from "./RadarChart.vue";
import ScatterChart from "./ScatterChart.vue";
import {
  areaChartDataSchema,
  areaChartPropsSchema,
  barChartDataSchema,
  barChartPropsSchema,
  donutChartDataSchema,
  donutChartPropsSchema,
  funnelChartDataSchema,
  funnelChartPropsSchema,
  gaugeChartDataSchema,
  gaugeChartPropsSchema,
  heatmapChartDataSchema,
  heatmapChartPropsSchema,
  lineChartDataSchema,
  lineChartPropsSchema,
  mapChartDataSchema,
  mapChartPropsSchema,
  pieChartDataSchema,
  pieChartPropsSchema,
  radarChartDataSchema,
  radarChartPropsSchema,
  scatterChartDataSchema,
  scatterChartPropsSchema,
  type AreaChartData,
  type AreaChartProps,
  type BarChartData,
  type BarChartProps,
  type DonutChartData,
  type DonutChartProps,
  type FunnelChartData,
  type FunnelChartProps,
  type GaugeChartData,
  type GaugeChartProps,
  type HeatmapChartData,
  type HeatmapChartProps,
  type LineChartData,
  type LineChartProps,
  type MapChartData,
  type MapChartProps,
  type PieChartData,
  type PieChartProps,
  type RadarChartData,
  type RadarChartProps,
  type ScatterChartData,
  type ScatterChartProps
} from "./schemas.js";

export const lineChartWidget = defineVueWidget<LineChartData, LineChartProps>({
  type: "LineChart",
  name: "Line Chart",
  description: "Shows a trend or time series with one or more lines",
  category: "chart",
  component: LineChart,
  dataSchema: lineChartDataSchema,
  propsSchema: lineChartPropsSchema,
  examples: [
    {
      title: "CPU trend",
      data: [
        { time: "10:00", value: 62 },
        { time: "10:05", value: 68 },
        { time: "10:10", value: 72 }
      ],
      props: {
        xField: "time",
        yField: "value",
        smooth: true,
        unit: "%"
      }
    }
  ],
  aiHints: {
    goodFor: ["trend", "time series", "continuous metric"],
    notGoodFor: ["part-to-whole distribution", "single current value"],
    preferredDataShape: "array of records with category/time and numeric value"
  },
  i18n: {
    namespace: "aiDashboard.widgets.lineChart",
    labelKey: "aiDashboard.widgets.lineChart.name",
    descriptionKey: "aiDashboard.widgets.lineChart.description"
  }
});

export const barChartWidget = defineVueWidget<BarChartData, BarChartProps>({
  type: "BarChart",
  name: "Bar Chart",
  description: "Compares categorical values with bars",
  category: "chart",
  component: BarChart,
  dataSchema: barChartDataSchema,
  propsSchema: barChartPropsSchema,
  examples: [
    {
      title: "Namespace usage",
      data: [
        { name: "prod", value: 91 },
        { name: "staging", value: 66 }
      ],
      props: {
        xField: "name",
        yField: "value",
        unit: "%"
      }
    }
  ],
  aiHints: {
    goodFor: ["category comparison", "top N values", "side-by-side metrics"],
    notGoodFor: ["continuous trend", "geographic points"],
    preferredDataShape: "array of records with category and numeric value"
  }
});

export const areaChartWidget = defineVueWidget<AreaChartData, AreaChartProps>({
  type: "AreaChart",
  name: "Area Chart",
  description: "Shows cumulative or filled trends over time",
  category: "chart",
  component: AreaChart,
  dataSchema: areaChartDataSchema,
  propsSchema: areaChartPropsSchema,
  examples: [
    {
      title: "Traffic",
      data: [
        { time: "10:00", value: 120 },
        { time: "10:05", value: 180 }
      ],
      props: {
        xField: "time",
        yField: "value",
        smooth: true
      }
    }
  ],
  aiHints: {
    goodFor: ["volume trend", "filled time series", "stacked trend"],
    notGoodFor: ["single KPI", "part-to-whole distribution"],
    preferredDataShape: "array of records with time/category and numeric value"
  }
});

export const gaugeChartWidget = defineVueWidget<
  GaugeChartData,
  GaugeChartProps
>({
  type: "GaugeChart",
  name: "Gauge Chart",
  description: "Shows one bounded percentage or score metric",
  category: "chart",
  component: GaugeChart,
  dataSchema: gaugeChartDataSchema,
  propsSchema: gaugeChartPropsSchema,
  examples: [
    {
      title: "CPU usage",
      data: {
        label: "CPU Usage",
        value: 72.5,
        unit: "%"
      },
      props: {
        max: 100,
        unit: "%",
        warningThreshold: 75,
        dangerThreshold: 90
      }
    }
  ],
  aiHints: {
    goodFor: ["single metric", "percentage", "bounded score"],
    notGoodFor: ["trend", "ranking", "multi-category distribution"],
    preferredDataShape: "object with label and numeric value"
  },
  i18n: {
    namespace: "aiDashboard.widgets.gaugeChart",
    labelKey: "aiDashboard.widgets.gaugeChart.name",
    descriptionKey: "aiDashboard.widgets.gaugeChart.description"
  }
});

export const donutChartWidget = defineVueWidget<DonutChartData, DonutChartProps>(
  {
    type: "DonutChart",
    name: "Donut Chart",
    description: "Shows part-to-whole category distribution",
    category: "chart",
    component: DonutChart,
    dataSchema: donutChartDataSchema,
    propsSchema: donutChartPropsSchema,
    examples: [
      {
        title: "Pod status",
        data: [
          { name: "Running", value: 42 },
          { name: "Pending", value: 3 },
          { name: "Failed", value: 1 }
        ],
        props: {
          unit: ""
        }
      }
    ],
    aiHints: {
      goodFor: ["distribution", "part-to-whole", "status breakdown"],
      notGoodFor: ["time series", "large ranking lists"],
      preferredDataShape: "array of category name and numeric value"
    },
    i18n: {
      namespace: "aiDashboard.widgets.donutChart",
      labelKey: "aiDashboard.widgets.donutChart.name",
      descriptionKey: "aiDashboard.widgets.donutChart.description"
    }
  }
);

export const pieChartWidget = defineVueWidget<PieChartData, PieChartProps>({
  type: "PieChart",
  name: "Pie Chart",
  description: "Shows part-to-whole category distribution as a pie",
  category: "chart",
  component: PieChart,
  dataSchema: pieChartDataSchema,
  propsSchema: pieChartPropsSchema,
  examples: [
    {
      title: "Status split",
      data: [
        { name: "Running", value: 42 },
        { name: "Pending", value: 3 }
      ],
      props: {}
    }
  ],
  aiHints: {
    goodFor: ["small category distribution", "part-to-whole"],
    notGoodFor: ["many categories", "time series"],
    preferredDataShape: "array of category name and numeric value"
  }
});

export const radarChartWidget = defineVueWidget<RadarChartData, RadarChartProps>({
  type: "RadarChart",
  name: "Radar Chart",
  description: "Shows a multi-dimension score profile",
  category: "chart",
  component: RadarChart,
  dataSchema: radarChartDataSchema,
  propsSchema: radarChartPropsSchema,
  examples: [
    {
      title: "Cluster profile",
      data: [
        { name: "CPU", value: 72, max: 100 },
        { name: "Memory", value: 64, max: 100 }
      ],
      props: {
        unit: "%"
      }
    }
  ],
  aiHints: {
    goodFor: ["score profile", "multi-dimension comparison"],
    notGoodFor: ["large tables", "precise trend reading"],
    preferredDataShape: "array of dimension name, value, and optional max"
  }
});

export const heatmapChartWidget = defineVueWidget<
  HeatmapChartData,
  HeatmapChartProps
>({
  type: "HeatmapChart",
  name: "Heatmap Chart",
  description: "Shows intensity across two categorical dimensions",
  category: "chart",
  component: HeatmapChart,
  dataSchema: heatmapChartDataSchema,
  propsSchema: heatmapChartPropsSchema,
  examples: [
    {
      title: "Hourly load",
      data: [
        { x: "Mon", y: "00:00", value: 12 },
        { x: "Mon", y: "01:00", value: 18 }
      ],
      props: {}
    }
  ],
  aiHints: {
    goodFor: ["matrix intensity", "time bucket heatmap"],
    notGoodFor: ["single KPI", "free-form geography"],
    preferredDataShape: "array of x/y category and numeric value"
  }
});

export const scatterChartWidget = defineVueWidget<
  ScatterChartData,
  ScatterChartProps
>({
  type: "ScatterChart",
  name: "Scatter Chart",
  description: "Shows relationship between two numeric dimensions",
  category: "chart",
  component: ScatterChart,
  dataSchema: scatterChartDataSchema,
  propsSchema: scatterChartPropsSchema,
  examples: [
    {
      title: "CPU and memory",
      data: [
        { x: 42, y: 68, size: 10 },
        { x: 75, y: 82, size: 18 }
      ],
      props: {
        xField: "x",
        yField: "y",
        sizeField: "size"
      }
    }
  ],
  aiHints: {
    goodFor: ["correlation", "outlier detection", "two numeric measures"],
    notGoodFor: ["ordered ranking", "part-to-whole"],
    preferredDataShape: "array of records with numeric x and y fields"
  }
});

export const funnelChartWidget = defineVueWidget<
  FunnelChartData,
  FunnelChartProps
>({
  type: "FunnelChart",
  name: "Funnel Chart",
  description: "Shows drop-off across ordered stages",
  category: "chart",
  component: FunnelChart,
  dataSchema: funnelChartDataSchema,
  propsSchema: funnelChartPropsSchema,
  examples: [
    {
      title: "Request stages",
      data: [
        { name: "Received", value: 1000 },
        { name: "Scheduled", value: 920 }
      ],
      props: {}
    }
  ],
  aiHints: {
    goodFor: ["pipeline stages", "drop-off analysis"],
    notGoodFor: ["unrelated categories", "time series"],
    preferredDataShape: "ordered stage name and numeric value"
  }
});

export const mapChartWidget = defineVueWidget<MapChartData, MapChartProps>({
  type: "MapChart",
  name: "Map Chart",
  description: "Shows coordinate points by longitude and latitude",
  category: "chart",
  component: MapChart,
  dataSchema: mapChartDataSchema,
  propsSchema: mapChartPropsSchema,
  examples: [
    {
      title: "Regions",
      data: [
        { name: "Shanghai", longitude: 121.47, latitude: 31.23, value: 12 },
        { name: "Beijing", longitude: 116.4, latitude: 39.9, value: 8 }
      ],
      props: {
        unit: ""
      }
    }
  ],
  aiHints: {
    goodFor: ["coordinate points", "regional locations"],
    notGoodFor: ["administrative choropleth without registered map data"],
    preferredDataShape: "array of name, longitude, latitude, and optional value"
  }
});

export const echartsWidgetRegistry = {
  LineChart: lineChartWidget,
  BarChart: barChartWidget,
  AreaChart: areaChartWidget,
  GaugeChart: gaugeChartWidget,
  DonutChart: donutChartWidget,
  PieChart: pieChartWidget,
  RadarChart: radarChartWidget,
  HeatmapChart: heatmapChartWidget,
  ScatterChart: scatterChartWidget,
  FunnelChart: funnelChartWidget,
  MapChart: mapChartWidget
};
