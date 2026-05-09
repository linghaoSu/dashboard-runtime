export type I18nCatalogOptions = {
  namespace?: string;
  defaultLocale?: string;
  supportedLocales?: string[];
};

export type I18nCatalogItem = {
  namespace: string;
  defaultLocale: string;
  supportedLocales: string[];
  keyConvention: string;
  requiredResourceFiles: string[];
  aiHints: {
    rules: string[];
  };
};

export function createI18nCatalog(
  options: I18nCatalogOptions = {}
): I18nCatalogItem {
  const namespace = options.namespace ?? "dashboard";
  const defaultLocale = options.defaultLocale ?? "en-US";
  const supportedLocales = options.supportedLocales ?? [defaultLocale, "zh-CN"];

  return {
    namespace,
    defaultLocale,
    supportedLocales,
    keyConvention: `${namespace}.<dashboardId>.<section>.<name>`,
    requiredResourceFiles: supportedLocales.map((locale) => `${locale}.json`),
    aiHints: {
      rules: [
        "Use i18n key objects for all user-facing DashboardConfig text.",
        "Keep generated keys under the dashboard namespace.",
        "Generate adjacent locale JSON resources instead of embedding messages in DashboardConfig."
      ]
    }
  };
}
