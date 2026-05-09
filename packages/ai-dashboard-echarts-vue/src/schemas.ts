import { z } from "zod";

export const lineChartDataItemSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export const lineChartDataSchema = z.array(lineChartDataItemSchema);

export const lineChartPropsSchema = z.object({
  xField: z.string().default("name"),
  yField: z.string().default("value"),
  seriesField: z.string().optional(),
  smooth: z.boolean().default(false),
  area: z.boolean().default(false),
  unit: z.string().optional(),
  showLegend: z.boolean().default(true)
});

export const gaugeChartDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional()
});

export const gaugeChartPropsSchema = z.object({
  min: z.number().default(0),
  max: z.number().positive().default(100),
  precision: z.number().int().nonnegative().default(1),
  unit: z.string().optional(),
  warningThreshold: z.number().optional(),
  dangerThreshold: z.number().optional()
});

export const donutChartDataItemSchema = z.object({
  name: z.string(),
  value: z.number(),
  color: z.string().optional()
});

export const donutChartDataSchema = z.array(donutChartDataItemSchema);

export const donutChartPropsSchema = z.object({
  innerRadius: z.string().default("52%"),
  outerRadius: z.string().default("76%"),
  unit: z.string().optional(),
  showLegend: z.boolean().default(true)
});

export type LineChartDataItem = z.infer<typeof lineChartDataItemSchema>;
export type LineChartData = z.infer<typeof lineChartDataSchema>;
export type LineChartProps = z.input<typeof lineChartPropsSchema>;
export type GaugeChartData = z.infer<typeof gaugeChartDataSchema>;
export type GaugeChartProps = z.input<typeof gaugeChartPropsSchema>;
export type DonutChartDataItem = z.infer<typeof donutChartDataItemSchema>;
export type DonutChartData = z.infer<typeof donutChartDataSchema>;
export type DonutChartProps = z.input<typeof donutChartPropsSchema>;
