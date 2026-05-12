export type ProductApiProxyEnv = {
  PRODUCT_API_URL?: string;
  PRODUCT_AUTH_TOKEN?: string;
  PRODUCT_API_ALLOWED_HOSTS?: string;
  PRODUCT_API_INSECURE_TLS?: string;
};

export type ProductApiProxyConfig = {
  "/apis": {
    target: string;
    changeOrigin: true;
    secure: boolean;
    headers?: {
      Authorization: string;
    };
  };
};

export function createProductApiProxyConfig(
  env: ProductApiProxyEnv
): ProductApiProxyConfig | undefined {
  const resolvedEnv = resolveProductApiProxyEnv(env);
  const rawTarget = resolvedEnv.apiUrl;
  if (!rawTarget) {
    return undefined;
  }

  const targetUrl = parseProductApiUrl(rawTarget);
  assertAllowedHost(targetUrl, resolvedEnv.allowedHosts);

  const token = resolvedEnv.authToken;
  return {
    "/apis": {
      target: normalizeTarget(targetUrl),
      changeOrigin: true,
      secure: targetUrl.protocol === "https:" && !resolvedEnv.insecureTls,
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined
    }
  };
}

export function redactProductApiProxyEnv(env: ProductApiProxyEnv) {
  const resolvedEnv = resolveProductApiProxyEnv(env);
  const authTokenStatus = resolvedEnv.authToken ? "[redacted]" : "[unset]";

  return {
    PRODUCT_API_URL: resolvedEnv.apiUrl ? "[configured]" : "[unset]",
    PRODUCT_AUTH_TOKEN: authTokenStatus,
    PRODUCT_API_ALLOWED_HOSTS: resolvedEnv.allowedHosts ? "[configured]" : "[unset]"
  };
}

function resolveProductApiProxyEnv(env: ProductApiProxyEnv) {
  return {
    apiUrl: readFirstEnv(env, ["PRODUCT_API_URL"]),
    authToken: readSecretEnv(env, ["PRODUCT_AUTH_TOKEN"]),
    allowedHosts: readFirstEnv(env, ["PRODUCT_API_ALLOWED_HOSTS"]),
    insecureTls: readBooleanEnv(readFirstEnv(env, ["PRODUCT_API_INSECURE_TLS"]))
  };
}

function readFirstEnv(
  env: ProductApiProxyEnv,
  names: Array<keyof ProductApiProxyEnv>
) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function readSecretEnv(
  env: ProductApiProxyEnv,
  names: Array<keyof ProductApiProxyEnv>
) {
  const value = readFirstEnv(env, names);
  if (!value || ["<jwt>", "<paste-jwt-here>"].includes(value)) {
    return undefined;
  }

  return value;
}

function readBooleanEnv(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (["1", "true", "yes"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no"].includes(normalized)) {
    return false;
  }

  throw new Error(
    "PRODUCT_API_INSECURE_TLS must be one of 1, true, yes, 0, false, or no when configured"
  );
}

function parseProductApiUrl(rawTarget: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawTarget);
  } catch {
    throw new Error("PRODUCT_API_URL must be an absolute http(s) URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("PRODUCT_API_URL must use http or https");
  }

  return parsed;
}

function assertAllowedHost(targetUrl: URL, allowedHostsInput: string | undefined) {
  const allowedHosts = allowedHostsInput
    ?.split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  if (!allowedHosts?.length) {
    throw new Error("PRODUCT_API_ALLOWED_HOSTS is required when PRODUCT_API_URL is set");
  }

  if (!allowedHosts.includes(targetUrl.host)) {
    throw new Error(`PRODUCT_API_URL host is not allowlisted: ${targetUrl.host}`);
  }
}

function normalizeTarget(targetUrl: URL): string {
  const normalized = targetUrl.toString();
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}
