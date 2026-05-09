import { echartsWidgetRegistry } from "@dao-style-viz/ai-dashboard-echarts-vue";
import { basicWidgetRegistry } from "@dao-style-viz/ai-dashboard-widgets";
import { ipavoWidgetRegistry } from "./ipavo";

export const productWidgetRegistry = {
  ...echartsWidgetRegistry,
  ...basicWidgetRegistry,
  ...ipavoWidgetRegistry
};
