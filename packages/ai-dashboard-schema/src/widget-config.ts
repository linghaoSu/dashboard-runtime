import { z } from "zod";
import { configRefSchema, configValueSchema, i18nTextSchema } from "./i18n.js";

export type WidgetEventAction = "setFilter" | "refreshWidget" | "emit";

export const widgetLayoutSchema = z
  .object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
    zIndex: z.number().int().optional()
  })
  .strict();

export const refreshConfigSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("manual"),
      intervalMs: z.undefined().optional()
    })
    .strict(),
  z
    .object({
      type: z.literal("interval"),
      intervalMs: z.number().int().positive()
    })
    .strict()
]);

export const dataBindingConfigSchema = z
  .object({
    source: z.string().min(1),
    params: z.record(configValueSchema).optional(),
    refresh: refreshConfigSchema.optional(),
    fallback: z
      .object({
        emptyText: i18nTextSchema.optional(),
        errorText: i18nTextSchema.optional()
      })
      .strict()
      .optional()
  })
  .strict();

export const widgetEventActionSchema = z.enum([
  "setFilter",
  "refreshWidget",
  "emit"
]);

export const widgetEventConfigSchema = z
  .object({
    trigger: z.string().min(1),
    action: widgetEventActionSchema,
    target: z.string().min(1).optional(),
    payload: z.record(configValueSchema).optional()
  })
  .strict();

export const widgetConfigSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    title: i18nTextSchema.optional(),
    description: i18nTextSchema.optional(),
    visible: z.union([z.boolean(), configRefSchema]).optional(),
    layout: widgetLayoutSchema,
    data: dataBindingConfigSchema.optional(),
    props: z.record(configValueSchema).optional(),
    events: z.array(widgetEventConfigSchema).optional()
  })
  .strict();

export type WidgetLayout = z.infer<typeof widgetLayoutSchema>;
export type RefreshConfig = z.infer<typeof refreshConfigSchema>;
export type DataBindingConfig = z.infer<typeof dataBindingConfigSchema>;
export type WidgetEventConfig = z.infer<typeof widgetEventConfigSchema>;
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
