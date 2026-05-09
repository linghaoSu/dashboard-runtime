import type { WidgetRegistry } from "@dao-style-viz/ai-dashboard-runtime";
import type { GeneratedChartGateResult } from "./gate.js";

export class GeneratedChartSandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeneratedChartSandboxError";
  }
}

export type GeneratedWidgetRegistryOptions = {
  enabled?: boolean;
  approved?: boolean;
  approvalGatePassed?: boolean;
  gateResult: GeneratedChartGateResult;
  widgets: WidgetRegistry;
};

export function createGeneratedWidgetRegistry(
  options: GeneratedWidgetRegistryOptions
): WidgetRegistry {
  if (!(options.enabled ?? false)) {
    return {};
  }

  if (!options.approved) {
    throw new GeneratedChartSandboxError(
      "Generated widget registry requires explicit human approval"
    );
  }

  if (!options.approvalGatePassed) {
    throw new GeneratedChartSandboxError(
      "Generated widget registry requires a completed sandbox approval gate"
    );
  }

  if (!options.gateResult.success) {
    throw new GeneratedChartSandboxError(
      "Generated widget registry cannot be enabled before sandbox validation passes"
    );
  }

  return {
    ...options.widgets
  };
}
