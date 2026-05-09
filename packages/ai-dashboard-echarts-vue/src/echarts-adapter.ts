import type { DashboardTheme } from "@dao-style-viz/ai-dashboard-runtime";

export type EchartsInitOptions = {
  renderer: "canvas";
  locale: string;
};

export function createEchartsInitOptions(locale: string): EchartsInitOptions {
  return {
    renderer: "canvas",
    locale: normalizeEchartsLocale(locale)
  };
}

export const defaultEchartsPalette = [
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
  "#f472b6",
  "#eab308"
];

export function createEchartsPalette(
  theme: DashboardTheme,
  overridePalette?: string[]
): string[] {
  if (overridePalette?.length) {
    return [...overridePalette];
  }

  if (theme.palette?.length) {
    return [...theme.palette];
  }

  return [
    theme.colors?.primary ?? "#38bdf8",
    theme.colors?.success ?? "#22c55e",
    theme.colors?.warning ?? "#f59e0b",
    theme.colors?.danger ?? "#ef4444",
    theme.colors?.accent ?? "#a78bfa",
    ...defaultEchartsPalette.slice(5)
  ];
}

export function createEchartsTextStyle(theme: DashboardTheme) {
  return {
    color: theme.colors?.text ?? "#dbeafe",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  };
}

export function createEchartsAxisStyle(theme: DashboardTheme) {
  const textStyle = createEchartsTextStyle(theme);
  return {
    axisLabel: textStyle,
    axisLine: {
      lineStyle: {
        color: theme.colors?.axis ?? "rgba(148, 163, 184, 0.35)"
      }
    },
    splitLine: {
      lineStyle: {
        color: theme.colors?.grid ?? "rgba(148, 163, 184, 0.14)"
      }
    }
  };
}

function normalizeEchartsLocale(locale: string): string {
  if (locale.toLowerCase().startsWith("zh")) {
    return "ZH";
  }

  return "EN";
}
