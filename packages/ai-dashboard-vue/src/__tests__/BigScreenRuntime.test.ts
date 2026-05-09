/* eslint-disable vue/one-component-per-file */
import type { DashboardConfig } from "@dao-style-viz/ai-dashboard-schema";
import {
  defineDataSources,
  defineWidget,
  type DataSourceRegistry,
  type RuntimeInput,
  type WidgetRegistry
} from "@dao-style-viz/ai-dashboard-runtime";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, markRaw, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import BigScreenRuntime from "../BigScreenRuntime.vue";

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

const actionWidget = defineWidget({
  type: "ActionButton",
  name: "Action Button",
  category: "filter",
  framework: "vue",
  component: markRaw(defineComponent({
    props: {
      id: {
        type: String,
        required: true
      },
      emit: {
        type: Function,
        required: true
      }
    },
    template:
      '<button class="refresh-button" @click="emit({ trigger: \'refresh\', sourceWidgetId: id })">Refresh</button>'
  })),
  dataSchema: z.object({
    ready: z.boolean()
  }),
  propsSchema: z.object({})
});

const countWidget = defineWidget({
  type: "CountWidget",
  name: "Count Widget",
  category: "metric",
  framework: "vue",
  component: markRaw(defineComponent({
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    template: '<output class="count-value">{{ data.count }}</output>'
  })),
  dataSchema: z.object({
    count: z.number()
  }),
  propsSchema: z.object({})
});

const widgets: WidgetRegistry = {
  ActionButton: actionWidget,
  CountWidget: countWidget
};

const baseConfig: DashboardConfig = {
  version: "1.0.0",
  canvas: {
    width: 320,
    height: 180,
    scaleMode: "fit",
    theme: "default"
  },
  widgets: []
};

describe("BigScreenRuntime", () => {
  it("routes refreshWidget events to the configured target widget only", async () => {
    let sourceCalls = 0;
    let targetCalls = 0;
    const dataSources = defineDataSources({
      "demo.action": {
        name: "Action",
        paramsSchema: z.object({}),
        outputSchema: z.object({
          ready: z.boolean()
        }),
        query: async () => {
          sourceCalls += 1;
          return { ready: true };
        }
      },
      "demo.count": {
        name: "Count",
        paramsSchema: z.object({}),
        outputSchema: z.object({
          count: z.number()
        }),
        query: async () => {
          targetCalls += 1;
          return { count: targetCalls };
        }
      }
    });

    const wrapper = mountRuntime({
      config: {
        ...baseConfig,
        widgets: [
          {
            id: "source",
            type: "ActionButton",
            layout: { x: 0, y: 0, w: 100, h: 80 },
            data: {
              source: "demo.action"
            },
            events: [
              {
                trigger: "refresh",
                action: "refreshWidget",
                target: "target"
              }
            ]
          },
          {
            id: "target",
            type: "CountWidget",
            layout: { x: 120, y: 0, w: 100, h: 80 },
            data: {
              source: "demo.count"
            }
          }
        ]
      },
      dataSources
    });

    await settle();
    expect(sourceCalls).toBe(1);
    expect(targetCalls).toBe(1);

    await wrapper.find(".refresh-button").trigger("click");
    await settle();

    expect(sourceCalls).toBe(1);
    expect(targetCalls).toBe(2);
    expect(wrapper.find(".count-value").text()).toBe("2");
  });

  it("reloads locale-dependent data when runtime locale changes", async () => {
    const seenLocales: string[] = [];
    const dataSources = defineDataSources({
      "demo.localeCount": {
        name: "Locale Count",
        dependsOnLocale: true,
        paramsSchema: z.object({
          locale: z.string()
        }),
        outputSchema: z.object({
          count: z.number()
        }),
        query: async ({ params }) => {
          seenLocales.push(params.locale);
          return { count: seenLocales.length };
        }
      }
    });

    const wrapper = mountRuntime({
      config: {
        ...baseConfig,
        widgets: [
          {
            id: "locale-target",
            type: "CountWidget",
            layout: { x: 0, y: 0, w: 100, h: 80 },
            data: {
              source: "demo.localeCount",
              params: {
                locale: { $ref: "runtime.locale" }
              }
            }
          }
        ]
      },
      dataSources,
      runtime: {
        locale: "en-US"
      }
    });

    await settle();
    expect(seenLocales).toEqual(["en-US"]);

    await wrapper.setProps({
      runtime: {
        locale: "zh-CN"
      }
    });
    await settle();

    expect(seenLocales).toEqual(["en-US", "zh-CN"]);
    expect(wrapper.find(".count-value").text()).toBe("2");
  });

  it("renders config validation details in development error mode", () => {
    const wrapper = mountRuntime({
      config: {
        version: "1.0.0",
        widgets: []
      } as unknown as DashboardConfig,
      dataSources: {},
      configErrorMode: "development"
    });

    expect(wrapper.find(".dao-runtime-error").attributes("role")).toBe("alert");
    expect(wrapper.find(".dao-runtime-error__title").text()).toBe(
      "Dashboard config validation failed"
    );
    expect(wrapper.find(".dao-runtime-error__details").exists()).toBe(true);
    expect(wrapper.text()).toContain("canvas");
  });

  it("hides config validation details in production error mode", () => {
    const wrapper = mountRuntime({
      config: {
        version: "1.0.0",
        widgets: []
      } as unknown as DashboardConfig,
      dataSources: {},
      configErrorMode: "production"
    });

    expect(wrapper.find(".dao-runtime-error").attributes("role")).toBe("alert");
    expect(wrapper.find(".dao-runtime-error__title").text()).toBe("Dashboard unavailable");
    expect(wrapper.find(".dao-runtime-error__details").exists()).toBe(false);
    expect(wrapper.text()).toContain(
      "The dashboard configuration is invalid. Contact the dashboard owner."
    );
    expect(wrapper.text()).not.toContain("canvas");
  });
});

function mountRuntime(options: {
  config: DashboardConfig;
  dataSources: DataSourceRegistry;
  runtime?: RuntimeInput;
  configErrorMode?: "development" | "production";
}) {
  return mount(BigScreenRuntime, {
    props: {
      config: options.config,
      dataSources: options.dataSources,
      widgets,
      runtime: options.runtime ?? {
        locale: "en-US"
      },
      configErrorMode: options.configErrorMode
    }
  });
}

async function settle() {
  await flushPromises();
  await nextTick();
  await flushPromises();
}
