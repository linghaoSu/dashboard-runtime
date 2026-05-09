import { z } from "zod";

export const ipavoStatusSchema = z.enum([
  "healthy",
  "warning",
  "critical",
  "unknown"
]);

export const ipavoPodStatisticsDataSchema = z.object({
  cells: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      status: ipavoStatusSchema
    })
  ),
  legend: z.array(
    z.object({
      label: z.string(),
      color: z.string()
    })
  ),
  totalPods: z.number(),
  runningPods: z.number(),
  otherPods: z.number()
});

export const ipavoPodStatisticsPropsSchema = z.object({});

export const ipavoHealthStatusDataSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  label: z.string(),
  items: z.array(
    z.object({
      label: z.string(),
      icon: z.string(),
      healthy: z.number(),
      total: z.number(),
      status: z.enum(["healthy", "unhealthy"])
    })
  )
});

export const ipavoHealthStatusPropsSchema = z.object({});

export const ipavoAlertStatusDataSchema = z.object({
  counts: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      status: z.enum(["critical", "warning", "info"]),
      color: z.string()
    })
  ),
  messages: z.array(z.string())
});

export const ipavoAlertStatusPropsSchema = z.object({
  maxMessages: z.number().int().positive().default(5)
});

export const ipavoClusterCountDataSchema = z.object({
  clusters: z.array(
    z.object({
      name: z.string(),
      provider: z.string(),
      features: z.array(z.string())
    })
  ),
  nodes: z.number()
});

export const ipavoClusterCountPropsSchema = z.object({});

export const ipavoResourceUsageDataSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      percent: z.number().min(0).max(1),
      usedLabel: z.string(),
      totalLabel: z.string(),
      color: z.string()
    })
  )
});

export const ipavoResourceUsagePropsSchema = z.object({});

export const ipavoAbilityOverviewDataSchema = z.object({
  products: z.array(
    z.object({
      title: z.string(),
      icon: z.string(),
      features: z.array(z.string())
    })
  )
});

export const ipavoAbilityOverviewPropsSchema = z.object({});

export type IpavoPodStatisticsData = z.infer<
  typeof ipavoPodStatisticsDataSchema
>;
export type IpavoHealthStatusData = z.infer<typeof ipavoHealthStatusDataSchema>;
export type IpavoAlertStatusData = z.infer<typeof ipavoAlertStatusDataSchema>;
export type IpavoClusterCountData = z.infer<typeof ipavoClusterCountDataSchema>;
export type IpavoResourceUsageData = z.infer<
  typeof ipavoResourceUsageDataSchema
>;
export type IpavoAbilityOverviewData = z.infer<
  typeof ipavoAbilityOverviewDataSchema
>;
