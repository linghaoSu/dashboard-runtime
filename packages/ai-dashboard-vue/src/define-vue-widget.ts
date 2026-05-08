import type { Component } from "vue";
import {
  defineWidget,
  type WidgetDefinition
} from "@dao-style-viz/ai-dashboard-runtime";

export type VueWidgetDefinition<TData, TProps> = WidgetDefinition<
  TData,
  TProps,
  Component
>;

export function defineVueWidget<TData, TProps>(
  definition: Omit<VueWidgetDefinition<TData, TProps>, "framework"> & {
    framework?: "vue";
  }
): VueWidgetDefinition<TData, TProps> {
  return defineWidget({
    ...definition,
    framework: "vue"
  });
}
