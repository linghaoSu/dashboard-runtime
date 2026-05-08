import type { ConfigRef } from "@dao-style-viz/ai-dashboard-schema";
import { RefResolutionError } from "./errors.js";
import type { RefScope } from "./renderer-adapter.js";

export function isConfigRef(value: unknown): value is ConfigRef {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    "$ref" in value &&
    typeof (value as { $ref: unknown }).$ref === "string"
  );
}

export function resolveRefs<T>(value: T, scope: RefScope): T {
  if (isConfigRef(value)) {
    return getRefValue(value.$ref, scope) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item, scope)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveRefs(item, scope)])
    ) as T;
  }

  return value;
}

export function getRefValue(ref: string, scope: RefScope): unknown {
  const root = createRefRoot(scope);
  const segments = ref.split(".").filter(Boolean);
  let current: unknown = root;

  for (const segment of segments) {
    if (!isRecord(current) || !(segment in current)) {
      throw new RefResolutionError(ref);
    }

    current = current[segment];
  }

  return current;
}

function createRefRoot(scope: RefScope): Record<string, unknown> {
  return {
    runtime: scope.runtime,
    route: scope.runtime.route,
    user: scope.runtime.user,
    context: scope.context,
    globalFilters: scope.globalFilters
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && !Array.isArray(value);
}
