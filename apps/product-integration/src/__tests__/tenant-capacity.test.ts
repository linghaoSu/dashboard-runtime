import { createDataSourceCatalog } from "@dao-style-viz/ai-dashboard-ai-catalog";
import { createTranslator } from "@dao-style-viz/ai-dashboard-runtime";
import { describe, expect, it } from "vitest";
import { ipavoOverviewDataSources } from "../data-sources/ipavo-overview";
import { tenantCapacityDataSources } from "../data-sources/tenant-capacity";
import {
  ipavoOverviewValidation,
  tenantCapacityValidation
} from "../dashboard-validation";
import { messages } from "../i18n/messages";

describe("tenant capacity product integration", () => {
  const runtime = {
    locale: "en-US",
    context: {},
    globalFilters: {}
  };

  it("passes dashboard catalog validation", () => {
    expect(tenantCapacityValidation).toMatchObject({
      success: true
    });
    expect(ipavoOverviewValidation).toMatchObject({
      success: true
    });
  });

  it("loads data through proto generated SDK wrappers", async () => {
    const output = await tenantCapacityDataSources[
      "tenant.capacity.namespaceUsage"
    ]?.query({
      params: {
        tenantId: "tenant-alpha",
        workspaceId: "prod",
        namespace: "backend"
      },
      runtime
    });

    expect(output).toEqual([
      {
        namespace: "backend",
        value: 22.8,
        memoryGiB: 96
      }
    ]);
  });

  it("exports dataSource catalog metadata without SDK implementation details", () => {
    const catalog = createDataSourceCatalog(tenantCapacityDataSources);
    const serialized = JSON.stringify(catalog);

    expect(catalog.map((item) => item.key)).toContain("tenant.capacity.cpu");
    expect(serialized).not.toContain("TenantCapacityService");
    expect(serialized).not.toContain("GetTenantCapacityOverview");
    expect(serialized).not.toContain("query");
    expect(serialized).not.toContain("function");
  });

  it("configures an ipavo-style dashboard from generated SDK-shaped dataSources", async () => {
    const podStatistics = await ipavoOverviewDataSources[
      "ipavo.podStatistics"
    ].query({
      params: {},
      runtime
    });
    const alertStatus = await ipavoOverviewDataSources["ipavo.alertStatus"].query({
      params: {},
      runtime
    });
    const resourceUsage = await ipavoOverviewDataSources[
      "ipavo.resourceUsage"
    ].query({
      params: {},
      runtime
    });

    expect(podStatistics).toMatchObject({
      totalPods: 278,
      runningPods: 241,
      otherPods: 37
    });
    expect(alertStatus.counts.map((item) => item.value)).toEqual([20, 128, 7]);
    expect(resourceUsage.items.map((item) => item.label)).toEqual([
      "CPU",
      "内存",
      "容器组",
      "磁盘"
    ]);
  });

  it("surfaces SDK wrapper errors for unknown tenant workspaces", async () => {
    const source = tenantCapacityDataSources["tenant.capacity.namespaceUsage"];

    await expect(
      source.query({
        params: {
          tenantId: "tenant-missing",
          workspaceId: "prod",
          namespace: "all"
        },
        runtime
      })
    ).rejects.toThrow("Unknown tenant workspace");
  });

  it("localizes data-driven dashboard text", async () => {
    const cpuOutput = await tenantCapacityDataSources["tenant.capacity.cpu"]?.query({
      params: {
        tenantId: "tenant-alpha",
        workspaceId: "prod",
        locale: "zh-CN"
      },
      runtime: {
        ...runtime,
        locale: "zh-CN"
      }
    });
    const filterOptions = await tenantCapacityDataSources[
      "tenant.capacity.namespaceOptions"
    ]?.query({
      params: {
        tenantId: "tenant-alpha",
        workspaceId: "prod",
        namespace: "backend"
      },
      runtime: {
        ...runtime,
        locale: "zh-CN"
      }
    });
    const sloNote = await tenantCapacityDataSources[
      "tenant.capacity.sloNote"
    ]?.query({
      params: {
        tenantId: "tenant-alpha",
        workspaceId: "prod",
        locale: "zh-CN"
      },
      runtime: {
        ...runtime,
        locale: "zh-CN"
      }
    });

    expect(cpuOutput?.label).toBe("CPU 已用");
    expect(filterOptions?.[0]).toEqual({
      label: "全部",
      value: "all",
      active: false
    });
    expect(filterOptions?.find((option) => option.value === "backend")).toMatchObject({
      active: true
    });
    expect(sloNote?.content).toBe("容量请求处于租户安全边界内。");
  });

  it("merges dashboard-owned locale resources into host messages", () => {
    const t = createTranslator({
      locale: "zh-CN",
      fallbackLocale: "en-US",
      messages
    });

    expect(t("dashboard.tenantCapacity.name")).toBe("租户容量");
  });
});
