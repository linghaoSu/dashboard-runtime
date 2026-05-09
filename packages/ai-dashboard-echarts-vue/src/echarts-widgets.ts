import { defineVueWidget } from "@dao-style-viz/ai-dashboard-vue";
import DonutChart from "./DonutChart.vue";
import GaugeChart from "./GaugeChart.vue";
import LineChart from "./LineChart.vue";
import {
  donutChartDataSchema,
  donutChartPropsSchema,
  gaugeChartDataSchema,
  gaugeChartPropsSchema,
  lineChartDataSchema,
  lineChartPropsSchema,
  type DonutChartData,
  type DonutChartProps,
  type GaugeChartData,
  type GaugeChartProps,
  type LineChartData,
  type LineChartProps
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

export const echartsWidgetRegistry = {
  LineChart: lineChartWidget,
  GaugeChart: gaugeChartWidget,
  DonutChart: donutChartWidget
};
