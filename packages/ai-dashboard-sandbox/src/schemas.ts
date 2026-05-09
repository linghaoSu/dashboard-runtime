import { z } from "zod";

const packageNameSchema = z
  .string()
  .min(1)
  .regex(/^(?:@[a-z0-9-_.]+\/)?[a-z0-9-_.]+$/u);

const relativeFileSchema = z
  .string()
  .min(1)
  .refine((value) => !value.startsWith("/") && !value.includes(".."), {
    message: "File paths must be package-relative and cannot contain '..'"
  });

export const generatedChartManifestSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  id: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/u),
  widgetType: z.string().min(1).regex(/^[A-Z][A-Za-z0-9]*$/u),
  name: z.string().min(1),
  description: z.string().optional(),
  chartEngine: z.literal("echarts").default("echarts"),
  entry: relativeFileSchema.default("src/Chart.vue"),
  sampleDataFile: relativeFileSchema.default("sample-data.json"),
  propsSchemaFile: relativeFileSchema.optional(),
  dependencies: z.record(packageNameSchema, z.string().min(1)).default({}),
  peerDependencies: z.record(packageNameSchema, z.string().min(1)).default({}),
  files: z.array(relativeFileSchema).min(1)
}).strict();

export const generatedChartPackageJsonSchema = z.object({
  name: packageNameSchema,
  version: z.string().optional(),
  type: z.literal("module").optional(),
  dependencies: z.record(packageNameSchema, z.string().min(1)).default({}),
  peerDependencies: z.record(packageNameSchema, z.string().min(1)).default({}),
  devDependencies: z.record(packageNameSchema, z.string().min(1)).default({}),
  scripts: z
    .object({
      typecheck: z.string().optional(),
      lint: z.string().optional(),
      build: z.string().optional()
    })
    .strict()
    .default({})
}).strict();

export const generatedChartFileMapSchema = z
  .record(relativeFileSchema, z.string())
  .refine((files) => Object.keys(files).length > 0, {
    message: "Generated chart package must include at least one file"
  });

export const generatedChartPackageSchema = z.object({
  manifest: generatedChartManifestSchema,
  packageJson: generatedChartPackageJsonSchema,
  files: generatedChartFileMapSchema
}).strict();

export type GeneratedChartManifest = z.infer<
  typeof generatedChartManifestSchema
>;
export type GeneratedChartPackageJson = z.infer<
  typeof generatedChartPackageJsonSchema
>;
export type GeneratedChartFileMap = z.infer<
  typeof generatedChartFileMapSchema
>;
export type GeneratedChartPackage = z.infer<
  typeof generatedChartPackageSchema
>;
