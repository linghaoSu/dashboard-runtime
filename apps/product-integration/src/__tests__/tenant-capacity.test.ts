import { createTranslator } from "@dao-style-viz/ai-dashboard-runtime";
import { describe, expect, it } from "vitest";
import { tenantCapacityDataSources } from "../data-sources/tenant-capacity";
import { tenantCapacityValidation } from "../dashboard-validation";
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
