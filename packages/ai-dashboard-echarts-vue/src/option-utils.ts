import type { LineChartDataItem } from "./schemas.js";

export function readDimension(
  item: LineChartDataItem,
  field: string
): string {
  const value = item[field];
  return value === undefined || value === null ? "" : String(value);
}

export function readMetric(item: LineChartDataItem, field: string): number {
  const value = item[field];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatWithUnit(
  value: unknown,
  unit: string | undefined,
  formatNumber: (value: number) => string
): string {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value ?? "");
  }

  return `${formatNumber(numericValue)}${unit ?? ""}`;
}
