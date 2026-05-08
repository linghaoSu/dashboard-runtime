import type { WidgetConfig } from "@dao-style-viz/ai-dashboard-schema";
import { DashboardRuntimeError } from "./errors.js";
import { resolveRefs } from "./ref-resolver.js";
import { createRefScope } from "./runtime-context.js";
import type { DataSourceRegistry } from "./data-source.js";
import type { RuntimeContext } from "./renderer-adapter.js";
import type { WidgetDefinition, WidgetRegistry } from "./widget-registry.js";

export type LoadWidgetDataOptions = {
  dataSources: DataSourceRegistry;
  widgets: WidgetRegistry;
  runtime: RuntimeContext;
  signal?: AbortSignal;
};

export async function loadWidgetData(
  widget: WidgetConfig,
  options: LoadWidgetDataOptions
): Promise<unknown> {
  const widgetDefinition = getWidgetDefinition(widget, options.widgets);

  if (!widget.data) {
    return undefined;
  }

  const source = options.dataSources[widget.data.source];
  if (!source) {
    throw new DashboardRuntimeError(`DataSource not found: ${widget.data.source}`);
  }

  const paramsInput = resolveRefs(
    widget.data.params ?? {},
    createRefScope(options.runtime)
  );
  const params = source.paramsSchema.parse(paramsInput);
  const output = await source.query({
    params,
    runtime: options.runtime,
    signal: options.signal
  });
  const sourceOutput = source.outputSchema.parse(output);
  return widgetDefinition.dataSchema.parse(sourceOutput);
}

export function parseWidgetProps(
  widget: WidgetConfig,
  widgets: WidgetRegistry
): unknown {
  const widgetDefinition = getWidgetDefinition(widget, widgets);
  return widgetDefinition.propsSchema.parse(widget.props ?? {});
}

export function getWidgetDefinition(
  widget: WidgetConfig,
  widgets: WidgetRegistry
): WidgetDefinition<unknown, unknown, unknown> {
  const definition = widgets[widget.type];
  if (!definition) {
    throw new DashboardRuntimeError(`Widget not found: ${widget.type}`);
  }

  return definition;
}
