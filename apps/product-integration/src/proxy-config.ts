export type ProductApiProxyEnv = {
  PRODUCT_API_URL?: string;
  PRODUCT_AUTH_TOKEN?: string;
  PRODUCT_API_ALLOWED_HOSTS?: string;
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
  const rawTarget = env.PRODUCT_API_URL?.trim();
  if (!rawTarget) {
    return undefined;
  }

  const targetUrl = parseProductApiUrl(rawTarget);
  assertAllowedHost(targetUrl, env.PRODUCT_API_ALLOWED_HOSTS);

  const token = env.PRODUCT_AUTH_TOKEN?.trim();
  return {
    "/apis": {
      target: normalizeTarget(targetUrl),
      changeOrigin: true,
      secure: targetUrl.protocol === "https:",
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined
    }
  };
}

export function redactProductApiProxyEnv(env: ProductApiProxyEnv) {
  return {
    PRODUCT_API_URL: env.PRODUCT_API_URL ? "[configured]" : "[unset]",
    PRODUCT_AUTH_TOKEN: env.PRODUCT_AUTH_TOKEN ? "[redacted]" : "[unset]",
    PRODUCT_API_ALLOWED_HOSTS: env.PRODUCT_API_ALLOWED_HOSTS ? "[configured]" : "[unset]"
  };
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
    return;
  }

  if (!allowedHosts.includes(targetUrl.host)) {
    throw new Error(`PRODUCT_API_URL host is not allowlisted: ${targetUrl.host}`);
  }
}

function normalizeTarget(targetUrl: URL): string {
  const normalized = targetUrl.toString();
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}
