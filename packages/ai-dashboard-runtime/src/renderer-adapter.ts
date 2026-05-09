import type { WidgetConfig } from "@dao-style-viz/ai-dashboard-schema";
import type { LocaleMessages } from "./i18n-runtime.js";

export type DashboardTheme = {
  name: string;
  colors?: Record<string, string>;
};

export type RuntimeInput = {
  locale: string;
  fallbackLocale?: string;
  timezone?: string;
  route?: unknown;
  user?: unknown;
  messages?: LocaleMessages;
  t?: (key: string, values?: Record<string, unknown>) => string;
};

export type RuntimeContext = RuntimeInput & {
  context: Record<string, unknown>;
  globalFilters: Record<string, unknown>;
};

export type RefScope = {
  runtime: Pick<RuntimeContext, "locale" | "timezone" | "route" | "user">;
  context: Record<string, unknown>;
  globalFilters: Record<string, unknown>;
};

export type EventRefScope = RefScope & {
  event: {
    payload?: Record<string, unknown>;
  };
};

export type WidgetEmittedEvent = {
  trigger: string;
  sourceWidgetId: string;
  payload?: Record<string, unknown>;
};

export type WidgetRuntimeEvent =
  | {
      type: "setFilter";
      sourceWidgetId: string;
      payload: { key: string; value: unknown };
    }
  | {
      type: "refreshWidget";
      sourceWidgetId: string;
      targetWidgetId: string;
    }
  | {
      type: "emit";
      sourceWidgetId: string;
      name: string;
      payload?: Record<string, unknown>;
    };

export type WidgetRuntimeProps<TData = unknown, TProps = unknown> = {
  id: string;
  title?: string;
  data: TData;
  props: TProps;
  theme: DashboardTheme;
  locale: string;
  timezone?: string;
  t: (key: string, values?: Record<string, unknown>) => string;
  format: {
    number: (value: number, options?: Intl.NumberFormatOptions) => string;
    date: (
      value: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ) => string;
    percent: (value: number, options?: Intl.NumberFormatOptions) => string;
  };
  loading?: boolean;
  error?: Error | null;
  width?: number;
  height?: number;
  emit?: (event: WidgetEmittedEvent) => void;
};

export type WidgetFramework = "vue" | string;

export type WidgetRendererAdapter<TComponent = unknown> = {
  framework: WidgetFramework;
  render: (component: TComponent, props: WidgetRuntimeProps) => unknown;
};

export type BigScreenRuntimeProps = {
  config: unknown;
  widgets: Record<string, unknown>;
  dataSources: Record<string, unknown>;
  runtime: RuntimeInput;
  minRefreshIntervalMs?: number;
  onEvent?: (event: WidgetRuntimeEvent) => void;
};

export type WidgetRendererContext = {
  widget: WidgetConfig;
  runtime: RuntimeContext;
};
