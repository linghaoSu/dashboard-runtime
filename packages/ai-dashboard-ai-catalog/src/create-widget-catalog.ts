import type { WidgetRegistry } from "@dao-style-viz/ai-dashboard-runtime";
import { summarizeZodSchema, type SchemaSummary } from "./schema-summary.js";

export type WidgetCatalogItem = {
  type: string;
  name: string;
  description?: string;
  category: string;
  framework: string;
  dataSchema: SchemaSummary;
  propsSchema: SchemaSummary;
  examples?: Array<{
    title: string;
    data: unknown;
    props: unknown;
  }>;
  aiHints?: {
    goodFor?: string[];
    notGoodFor?: string[];
    preferredDataShape?: string;
  };
  i18n?: {
    namespace?: string;
    labelKey?: string;
    descriptionKey?: string;
  };
};

export function createWidgetCatalog(registry: WidgetRegistry): WidgetCatalogItem[] {
  return Object.values(registry).map((definition) => ({
    type: definition.type,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    framework: definition.framework,
    dataSchema: summarizeZodSchema(definition.dataSchema),
    propsSchema: summarizeZodSchema(definition.propsSchema),
    examples: definition.examples,
    aiHints: definition.aiHints,
    i18n: definition.i18n
  }));
}
