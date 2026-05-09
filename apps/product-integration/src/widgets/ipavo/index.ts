import { defineWidget } from "@dao-style-viz/ai-dashboard-runtime";
import IpavoAbilityOverview from "./IpavoAbilityOverview.vue";
import IpavoAlertStatus from "./IpavoAlertStatus.vue";
import IpavoClusterCount from "./IpavoClusterCount.vue";
import IpavoHealthStatus from "./IpavoHealthStatus.vue";
import IpavoPodStatistics from "./IpavoPodStatistics.vue";
import IpavoResourceUsage from "./IpavoResourceUsage.vue";
import {
  ipavoAbilityOverviewDataSchema,
  ipavoAbilityOverviewPropsSchema,
  ipavoAlertStatusDataSchema,
  ipavoAlertStatusPropsSchema,
  ipavoClusterCountDataSchema,
  ipavoClusterCountPropsSchema,
  ipavoHealthStatusDataSchema,
  ipavoHealthStatusPropsSchema,
  ipavoPodStatisticsDataSchema,
  ipavoPodStatisticsPropsSchema,
  ipavoResourceUsageDataSchema,
  ipavoResourceUsagePropsSchema
} from "./schemas";

export const ipavoWidgetRegistry = {
  IpavoPodStatistics: defineWidget({
    type: "IpavoPodStatistics",
    name: "Ipavo Pod Statistics",
    category: "layout",
    framework: "vue",
    component: IpavoPodStatistics,
    dataSchema: ipavoPodStatisticsDataSchema,
    propsSchema: ipavoPodStatisticsPropsSchema
  }),
  IpavoHealthStatus: defineWidget({
    type: "IpavoHealthStatus",
    name: "Ipavo Health Status",
    category: "layout",
    framework: "vue",
    component: IpavoHealthStatus,
    dataSchema: ipavoHealthStatusDataSchema,
    propsSchema: ipavoHealthStatusPropsSchema
  }),
  IpavoAlertStatus: defineWidget({
    type: "IpavoAlertStatus",
    name: "Ipavo Alert Status",
    category: "layout",
    framework: "vue",
    component: IpavoAlertStatus,
    dataSchema: ipavoAlertStatusDataSchema,
    propsSchema: ipavoAlertStatusPropsSchema
  }),
  IpavoClusterCount: defineWidget({
    type: "IpavoClusterCount",
    name: "Ipavo Cluster Count",
    category: "layout",
    framework: "vue",
    component: IpavoClusterCount,
    dataSchema: ipavoClusterCountDataSchema,
    propsSchema: ipavoClusterCountPropsSchema
  }),
  IpavoResourceUsage: defineWidget({
    type: "IpavoResourceUsage",
    name: "Ipavo Resource Usage",
    category: "layout",
    framework: "vue",
    component: IpavoResourceUsage,
    dataSchema: ipavoResourceUsageDataSchema,
    propsSchema: ipavoResourceUsagePropsSchema
  }),
  IpavoAbilityOverview: defineWidget({
    type: "IpavoAbilityOverview",
    name: "Ipavo Ability Overview",
    category: "layout",
    framework: "vue",
    component: IpavoAbilityOverview,
    dataSchema: ipavoAbilityOverviewDataSchema,
    propsSchema: ipavoAbilityOverviewPropsSchema
  })
};

export * from "./schemas";
