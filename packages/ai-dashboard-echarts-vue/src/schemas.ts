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

export const barChartDataSchema = lineChartDataSchema;

export const barChartPropsSchema = lineChartPropsSchema.extend({
  orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
  stack: z.boolean().default(false)
});

export const areaChartDataSchema = lineChartDataSchema;

export const areaChartPropsSchema = lineChartPropsSchema.extend({
  stack: z.boolean().default(false)
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

export const pieChartDataSchema = donutChartDataSchema;

export const pieChartPropsSchema = z.object({
  radius: z.string().default("70%"),
  unit: z.string().optional(),
  showLegend: z.boolean().default(true)
});

export const radarChartDataItemSchema = z.object({
  name: z.string(),
  value: z.number(),
  max: z.number().positive().optional()
});

export const radarChartDataSchema = z.array(radarChartDataItemSchema);

export const radarChartPropsSchema = z.object({
  max: z.number().positive().optional(),
  unit: z.string().optional()
});

export const heatmapChartDataItemSchema = z.object({
  x: z.string(),
  y: z.string(),
  value: z.number()
});

export const heatmapChartDataSchema = z.array(heatmapChartDataItemSchema);

export const heatmapChartPropsSchema = z.object({
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional()
});

export const scatterChartDataSchema = lineChartDataSchema;

export const scatterChartPropsSchema = z.object({
  xField: z.string().default("x"),
  yField: z.string().default("y"),
  sizeField: z.string().optional(),
  seriesField: z.string().optional(),
  unit: z.string().optional(),
  showLegend: z.boolean().default(true)
});

export const funnelChartDataSchema = donutChartDataSchema;

export const funnelChartPropsSchema = z.object({
  unit: z.string().optional(),
  sort: z.enum(["ascending", "descending", "none"]).default("descending")
});

export const mapChartDataItemSchema = z.object({
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  value: z.number().optional()
});

export const mapChartDataSchema = z.array(mapChartDataItemSchema);

export const mapChartPropsSchema = z.object({
  unit: z.string().optional(),
  symbolSize: z.number().positive().default(12)
});

export type LineChartDataItem = z.infer<typeof lineChartDataItemSchema>;
export type LineChartData = z.infer<typeof lineChartDataSchema>;
export type LineChartProps = z.input<typeof lineChartPropsSchema>;
export type BarChartData = z.infer<typeof barChartDataSchema>;
export type BarChartProps = z.input<typeof barChartPropsSchema>;
export type AreaChartData = z.infer<typeof areaChartDataSchema>;
export type AreaChartProps = z.input<typeof areaChartPropsSchema>;
export type GaugeChartData = z.infer<typeof gaugeChartDataSchema>;
export type GaugeChartProps = z.input<typeof gaugeChartPropsSchema>;
export type DonutChartDataItem = z.infer<typeof donutChartDataItemSchema>;
export type DonutChartData = z.infer<typeof donutChartDataSchema>;
export type DonutChartProps = z.input<typeof donutChartPropsSchema>;
export type PieChartData = z.infer<typeof pieChartDataSchema>;
export type PieChartProps = z.input<typeof pieChartPropsSchema>;
export type RadarChartData = z.infer<typeof radarChartDataSchema>;
export type RadarChartProps = z.input<typeof radarChartPropsSchema>;
export type HeatmapChartData = z.infer<typeof heatmapChartDataSchema>;
export type HeatmapChartProps = z.input<typeof heatmapChartPropsSchema>;
export type ScatterChartData = z.infer<typeof scatterChartDataSchema>;
export type ScatterChartProps = z.input<typeof scatterChartPropsSchema>;
export type FunnelChartData = z.infer<typeof funnelChartDataSchema>;
export type FunnelChartProps = z.input<typeof funnelChartPropsSchema>;
export type MapChartData = z.infer<typeof mapChartDataSchema>;
export type MapChartProps = z.input<typeof mapChartPropsSchema>;
