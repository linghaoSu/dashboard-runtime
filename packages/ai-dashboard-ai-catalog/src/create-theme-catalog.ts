export type ThemeCatalogItem = {
  key: string;
  name: string;
  description?: string;
  tokens: Record<string, string | number>;
  chartPalette: string[];
  paletteAlternates?: Array<{
    key: string;
    name: string;
    colors: string[];
    goodFor?: string[];
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

export const defaultThemeCatalog: ThemeCatalogItem[] = [
  {
    key: "dao-dark",
    name: "Dao Dark",
    description: "Dark operational dashboard theme with cyan primary accents",
    tokens: {
      background: "#111827",
      surface: "#0f172a",
      text: "#dbeafe",
      primary: "#38bdf8",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      accent: "#a78bfa",
      axis: "rgba(148, 163, 184, 0.35)",
      grid: "rgba(148, 163, 184, 0.14)"
    },
    chartPalette: [
      "#38bdf8",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a78bfa",
      "#14b8a6",
      "#f472b6",
      "#eab308"
    ],
    paletteAlternates: [
      {
        key: "aurora-contrast",
        name: "Aurora Contrast",
        colors: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#fb7185",
          "#c084fc",
          "#2dd4bf",
          "#f97316",
          "#a3e635"
        ],
        goodFor: ["many categories", "dark dashboards", "high contrast"]
      },
      {
        key: "capacity-signal",
        name: "Capacity Signal",
        colors: [
          "#0ea5e9",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#84cc16",
          "#f43f5e"
        ],
        goodFor: ["capacity", "SLO", "resource pressure"]
      }
    ],
    aiHints: {
      goodFor: ["NOC dashboards", "security operations", "cluster monitoring"],
      notGoodFor: ["print reports", "dense white-background admin forms"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["mixed hue families", "stable status colors", "dark dashboard contrast"]
    }
  },
  {
    key: "dao-light",
    name: "Dao Light",
    description: "Light dashboard theme for embedded product pages",
    tokens: {
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      primary: "#0284c7",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      accent: "#7c3aed",
      axis: "rgba(71, 85, 105, 0.38)",
      grid: "rgba(148, 163, 184, 0.22)"
    },
    chartPalette: [
      "#2563eb",
      "#059669",
      "#d97706",
      "#dc2626",
      "#7c3aed",
      "#0891b2",
      "#db2777",
      "#65a30d"
    ],
    paletteAlternates: [
      {
        key: "product-light",
        name: "Product Light",
        colors: [
          "#2563eb",
          "#059669",
          "#d97706",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
          "#db2777",
          "#65a30d"
        ],
        goodFor: ["embedded product pages", "light backgrounds"]
      }
    ],
    aiHints: {
      goodFor: ["product overview pages", "operator workspaces"],
      notGoodFor: ["large wall screens in dark rooms"]
    },
    designEvidence: {
      source: "docs/design.md",
      principles: ["light dashboard contrast", "mixed hue families", "stable status colors"]
    }
  }
];

export function createThemeCatalog(
  themes: ThemeCatalogItem[] = defaultThemeCatalog
): ThemeCatalogItem[] {
  return themes.map((theme) => ({
    key: theme.key,
    name: theme.name,
    description: theme.description,
    tokens: {
      ...theme.tokens
    },
    chartPalette: [...theme.chartPalette],
    paletteAlternates: theme.paletteAlternates?.map((palette) => ({
      ...palette,
      colors: [...palette.colors],
      goodFor: palette.goodFor ? [...palette.goodFor] : undefined
    })),
    aiHints: theme.aiHints,
    designEvidence: theme.designEvidence
      ? {
          source: theme.designEvidence.source,
          principles: [...theme.designEvidence.principles]
        }
      : undefined
  }));
}
