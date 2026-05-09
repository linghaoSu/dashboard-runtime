import type { DataSourceRegistry } from "@dao-style-viz/ai-dashboard-runtime";
import { summarizeZodSchema, type SchemaSummary } from "./schema-summary.js";

export type DataSourceCatalogItem = {
  key: string;
  name: string;
  description?: string;
  category?: string;
  paramsSchema: SchemaSummary;
  outputSchema: SchemaSummary;
  compatibleWidgets?: string[];
  examples?: Array<{
    params: unknown;
    output: unknown;
  }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredWidgets?: string[];
  };
  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
  dependsOnLocale?: boolean;
};

export function createDataSourceCatalog(
  registry: DataSourceRegistry
): DataSourceCatalogItem[] {
  return Object.entries(registry).map(([key, definition]) => ({
    key,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    paramsSchema: summarizeZodSchema(definition.paramsSchema),
    outputSchema: summarizeZodSchema(definition.outputSchema),
    compatibleWidgets: definition.compatibleWidgets,
    examples: definition.examples,
    aiHints: definition.aiHints,
    i18n: definition.i18n,
    dependsOnLocale: definition.dependsOnLocale
  }));
}
