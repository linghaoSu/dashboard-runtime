import type { WidgetConfig } from "@dao-style-viz/ai-dashboard-schema";
import { DashboardRuntimeError } from "./errors.js";
import { resolveRefs } from "./ref-resolver.js";
import { createRefScope } from "./runtime-context.js";
import type {
  EventRefScope,
  RuntimeContext,
  WidgetEmittedEvent,
  WidgetRuntimeEvent
} from "./renderer-adapter.js";

export function dispatchWidgetEvent(
  widget: WidgetConfig,
  emitted: WidgetEmittedEvent,
  runtime: RuntimeContext
): WidgetRuntimeEvent[] {
  const matchingEvents =
    widget.events?.filter((event) => event.trigger === emitted.trigger) ?? [];

  return matchingEvents.map((eventConfig) => {
    const refScope: EventRefScope = {
      ...createRefScope(runtime),
      event: {
        payload: emitted.payload
      }
    };
    const payload = resolveRefs(eventConfig.payload ?? {}, refScope);

    switch (eventConfig.action) {
      case "setFilter": {
        const key = payload.key;
        if (typeof key !== "string") {
          throw new DashboardRuntimeError("setFilter requires payload.key");
        }

        return {
          type: "setFilter",
          sourceWidgetId: emitted.sourceWidgetId,
          payload: {
            key,
            value: payload.value
          }
        };
      }
      case "refreshWidget":
        return {
          type: "refreshWidget",
          sourceWidgetId: emitted.sourceWidgetId,
          targetWidgetId: eventConfig.target ?? widget.id
        };
      case "emit":
        return {
          type: "emit",
          sourceWidgetId: emitted.sourceWidgetId,
          name: eventConfig.target ?? emitted.trigger,
          payload
        };
    }
  });
}
