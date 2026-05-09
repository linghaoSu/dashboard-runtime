import { z } from "zod";

export const statusLevelSchema = z.enum(["normal", "success", "warning", "danger"]);

export const tableCellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

export const panelDataSchema = z
  .object({
    subtitle: z.string().optional(),
    content: z.string().optional()
  })
  .optional();

export const panelPropsSchema = z.object({
  tone: statusLevelSchema.default("normal"),
  subtitle: z.string().optional(),
  content: z.string().optional()
});

export const metricCardDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  trend: z.number().optional(),
  status: statusLevelSchema.optional()
});

export const metricCardPropsSchema = z.object({
  precision: z.number().int().nonnegative().default(1),
  unit: z.string().optional()
});

export const statusBadgeDataSchema = z.object({
  label: z.string(),
  status: statusLevelSchema,
  description: z.string().optional()
});

export const statusBadgePropsSchema = z.object({});

export const rankingListItemSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  rank: z.number().int().positive().optional()
});

export const rankingListDataSchema = z.array(rankingListItemSchema);

export const rankingListPropsSchema = z.object({
  maxItems: z.number().int().positive().default(10),
  unit: z.string().optional()
});

export const scrollTableDataSchema = z.object({
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string()
    })
  ),
  rows: z.array(z.record(tableCellValueSchema))
});

export const scrollTablePropsSchema = z.object({
  maxRows: z.number().int().positive().default(20)
});

export const alarmListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: statusLevelSchema,
  time: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional()
});

export const alarmListDataSchema = z.array(alarmListItemSchema);

export const alarmListPropsSchema = z.object({
  maxItems: z.number().int().positive().default(10)
});

export const filterOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  active: z.boolean().optional()
});

export const filterBarDataSchema = z.array(filterOptionSchema).optional();

export const filterBarPropsSchema = z.object({
  trigger: z.string().default("change"),
  options: z.array(filterOptionSchema).default([])
});

export const timeRangePickerDataSchema = z.array(filterOptionSchema).optional();

export const timeRangePickerPropsSchema = z.object({
  trigger: z.string().default("change"),
  options: z.array(filterOptionSchema).default([])
});

export type PanelData = z.infer<typeof panelDataSchema>;
export type PanelProps = z.input<typeof panelPropsSchema>;
export type MetricCardData = z.infer<typeof metricCardDataSchema>;
export type MetricCardProps = z.input<typeof metricCardPropsSchema>;
export type StatusBadgeData = z.infer<typeof statusBadgeDataSchema>;
export type StatusBadgeProps = z.input<typeof statusBadgePropsSchema>;
export type RankingListData = z.infer<typeof rankingListDataSchema>;
export type RankingListProps = z.input<typeof rankingListPropsSchema>;
export type ScrollTableData = z.infer<typeof scrollTableDataSchema>;
export type ScrollTableProps = z.input<typeof scrollTablePropsSchema>;
export type AlarmListData = z.infer<typeof alarmListDataSchema>;
export type AlarmListProps = z.input<typeof alarmListPropsSchema>;
export type FilterBarData = z.infer<typeof filterBarDataSchema>;
export type FilterBarProps = z.input<typeof filterBarPropsSchema>;
export type TimeRangePickerData = z.infer<typeof timeRangePickerDataSchema>;
export type TimeRangePickerProps = z.input<typeof timeRangePickerPropsSchema>;
