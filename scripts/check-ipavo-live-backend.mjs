#!/usr/bin/env node
const timeoutMs = readTimeoutMs(process.env.PRODUCT_API_TIMEOUT_MS);
const targetUrl = readRequiredUrl(process.env.PRODUCT_API_URL);
const token = readRequiredToken(process.env.PRODUCT_AUTH_TOKEN);

assertAllowedHost(targetUrl, process.env.PRODUCT_API_ALLOWED_HOSTS);

const checks = [
  {
    label: "ipavo version endpoint",
    path: readEndpointPath(
      process.env.PRODUCT_IPAVO_VERSION_PATH,
      "/apis/ipavo.io/v1alpha1/version",
      "PRODUCT_IPAVO_VERSION_PATH"
    ),
    validate: (body) => typeof body === "object" && body !== null
  },
  {
    label: "ipavo resource summary endpoint",
    path: readEndpointPath(
      process.env.PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH,
      "/apis/ipavo.io/v1alpha1/resource/summary",
      "PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH"
    ),
    validate: (body) =>
      typeof body === "object" &&
      body !== null &&
      ("clusterCount" in body || "nodeCount" in body || "podCount" in body)
  }
];

try {
  for (const check of checks) {
    await runEndpointCheck(check);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : "unknown live backend smoke failure");
}

async function runEndpointCheck(check) {
  const response = await fetchWithTimeout(new URL(check.path, targetUrl), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`${check.label} returned HTTP ${response.status}`);
  }

  const body = await response.json();
  if (!check.validate(body)) {
    throw new Error(`${check.label} returned an unexpected response shape`);
  }

  console.log(`PASS ${check.label}: ${targetUrl.protocol}//${targetUrl.host}`);
}

async function fetchWithTimeout(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function readRequiredUrl(rawUrl) {
  if (!rawUrl?.trim()) {
    fail("PRODUCT_API_URL is not configured");
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      fail("PRODUCT_API_URL must use http or https");
    }

    return url;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("PRODUCT_API_URL")) {
      throw error;
    }
    fail("PRODUCT_API_URL must be an absolute http(s) URL");
  }
}

function readRequiredToken(rawToken) {
  const trimmed = rawToken?.trim();
  if (!trimmed) {
    fail("PRODUCT_AUTH_TOKEN is not configured");
  }

  return trimmed;
}

function readTimeoutMs(rawTimeoutMs) {
  const timeout = Number(rawTimeoutMs ?? 10_000);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    fail("PRODUCT_API_TIMEOUT_MS must be a positive number when configured");
  }

  return timeout;
}

function readEndpointPath(rawPath, defaultPath, envName) {
  const path = rawPath?.trim() || defaultPath;
  if (!path.startsWith("/") || path.startsWith("//")) {
    fail(`${envName} must be a backend path that starts with a single "/"`);
  }

  return path;
}

function assertAllowedHost(url, rawAllowedHosts) {
  if (!rawAllowedHosts?.trim()) {
    fail("PRODUCT_API_ALLOWED_HOSTS is not configured");
  }

  const allowedHosts = rawAllowedHosts
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  if (!allowedHosts.includes(url.host)) {
    fail(`PRODUCT_API_ALLOWED_HOSTS does not include ${url.host}`);
  }
}

function fail(message) {
  console.error(`FAIL ipavo live backend smoke: ${message}`);
  console.error(
    [
      "Required env: PRODUCT_API_URL, PRODUCT_AUTH_TOKEN, PRODUCT_API_ALLOWED_HOSTS.",
      "Optional endpoint path env: PRODUCT_IPAVO_VERSION_PATH, PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH.",
      "Token and response bodies are intentionally never printed."
    ].join("\n")
  );
  process.exit(1);
}
