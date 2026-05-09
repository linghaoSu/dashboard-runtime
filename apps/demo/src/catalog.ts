import {
  createDataSourceCatalog,
  createWidgetCatalog,
  validateDashboardConfig
} from "@dao-style-viz/ai-dashboard-ai-catalog";
import { clusterDataSources } from "./data-sources/cluster";
import { clusterOverviewDashboard } from "./dashboards/cluster-overview";
import { widgetRegistry } from "./widgets";

export const demoDataSourceCatalog = createDataSourceCatalog(clusterDataSources);
export const demoWidgetCatalog = createWidgetCatalog(widgetRegistry);
export const demoDashboardValidation = validateDashboardConfig(
  clusterOverviewDashboard,
  {
    dataSources: clusterDataSources,
    widgets: widgetRegistry
  }
);
