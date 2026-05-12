#!/usr/bin/env node
import http from "node:http";
import https from "node:https";
import { readFileSync } from "node:fs";
import {
  isResourceSummary,
  isVersionInfo
} from "./ipavo-live-backend-shape.mjs";

const env = readMergedEnv(process.env);
const liveEnv = readLiveEnv(env);
const timeoutMs = readTimeoutMs(env.PRODUCT_API_TIMEOUT_MS);
const targetUrl = readRequiredUrl(liveEnv.apiUrl);
const token = readRequiredToken(liveEnv.authToken);
const insecureTls = readBooleanEnv(
  liveEnv.insecureTls,
  "PRODUCT_API_INSECURE_TLS"
);

assertAllowedHost(targetUrl, liveEnv.allowedHosts);

const checks = [
  {
    label: "ipavo version endpoint",
    path: readEndpointPath(
      env.PRODUCT_IPAVO_VERSION_PATH,
      "/apis/ipavo.io/v1alpha1/version",
      "PRODUCT_IPAVO_VERSION_PATH"
    ),
    validate: isVersionInfo
  },
  {
    label: "ipavo resource summary endpoint",
    path: readEndpointPath(
      env.PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH,
      "/apis/ipavo.io/v1alpha1/resource/summary",
      "PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH"
    ),
    validate: isResourceSummary
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
  const response = await requestWithTimeout(
    new URL(check.path, targetUrl),
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    {
      insecureTls
    }
  );

  if (!response.ok) {
    throw new Error(`${check.label} returned HTTP ${response.status}`);
  }

  const body = parseJson(response.text, check.label);
  if (!check.validate(body)) {
    throw new Error(`${check.label} returned an unexpected response shape`);
  }

  console.log(
    `PASS ${check.label}: ${targetUrl.protocol}//${targetUrl.host}${
      insecureTls ? " (insecure TLS accepted)" : ""
    }`
  );
}

function requestWithTimeout(url, init, options) {
  const client = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method: "GET",
        headers: init.headers,
        rejectUnauthorized:
          url.protocol === "https:" ? !options.insecureTls : undefined,
        timeout: timeoutMs
      },
      (response) => {
        let text = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          text += chunk;
        });
        response.on("end", () => {
          const status = response.statusCode ?? 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text
          });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error(`request timed out after ${timeoutMs}ms`));
    });
    request.on("error", reject);
    request.end();
  });
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned invalid JSON`);
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
  if (!isConfiguredSecret(trimmed)) {
    fail("PRODUCT_AUTH_TOKEN is not configured");
  }

  return trimmed;
}

function isConfiguredSecret(value) {
  const trimmed = value?.trim();
  return Boolean(trimmed && !["<jwt>", "<paste-jwt-here>"].includes(trimmed));
}

function readTimeoutMs(rawTimeoutMs) {
  const timeout = Number(rawTimeoutMs ?? 10_000);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    fail("PRODUCT_API_TIMEOUT_MS must be a positive number when configured");
  }

  return timeout;
}

function readBooleanEnv(rawValue, envName) {
  const normalized = rawValue?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (["1", "true", "yes"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no"].includes(normalized)) {
    return false;
  }

  fail(`${envName} must be one of 1, true, yes, 0, false, or no when configured`);
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
      "Optional insecure local TLS: PRODUCT_API_INSECURE_TLS=1.",
      "Optional endpoint path env: PRODUCT_IPAVO_VERSION_PATH, PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH.",
      "Token and response bodies are intentionally never printed."
    ].join("\n")
  );
  process.exit(1);
}

function readLiveEnv(env) {
  return {
    apiUrl: readFirstEnv(env, ["PRODUCT_API_URL"]),
    authToken: readFirstEnv(env, ["PRODUCT_AUTH_TOKEN"]),
    allowedHosts: readFirstEnv(env, ["PRODUCT_API_ALLOWED_HOSTS"]),
    insecureTls: readFirstEnv(env, ["PRODUCT_API_INSECURE_TLS"])
  };
}

function readMergedEnv(env) {
  if (env.PRODUCT_SKIP_ENV_FILE === "1") {
    return env;
  }

  return {
    ...readEnvFile(new URL("../apps/product-integration/.env.local", import.meta.url)),
    ...env
  };
}

function readEnvFile(fileUrl) {
  let content = "";
  try {
    content = readFileSync(fileUrl, "utf8");
  } catch {
    return {};
  }

  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) {
      continue;
    }

    values[match[1]] = unquoteEnvValue(match[2].trim());
  }

  return values;
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readFirstEnv(env, names) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}
