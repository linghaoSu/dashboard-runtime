export type ThemeCatalogItem = {
  key: string;
  name: string;
  description?: string;
  tokens: Record<string, string | number>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
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
      danger: "#ef4444"
    },
    aiHints: {
      goodFor: ["NOC dashboards", "security operations", "cluster monitoring"],
      notGoodFor: ["print reports", "dense white-background admin forms"]
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
      danger: "#dc2626"
    },
    aiHints: {
      goodFor: ["product overview pages", "operator workspaces"],
      notGoodFor: ["large wall screens in dark rooms"]
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
    aiHints: theme.aiHints
  }));
}
