import { describe, expect, it } from "vitest";
import { createTranslator, mergeLocaleMessages } from "../i18n-runtime.js";

describe("mergeLocaleMessages", () => {
  it("merges dashboard locale messages into project messages per locale", () => {
    expect(
      mergeLocaleMessages(
        {
          "en-US": {
            app: {
              name: "Demo"
            },
            shared: {
              ok: "OK"
            },
            dashboard: {
              existing: "Project dashboard message"
            }
          }
        },
        {
          "en-US": {
            dashboard: {
              cluster: {
                name: "Cluster"
              }
            }
          },
          "zh-CN": {
            dashboard: {
              cluster: {
                name: "集群"
              }
            }
          }
        }
      )
    ).toEqual({
      "en-US": {
        app: {
          name: "Demo"
        },
        shared: {
          ok: "OK"
        },
        dashboard: {
          existing: "Project dashboard message",
          cluster: {
            name: "Cluster"
          }
        }
      },
      "zh-CN": {
        dashboard: {
          cluster: {
            name: "集群"
          }
        }
      }
    });
  });
});

describe("createTranslator", () => {
  it("reads merged messages and falls back to the key", () => {
    const t = createTranslator({
      locale: "en-US",
      messages: mergeLocaleMessages({
        "en-US": {
          hello: "Hello {name}",
          dashboard: {
            cluster: {
              name: "Cluster"
            }
          }
        }
      })
    });

    expect(t("hello", { name: "Dashboard" })).toBe("Hello Dashboard");
    expect(t("dashboard.cluster.name")).toBe("Cluster");
    expect(t("missing")).toBe("missing");
  });
});
