import type { I18nText } from "@dao-style-viz/ai-dashboard-schema";
import type { RuntimeInput } from "./renderer-adapter.js";

export type LocaleMessage =
  | string
  | number
  | boolean
  | null
  | LocaleMessageObject
  | LocaleMessage[];

export type LocaleMessageObject = {
  [key: string]: LocaleMessage;
};

export type LocaleMessages = Record<string, LocaleMessageObject>;

export type RuntimeTranslator = (
  key: string,
  values?: Record<string, unknown>
) => string;

export function mergeLocaleMessages(
  ...sources: Array<LocaleMessages | undefined>
): LocaleMessages {
  return sources.reduce<LocaleMessages>((merged, source) => {
    if (!source) {
      return merged;
    }

    Object.entries(source).forEach(([locale, messages]) => {
      merged[locale] = mergeLocaleMessageObject(merged[locale], messages);
    });

    return merged;
  }, {});
}

export function createTranslator(runtime: RuntimeInput): RuntimeTranslator {
  return (key, values) => {
    const translated = runtime.t?.(key, values);

    if (translated && translated !== key) {
      return translated;
    }

    const message =
      lookupMessage(runtime.messages?.[runtime.locale], key) ??
      lookupMessage(runtime.messages?.[runtime.fallbackLocale ?? ""], key) ??
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

function mergeLocaleMessageObject(
  base: LocaleMessageObject | undefined,
  override: LocaleMessageObject
): LocaleMessageObject {
  const merged: LocaleMessageObject = { ...(base ?? {}) };

  Object.entries(override).forEach(([key, value]) => {
    const current = merged[key];

    if (isLocaleMessageObject(current) && isLocaleMessageObject(value)) {
      merged[key] = mergeLocaleMessageObject(current, value);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

function lookupMessage(
  messages: LocaleMessageObject | undefined,
  key: string
): string | undefined {
  const exactMatch = messages?.[key];
  if (typeof exactMatch === "string") {
    return exactMatch;
  }

  const nestedMatch = key.split(".").reduce<LocaleMessage | undefined>(
    (current, segment) => {
      if (!isLocaleMessageObject(current)) {
        return undefined;
      }

      return current[segment];
    },
    messages
  );

  return typeof nestedMatch === "string" ? nestedMatch : undefined;
}

function isLocaleMessageObject(
  value: LocaleMessage | undefined
): value is LocaleMessageObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
