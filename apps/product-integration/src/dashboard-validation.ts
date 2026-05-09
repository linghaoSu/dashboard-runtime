import { validateDashboardConfig } from "@dao-style-viz/ai-dashboard-ai-catalog";
import { tenantCapacityDataSources } from "./data-sources/tenant-capacity";
import { tenantCapacityDashboard } from "./dashboards/tenant-capacity";
import { productWidgetRegistry } from "./widgets";

export const tenantCapacityValidation = validateDashboardConfig(
  tenantCapacityDashboard,
  {
    dataSources: tenantCapacityDataSources,
    widgets: productWidgetRegistry
  }
);
