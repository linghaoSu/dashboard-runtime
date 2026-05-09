import { z } from "zod";
import { configValueSchema, i18nTextSchema, localeCodeSchema } from "./i18n.js";
import { widgetConfigSchema } from "./widget-config.js";

export const canvasConfigSchema = z
  .object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    scaleMode: z.enum(["fit", "fill", "scroll"]),
    theme: z.string().min(1),
    background: z.string().optional(),
    colors: z.record(z.string().min(1)).optional(),
    chartPalette: z.array(z.string().min(1)).min(1).max(12).optional()
  })
  .strict();

export const dashboardMetaSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: i18nTextSchema.optional(),
    description: i18nTextSchema.optional(),
    owner: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional()
  })
  .strict();

export const dashboardI18nConfigSchema = z
  .object({
    namespace: z.string().min(1).optional(),
    defaultLocale: localeCodeSchema.optional(),
    supportedLocales: z.array(localeCodeSchema).optional()
  })
  .strict();

export const dashboardConfigSchema = z
  .object({
    version: z.string().min(1),
    meta: dashboardMetaSchema.optional(),
    canvas: canvasConfigSchema,
    i18n: dashboardI18nConfigSchema.optional(),
    context: z.record(configValueSchema).optional(),
    globalFilters: z.record(z.unknown()).optional(),
    widgets: z.array(widgetConfigSchema).min(1)
  })
  .strict();

export type CanvasConfig = z.infer<typeof canvasConfigSchema>;
export type DashboardMeta = z.infer<typeof dashboardMetaSchema>;
export type DashboardI18nConfig = z.infer<typeof dashboardI18nConfigSchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
