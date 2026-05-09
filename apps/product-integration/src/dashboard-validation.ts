import { validateDashboardConfig } from "@dao-style-viz/ai-dashboard-ai-catalog";
import { ipavoOverviewDataSources } from "./data-sources/ipavo-overview";
import { tenantCapacityDataSources } from "./data-sources/tenant-capacity";
import { ipavoOverviewDashboard } from "./dashboards/ipavo-overview";
import { tenantCapacityDashboard } from "./dashboards/tenant-capacity";
import { productWidgetRegistry } from "./widgets";

export const tenantCapacityValidation = validateDashboardConfig(
  tenantCapacityDashboard,
  {
    dataSources: tenantCapacityDataSources,
    widgets: productWidgetRegistry
  }
);

export const ipavoOverviewValidation = validateDashboardConfig(
  ipavoOverviewDashboard,
  {
    dataSources: ipavoOverviewDataSources,
    widgets: productWidgetRegistry
  }
);
