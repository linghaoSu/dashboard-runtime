export function createFormatters(locale: string, timezone?: string) {
  return {
    number(value: number, options?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(locale, options).format(value);
    },

    percent(value: number, options?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 2,
        ...options
      }).format(value);
    },

    date(value: Date | string | number, options?: Intl.DateTimeFormatOptions) {
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        ...options
      }).format(new Date(value));
    }
  };
}
