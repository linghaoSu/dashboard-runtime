import { z } from "zod";
import type { GeneratedChartManifest } from "./schemas.js";

export const generatedChartPreviewMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ai-dashboard.generated-chart.ready"),
    widgetType: z.string()
  }),
  z.object({
    type: z.literal("ai-dashboard.generated-chart.render"),
    widgetType: z.string(),
    data: z.unknown(),
    props: z.record(z.unknown()).default({})
  }),
  z.object({
    type: z.literal("ai-dashboard.generated-chart.rendered"),
    widgetType: z.string()
  }),
  z.object({
    type: z.literal("ai-dashboard.generated-chart.error"),
    widgetType: z.string(),
    message: z.string()
  })
]);

export type GeneratedChartPreviewMessage = z.infer<
  typeof generatedChartPreviewMessageSchema
>;

export type GeneratedChartPreviewContract = {
  widgetType: string;
  entry: string;
  sampleData: unknown;
  sandboxAttributes: string[];
  messages: {
    ready: "ai-dashboard.generated-chart.ready";
    render: "ai-dashboard.generated-chart.render";
    rendered: "ai-dashboard.generated-chart.rendered";
    error: "ai-dashboard.generated-chart.error";
  };
};

export function createGeneratedChartPreviewContract(
  manifest: GeneratedChartManifest,
  sampleData: unknown
): GeneratedChartPreviewContract {
  return {
    widgetType: manifest.widgetType,
    entry: manifest.entry,
    sampleData,
    sandboxAttributes: ["allow-scripts"],
    messages: {
      ready: "ai-dashboard.generated-chart.ready",
      render: "ai-dashboard.generated-chart.render",
      rendered: "ai-dashboard.generated-chart.rendered",
      error: "ai-dashboard.generated-chart.error"
    }
  };
}

export function parseGeneratedChartPreviewMessage(
  message: unknown
): GeneratedChartPreviewMessage {
  return generatedChartPreviewMessageSchema.parse(message);
}
