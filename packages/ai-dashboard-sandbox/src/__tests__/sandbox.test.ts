import type { WidgetRegistry } from "@dao-style-viz/ai-dashboard-runtime";
import { describe, expect, it } from "vitest";
import { scanGeneratedChartAst } from "../ast-scan.js";
import {
  createGeneratedWidgetRegistry,
  GeneratedChartSandboxError
} from "../generated-registry.js";
import {
  evaluateGeneratedChartApprovalGate,
  validateGeneratedChartPackage
} from "../gate.js";
import { parseGeneratedChartPreviewMessage } from "../preview-contract.js";
import type { GeneratedChartPackage } from "../schemas.js";

describe("validateGeneratedChartPackage", () => {
  it("accepts a safe generated chart package and produces hook/preview contracts", () => {
    const result = validateGeneratedChartPackage(createSafePackage(), {
      packageDir: "/tmp/generated-chart"
    });

    expect(result.success).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.hookPlan.map((hook) => hook.name)).toEqual([
      "typecheck",
      "lint",
      "build"
    ]);
    expect(result.previewContract).toMatchObject({
      widgetType: "GeneratedLatencyChart",
      sandboxAttributes: ["allow-scripts"]
    });
  });

  it("rejects unapproved dependencies before generated widgets can register", () => {
    const result = validateGeneratedChartPackage(
      createSafePackage({
        packageJson: {
          dependencies: {
            axios: "^1.0.0"
          }
        }
      })
    );

    expect(result.success).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unapproved_dependency",
        packageName: "axios"
      })
    );
  });

  it("rejects package lifecycle scripts instead of stripping them", () => {
    const result = validateGeneratedChartPackage(
      createSafePackage({
        packageJson: {
          scripts: {
            typecheck: "vue-tsc --noEmit -p tsconfig.json",
            lint: "eslint \"src/**/*.{ts,vue}\"",
            build: "vite build",
            postinstall: "node steal-token.js"
          }
        } as unknown as Partial<GeneratedChartPackage["packageJson"]>
      })
    );

    expect(result.success).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_manifest"
      })
    );
  });

  it("rejects forbidden browser and network APIs in generated source", () => {
    const result = validateGeneratedChartPackage(
      createSafePackage({
        files: {
          "src/Chart.vue": `<script setup lang="ts">
fetch("/api/internal");
document.cookie = "token=bad";
</script>`
        }
      })
    );

    expect(result.success).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["forbidden_identifier", "forbidden_member"])
    );
  });

  it("rejects forbidden APIs inside Vue template expressions", () => {
    const result = validateGeneratedChartPackage(
      createSafePackage({
        files: {
          "src/Chart.vue": `<script setup lang="ts">
const label = "Latency";
</script>
<template>
  <button @click="fetch('/api/internal')">{{ window.location }}</button>
  <div v-if="document.cookie">{{ label }}</div>
</template>`
        }
      })
    );

    expect(result.success).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["forbidden_identifier", "forbidden_member"])
    );
  });

  it("rejects generated packages with missing sample data", () => {
    const generatedPackage = createSafePackage();
    delete generatedPackage.files["sample-data.json"];

    const result = validateGeneratedChartPackage(generatedPackage);

    expect(result.success).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "missing_sample_data"
      })
    );
  });
});

describe("scanGeneratedChartAst", () => {
  it("rejects non-allowlisted bare imports", () => {
    const issues = scanGeneratedChartAst({
      "src/Chart.ts": `import { debounce } from "lodash-es";
export const value = debounce(() => 1);`
    });

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "forbidden_import",
        file: "src/Chart.ts"
      })
    );
  });

  it("allows subpath imports from allowlisted packages", () => {
    expect(
      scanGeneratedChartAst({
        "src/Chart.ts": `import { LineChart } from "echarts/charts";
export const chart = LineChart;`
      })
    ).toEqual([]);
  });
});

