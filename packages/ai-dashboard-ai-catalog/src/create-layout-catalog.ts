export type LayoutPresetCatalogItem = {
  key: string;
  name: string;
  description?: string;
  canvas: {
    width: number;
    height: number;
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
};

export const defaultLayoutCatalog: LayoutPresetCatalogItem[] = [
  {
    key: "overview-3-kpi-chart-table",
    name: "Overview KPI + Chart + Table",
    description: "Three KPI slots above one trend chart and one table/list slot",
    canvas: {
      width: 1920,
      height: 1080
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
    }
  },
  {
    key: "map-with-side-panel",
    name: "Map With Side Panel",
    description: "Large map/coordinate chart with a narrow side list",
    canvas: {
      width: 1920,
      height: 1080
    },
    slots: [
      { key: "map", x: 40, y: 40, w: 1240, h: 820, recommendedCategories: ["chart"] },
      { key: "side-panel", x: 1320, y: 40, w: 560, h: 820, recommendedCategories: ["table", "metric"] }
    ],
    aiHints: {
      goodFor: ["regional status", "site monitoring", "coordinate data"],
      notGoodFor: ["pure KPI dashboards"]
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
    slots: layout.slots.map((slot) => ({
      ...slot,
      recommendedCategories: slot.recommendedCategories
        ? [...slot.recommendedCategories]
        : undefined
    })),
    aiHints: layout.aiHints
  }));
}
