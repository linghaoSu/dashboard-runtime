export type LayoutPresetCatalogItem = {
  key: string;
  name: string;
  description?: string;
  rationale?: string;
  canvas: {
    width: number;
    height: number;
    scaleMode: "fit" | "fill" | "scroll";
  };
  grid?: {
    margin: number;
    gutter: number;
    columns?: number;
  };
  slots: Array<{
    key: string;
    x: number;
    y: number;
    w: number;
    h: number;
    recommendedCategories?: string[];
  }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
  };
  designEvidence?: {
    source: string;
    principles: string[];
  };
};

export const defaultLayoutCatalog: LayoutPresetCatalogItem[] = [
  {
    key: "overview-3-kpi-chart-table",
    name: "Overview KPI + Chart + Table",
    description: "Three KPI slots above one trend chart and one table/list slot",
    rationale:
      "Prioritizes KPI scanning, then gives the primary trend chart a dominant slot with a side detail panel.",
    canvas: {
      width: 1920,
      height: 1080,
      scaleMode: "fit"
    },
    grid: {
      margin: 40,
      gutter: 40,
      columns: 12
    },
    slots: [
      { key: "kpi-1", x: 40, y: 40, w: 420, h: 180, recommendedCategories: ["metric"] },
      { key: "kpi-2", x: 500, y: 40, w: 420, h: 180, recommendedCategories: ["metric"] },
      { key: "kpi-3", x: 960, y: 40, w: 420, h: 180, recommendedCategories: ["metric"] },
      { key: "main-chart", x: 40, y: 260, w: 1180, h: 500, recommendedCategories: ["chart"] },
      { key: "side-list", x: 1260, y: 260, w: 620, h: 500, recommendedCategories: ["table"] }
    ],
    aiHints: {
      goodFor: ["cluster overview", "resource monitoring", "operations status"],
      notGoodFor: ["map-first dashboards", "single full-screen chart"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["top-row KPIs", "dominant primary chart", "aligned widget edges"]
    }
  },
  {
    key: "map-with-side-panel",
    name: "Map With Side Panel",
    description: "Large map/coordinate chart with a narrow side list",
    rationale:
      "Keeps the spatial view dominant while reserving a stable side slot for selected-region context.",
    canvas: {
      width: 1920,
      height: 1080,
      scaleMode: "fit"
    },
    grid: {
      margin: 40,
      gutter: 40,
      columns: 12
    },
    slots: [
      { key: "map", x: 40, y: 40, w: 1240, h: 820, recommendedCategories: ["chart"] },
      { key: "side-panel", x: 1320, y: 40, w: 560, h: 820, recommendedCategories: ["table", "metric"] }
    ],
    aiHints: {
      goodFor: ["regional status", "site monitoring", "coordinate data"],
      notGoodFor: ["pure KPI dashboards"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["dominant primary chart", "side detail panel", "stable geometry"]
    }
  },
  {
    key: "tenant-ops-command",
    name: "Tenant Ops Command",
    description: "Filter band, status note, KPI row, alerts, and full-width diagnostic chart",
    rationale:
      "Optimized for product operations dashboards where filtering and status context precede diagnostics.",
    canvas: {
      width: 1440,
      height: 900,
      scaleMode: "fit"
    },
    grid: {
      margin: 32,
      gutter: 32,
      columns: 12
    },
    slots: [
      { key: "filter-band", x: 32, y: 28, w: 760, h: 88, recommendedCategories: ["filter"] },
      { key: "status-note", x: 820, y: 28, w: 588, h: 88, recommendedCategories: ["status"] },
      { key: "kpi-1", x: 32, y: 148, w: 320, h: 188, recommendedCategories: ["metric"] },
      { key: "kpi-2", x: 384, y: 148, w: 320, h: 188, recommendedCategories: ["metric"] },
      { key: "alerts", x: 736, y: 148, w: 672, h: 188, recommendedCategories: ["list"] },
      { key: "primary-chart", x: 32, y: 372, w: 1376, h: 464, recommendedCategories: ["chart"] }
    ],
    aiHints: {
      goodFor: ["tenant capacity", "SLO status", "product operations"],
      notGoodFor: ["map-first dashboards", "dense BI tables"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["filter band first", "KPI scan row", "full-width diagnostic chart"]
    }
  },
  {
    key: "ipavo-console-overview",
    name: "Ipavo Console Overview",
    description:
      "Light product-console grid with pod statistics, compact trends, health, alerts, resource usage, and feature overview",
    rationale:
      "Matches the ipavo reference dashboard shape: fast first-row scanning, two compact trend cards, health and alert status to the right, then cluster/resource/feature detail across a second row.",
    canvas: {
      width: 1920,
      height: 760,
      scaleMode: "fit"
    },
    grid: {
      margin: 24,
      gutter: 16,
      columns: 4
    },
    slots: [
      {
        key: "pod-statistics",
        x: 24,
        y: 20,
        w: 456,
        h: 318,
        recommendedCategories: ["metric", "layout"]
      },
      {
        key: "cpu-usage",
        x: 496,
        y: 20,
        w: 456,
        h: 146,
        recommendedCategories: ["chart"]
      },
      {
        key: "memory-usage",
        x: 496,
        y: 192,
        w: 456,
        h: 146,
        recommendedCategories: ["chart"]
      },
      {
        key: "health-status",
        x: 968,
        y: 20,
        w: 456,
        h: 318,
        recommendedCategories: ["metric", "layout"]
      },
      {
        key: "alert-status",
        x: 1440,
        y: 20,
        w: 456,
        h: 318,
        recommendedCategories: ["list", "metric"]
      },
      {
        key: "cluster-count",
        x: 24,
        y: 388,
        w: 456,
        h: 320,
        recommendedCategories: ["table", "layout"]
      },
      {
        key: "resource-usage",
        x: 496,
        y: 388,
        w: 928,
        h: 320,
        recommendedCategories: ["chart", "metric"]
      },
      {
        key: "ability-overview",
        x: 1440,
        y: 388,
        w: 456,
        h: 320,
        recommendedCategories: ["list", "layout"]
      }
    ],
    aiHints: {
      goodFor: ["ipavo overview", "container overview", "product console health dashboard"],
      notGoodFor: ["single KPI page", "map-first dashboards", "long BI tables"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["ipavo reference grid", "compact trend cards", "status panels on the right"]
    }
  }
];

export function createLayoutCatalog(
  layouts: LayoutPresetCatalogItem[] = defaultLayoutCatalog
): LayoutPresetCatalogItem[] {
  return layouts.map((layout) => ({
    ...layout,
    canvas: {
      ...layout.canvas
    },
    grid: layout.grid
      ? {
          ...layout.grid
        }
      : undefined,
    slots: layout.slots.map((slot) => ({
      ...slot,
      recommendedCategories: slot.recommendedCategories
        ? [...slot.recommendedCategories]
        : undefined
    })),
    aiHints: layout.aiHints,
    designEvidence: layout.designEvidence
      ? {
          source: layout.designEvidence.source,
          principles: [...layout.designEvidence.principles]
        }
      : undefined
  }));
}
