import { z } from "zod";

export type SchemaSummary =
  | { kind: "string"; optional?: boolean; defaultValue?: unknown }
  | { kind: "number"; optional?: boolean; defaultValue?: unknown }
  | { kind: "boolean"; optional?: boolean; defaultValue?: unknown }
  | { kind: "null"; optional?: boolean; defaultValue?: unknown }
  | {
      kind: "array";
      element: SchemaSummary;
      optional?: boolean;
      defaultValue?: unknown;
    }
  | {
      kind: "object";
      fields: Record<string, SchemaSummary>;
      unknownKeys?: "strict" | "strip" | "passthrough";
      optional?: boolean;
      defaultValue?: unknown;
    }
  | {
      kind: "record";
      value: SchemaSummary;
      optional?: boolean;
      defaultValue?: unknown;
    }
  | {
      kind: "union";
      options: SchemaSummary[];
      optional?: boolean;
      defaultValue?: unknown;
    }
  | {
      kind: "enum";
      values: string[];
      optional?: boolean;
      defaultValue?: unknown;
    }
  | {
      kind: "literal";
      value: string | number | boolean | null;
      optional?: boolean;
      defaultValue?: unknown;
    }
  | { kind: "unknown"; optional?: boolean; defaultValue?: unknown };

export function summarizeZodSchema(schema: z.ZodTypeAny): SchemaSummary {
  return summarize(schema);
}

function summarize(schema: z.ZodTypeAny): SchemaSummary {
  if (schema instanceof z.ZodDefault) {
    return withDefault(
      summarize(schema.removeDefault()),
      schema._def.defaultValue()
    );
  }

  if (schema instanceof z.ZodOptional) {
    return withOptional(summarize(schema.unwrap()));
  }

  if (schema instanceof z.ZodNullable) {
    return {
      kind: "union",
      options: [summarize(schema.unwrap()), { kind: "null" }]
    };
  }

  if (schema instanceof z.ZodString) {
    return { kind: "string" };
  }

  if (schema instanceof z.ZodNumber) {
    return { kind: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { kind: "boolean" };
  }

  if (schema instanceof z.ZodNull) {
    return { kind: "null" };
  }

  if (schema instanceof z.ZodLiteral) {
    return {
      kind: "literal",
      value: schema.value as string | number | boolean | null
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      kind: "enum",
      values: schema.options
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      kind: "array",
      element: summarize(schema.element)
    };
  }

  if (schema instanceof z.ZodRecord) {
    return {
      kind: "record",
      value: summarize(schema.valueSchema)
    };
  }

  if (schema instanceof z.ZodObject) {
    const fields = Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => [
        key,
        summarize(value as z.ZodTypeAny)
      ])
    );

    return {
      kind: "object",
      fields,
      unknownKeys: schema._def.unknownKeys
    };
  }

  if (schema instanceof z.ZodUnion) {
    return {
      kind: "union",
      options: schema.options.map((option: z.ZodTypeAny) => summarize(option))
    };
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    return {
      kind: "union",
      options: Array.from(schema.options.values()).map((option) =>
        summarize(option as z.ZodTypeAny)
      )
    };
  }

  return { kind: "unknown" };
}

function withOptional(summary: SchemaSummary): SchemaSummary {
  return {
    ...summary,
    optional: true
  };
}

function withDefault(
  summary: SchemaSummary,
  defaultValue: unknown
): SchemaSummary {
  return {
    ...summary,
    defaultValue
  };
}
