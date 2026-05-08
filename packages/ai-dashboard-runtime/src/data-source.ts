import type { z } from "zod";
import type { RuntimeContext } from "./renderer-adapter.js";

export type DataSourceQueryContext<TParams = unknown> = {
  params: TParams;
  runtime: RuntimeContext;
  signal?: AbortSignal;
};

export type DataSourceDefinition<TParams, TOutput> = {
  name: string;
  description?: string;
  category?: string;
  paramsSchema: z.ZodSchema<TParams>;
  outputSchema: z.ZodSchema<TOutput>;
  compatibleWidgets?: string[];
  examples?: Array<{
    params: TParams;
    output: TOutput;
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
  query: (ctx: DataSourceQueryContext<TParams>) => Promise<TOutput>;
};

export type DataSourceRegistry = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataSourceDefinition<any, any>
>;

export type CreateSdkDataSourceOptions<
  TParams,
  TRequest,
  TResponse,
  TOutput
> = Omit<DataSourceDefinition<TParams, TOutput>, "query"> & {
  request: (
    params: TParams,
    ctx: DataSourceQueryContext<TParams>
  ) => TRequest;
  call: (
    request: TRequest,
    ctx: DataSourceQueryContext<TParams>
  ) => Promise<TResponse>;
  transform: (
    response: TResponse,
    ctx: DataSourceQueryContext<TParams>
  ) => TOutput;
};

export function defineDataSources<T extends DataSourceRegistry>(sources: T): T {
  return sources;
}

export function createSdkDataSource<
  TParams,
  TRequest,
  TResponse,
  TOutput
>(
  options: CreateSdkDataSourceOptions<TParams, TRequest, TResponse, TOutput>
): DataSourceDefinition<TParams, TOutput> {
  return {
    name: options.name,
    description: options.description,
    category: options.category,
    paramsSchema: options.paramsSchema,
    outputSchema: options.outputSchema,
    compatibleWidgets: options.compatibleWidgets,
    examples: options.examples,
    aiHints: options.aiHints,
    i18n: options.i18n,
    dependsOnLocale: options.dependsOnLocale,
    async query(ctx) {
      const params = options.paramsSchema.parse(ctx.params);
      const typedContext: DataSourceQueryContext<TParams> = {
        ...ctx,
        params
      };
      const request = options.request(params, typedContext);
      const response = await options.call(request, typedContext);
      const output = options.transform(response, typedContext);
      return options.outputSchema.parse(output);
    }
  };
}