describe("preview and registry gates", () => {
  it("parses the iframe preview message envelope", () => {
    expect(
      parseGeneratedChartPreviewMessage({
        type: "ai-dashboard.generated-chart.rendered",
        widgetType: "GeneratedLatencyChart"
      })
    ).toEqual({
      type: "ai-dashboard.generated-chart.rendered",
      widgetType: "GeneratedLatencyChart"
    });
  });

  it("keeps the generated widget registry disabled by default", () => {
    const gateResult = validateGeneratedChartPackage(createSafePackage());
    const widgets = createGeneratedWidgetRegistry({
      gateResult,
      widgets: generatedWidgets
    });

    expect(widgets).toEqual({});
  });

  it("requires validation, preview, hooks, and approval before registration", () => {
    const gateResult = validateGeneratedChartPackage(createSafePackage());
    const approved = evaluateGeneratedChartApprovalGate({
      validation: gateResult,
      previewRendered: true,
      approved: true,
      hookResults: [
        { name: "typecheck", success: true },
        { name: "lint", success: true },
        { name: "build", success: true }
      ]
    });

    expect(approved).toBe(true);
    expect(
      createGeneratedWidgetRegistry({
        enabled: true,
        approved,
        approvalGatePassed: approved,
        gateResult,
        widgets: generatedWidgets
      })
    ).toEqual(generatedWidgets);
  });

  it("throws if a caller enables generated widgets without approval", () => {
    const gateResult = validateGeneratedChartPackage(createSafePackage());

    expect(() =>
      createGeneratedWidgetRegistry({
        enabled: true,
        approved: false,
        approvalGatePassed: false,
        gateResult,
        widgets: generatedWidgets
      })
    ).toThrow(GeneratedChartSandboxError);
  });

  it("throws if a caller skips hook and preview approval gate results", () => {
    const gateResult = validateGeneratedChartPackage(createSafePackage());

    expect(() =>
      createGeneratedWidgetRegistry({
        enabled: true,
        approved: true,
        gateResult,
        widgets: generatedWidgets
      })
    ).toThrow(GeneratedChartSandboxError);
  });
});

const generatedWidgets = {
  GeneratedLatencyChart: {}
} as unknown as WidgetRegistry;

function createSafePackage(
  overrides: {
    packageJson?: Partial<GeneratedChartPackage["packageJson"]>;
    files?: Partial<GeneratedChartPackage["files"]>;
  } = {}
): GeneratedChartPackage {
  const safePackage: GeneratedChartPackage = {
    manifest: {
      schemaVersion: "1.0.0",
      id: "generated-latency-chart",
      widgetType: "GeneratedLatencyChart",
      name: "Generated Latency Chart",
      chartEngine: "echarts",
      entry: "src/Chart.vue",
      sampleDataFile: "sample-data.json",
      dependencies: {
        vue: "3.3.13",
        echarts: "^5.5.1"
      },
      peerDependencies: {},
      files: ["src/Chart.vue", "sample-data.json"]
    },
    packageJson: {
      name: "@generated/generated-latency-chart",
      version: "0.0.0",
      type: "module",
      dependencies: {
        vue: "3.3.13",
        echarts: "^5.5.1"
      },
      peerDependencies: {},
      devDependencies: {},
      scripts: {
        typecheck: "vue-tsc --noEmit -p tsconfig.json",
        lint: "eslint \"src/**/*.{ts,vue}\"",
        build: "vite build"
      },
      ...overrides.packageJson
    },
    files: {
      "src/Chart.vue": `<script setup lang="ts">
import { computed } from "vue";
const option = computed(() => ({ series: [{ type: "line", data: [1, 2, 3] }] }));
</script>
<template><div>{{ option.series.length }}</div></template>`,
      "sample-data.json": JSON.stringify([
        { time: "10:00", value: 120 },
        { time: "10:05", value: 180 }
      ]),
      ...overrides.files
    }
  };

  return safePackage;
}
