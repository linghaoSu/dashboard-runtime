import { echartsWidgetRegistry } from "@dao-style-viz/ai-dashboard-echarts-vue";
import { defineVueWidget } from "@dao-style-viz/ai-dashboard-vue";
import { z } from "zod";
import MetricValue from "./MetricValue.vue";

type MetricValueData = {
  label: string;
  value: number;
  unit?: string;
};

type MetricValueProps = {
  precision?: number;
};

export const widgetRegistry = {
  ...echartsWidgetRegistry,
  MetricValue: defineVueWidget<MetricValueData, MetricValueProps>({
    type: "MetricValue",
    name: "Metric Value",
    description: "Shows one numeric metric",
    category: "metric",
    component: MetricValue,
    dataSchema: z.object({
      label: z.string(),
      value: z.number(),
      unit: z.string().optional()
    }),
    propsSchema: z.object({
      precision: z.number().int().nonnegative().default(1)
    }),
    aiHints: {
      goodFor: ["single metric", "current value", "percentage"],
      notGoodFor: ["trend", "distribution"]
    }
  })
};
