import { z } from "zod";
import type { GeneratedChartManifest } from "./schemas.js";

const previewMessageBaseSchema = z.object({
  protocolVersion: z.literal("1.0.0"),
  sessionId: z.string().min(16),
  widgetType: z.string()
});

export const generatedChartPreviewMessageSchema = z.discriminatedUnion("type", [
  previewMessageBaseSchema.extend({
    type: z.literal("ai-dashboard.generated-chart.ready")
  }),
  previewMessageBaseSchema.extend({
    type: z.literal("ai-dashboard.generated-chart.render"),
    requestId: z.string().min(1),
    data: z.unknown(),
    props: z.record(z.unknown()).default({})
  }),
  previewMessageBaseSchema.extend({
    type: z.literal("ai-dashboard.generated-chart.rendered"),
    requestId: z.string().min(1)
  }),
  previewMessageBaseSchema.extend({
    type: z.literal("ai-dashboard.generated-chart.error"),
    requestId: z.string().min(1),
    message: z.string()
  })
]);

export type GeneratedChartPreviewMessage = z.infer<
  typeof generatedChartPreviewMessageSchema
>;

export type GeneratedChartPreviewOriginPolicy = {
  previewOrigin: string;
  parentOrigin: string;
  requireExactOrigin: true;
};

export type GeneratedChartPreviewContract = {
  widgetType: string;
  entry: string;
  sessionId: string;
  sampleData: unknown;
  sandboxAttributes: string[];
  disallowedSandboxAttributes: string[];
  csp: string;
  originPolicy: GeneratedChartPreviewOriginPolicy;
  messages: {
    ready: "ai-dashboard.generated-chart.ready";
    render: "ai-dashboard.generated-chart.render";
    rendered: "ai-dashboard.generated-chart.rendered";
    error: "ai-dashboard.generated-chart.error";
  };
};

export type GeneratedChartPreviewContractOptions = {
  parentOrigin?: string;
  previewOrigin?: string;
  sessionId?: string;
  csp?: string;
};

export type GeneratedChartPreviewMessageContext = {
  eventOrigin: string;
  expectedOrigin: string;
  expectedSessionId: string;
  expectedWidgetType: string;
};

export function createGeneratedChartPreviewContract(
  manifest: GeneratedChartManifest,
  sampleData: unknown,
  options: GeneratedChartPreviewContractOptions = {}
): GeneratedChartPreviewContract {
  const parentOrigin = options.parentOrigin ?? "http://127.0.0.1";
  const previewOrigin = options.previewOrigin ?? "null";

  return {
    widgetType: manifest.widgetType,
    entry: manifest.entry,
    sessionId: options.sessionId ?? createPreviewSessionId(),
    sampleData,
    sandboxAttributes: ["allow-scripts"],
    disallowedSandboxAttributes: [
      "allow-same-origin",
      "allow-forms",
      "allow-popups",
      "allow-top-navigation",
      "allow-downloads"
    ],
    csp: options.csp ?? createGeneratedChartPreviewCsp(),
    originPolicy: {
      previewOrigin,
      parentOrigin,
      requireExactOrigin: true
    },
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

export function validateGeneratedChartPreviewMessage(
  message: unknown,
  context: GeneratedChartPreviewMessageContext
): GeneratedChartPreviewMessage {
  if (context.eventOrigin !== context.expectedOrigin) {
    throw new Error(
      `Generated chart preview message origin mismatch: expected ${context.expectedOrigin}, received ${context.eventOrigin}`
    );
  }

  const parsed = parseGeneratedChartPreviewMessage(message);
  if (parsed.sessionId !== context.expectedSessionId) {
    throw new Error("Generated chart preview message session mismatch");
  }

  if (parsed.widgetType !== context.expectedWidgetType) {
    throw new Error("Generated chart preview message widget type mismatch");
  }

  return parsed;
}

export function createGeneratedChartRenderMessage(
  contract: GeneratedChartPreviewContract,
  requestId: string
): GeneratedChartPreviewMessage {
  return {
    type: "ai-dashboard.generated-chart.render",
    protocolVersion: "1.0.0",
    sessionId: contract.sessionId,
    requestId,
    widgetType: contract.widgetType,
    data: contract.sampleData,
    props: {}
  };
}

export function createGeneratedChartPreviewCsp(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'none'"],
    "base-uri": ["'none'"],
    "object-src": ["'none'"],
    "form-action": ["'none'"],
    "connect-src": ["'none'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "frame-ancestors": ["'self'"]
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

function createPreviewSessionId(): string {
  return globalThis.crypto.randomUUID();
}
