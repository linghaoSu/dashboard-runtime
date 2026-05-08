import type { z } from "zod";
import type {
  WidgetFramework,
  WidgetRuntimeProps
} from "./renderer-adapter.js";

export type WidgetCategory = "metric" | "chart" | "table" | "layout" | "filter";

export type WidgetDefinition<TData, TProps, TComponent = unknown> = {
  type: string;
  name: string;
  description?: string;
  category: WidgetCategory;
  framework: WidgetFramework;
  component: TComponent;
  dataSchema: z.ZodSchema<TData>;
  propsSchema: z.ZodSchema<TProps>;
  examples?: Array<{
    title: string;
    data: TData;
    props: TProps;
  }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredDataShape?: string;
  };
  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
};

export type WidgetRegistry = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WidgetDefinition<any, any, unknown>
>;

export type WidgetComponentProps<TData, TProps> = WidgetRuntimeProps<
  TData,
  TProps
>;

export function defineWidget<TData, TProps, TComponent>(
  definition: WidgetDefinition<TData, TProps, TComponent>
): WidgetDefinition<TData, TProps, TComponent> {
  return definition;
}
