import { z } from "zod";

export type LocaleCode = string;

export type ConfigRef = {
  $ref: string;
};

export type ConfigPrimitive = string | number | boolean | null;

export type ConfigValue =
  | ConfigPrimitive
  | ConfigRef
  | ConfigValue[]
  | { [key: string]: ConfigValue };

export type I18nText =
  | string
  | {
      key: string;
      defaultMessage?: string;
      values?: Record<string, ConfigValue>;
    };

export const localeCodeSchema = z.string().min(1);

export const configRefSchema = z
  .object({
    $ref: z.string().min(1)
  })
  .strict();

const configPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null()
]);

export const configValueSchema: z.ZodType<ConfigValue> = z.lazy(() =>
  z.union([
    configRefSchema,
    configPrimitiveSchema,
    z.array(configValueSchema),
    z.record(configValueSchema).superRefine((value, ctx) => {
      if (Object.prototype.hasOwnProperty.call(value, "$ref")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Objects containing "$ref" must be config refs only'
        });
      }
    })
  ])
);

export const i18nTextSchema: z.ZodType<I18nText> = z.union([
  z.string(),
  z
    .object({
      key: z.string().min(1),
      defaultMessage: z.string().optional(),
      values: z.record(configValueSchema).optional()
    })
    .strict()
]);
