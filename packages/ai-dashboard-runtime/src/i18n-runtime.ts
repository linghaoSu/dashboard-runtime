import type { I18nText } from "@dao-style-viz/ai-dashboard-schema";
import type { RuntimeInput } from "./renderer-adapter.js";

export type RuntimeTranslator = (
  key: string,
  values?: Record<string, unknown>
) => string;

export function createTranslator(runtime: RuntimeInput): RuntimeTranslator {
  return (key, values) => {
    const translated = runtime.t?.(key, values);

    if (translated && translated !== key) {
      return translated;
    }

    const message =
      runtime.messages?.[runtime.locale]?.[key] ??
      runtime.messages?.[runtime.fallbackLocale ?? ""]?.[key] ??
      translated ??
      key;

    return interpolate(message, values);
  };
}

export function resolveI18nText(
  text: I18nText | undefined,
  t: RuntimeTranslator
): string | undefined {
  if (text === undefined) {
    return undefined;
  }

  if (typeof text === "string") {
    return text;
  }

  const translated = t(text.key, text.values);
  if (translated === text.key && text.defaultMessage) {
    return interpolate(text.defaultMessage, text.values);
  }

  return translated;
}

function interpolate(
  message: string,
  values: Record<string, unknown> | undefined
): string {
  if (!values) {
    return message;
  }

  return message.replace(/\{([^}]+)\}/g, (_, key: string) =>
    values[key] === undefined ? `{${key}}` : String(values[key])
  );
}
