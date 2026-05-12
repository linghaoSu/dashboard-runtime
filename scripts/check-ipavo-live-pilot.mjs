#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const productRequire = createRequire(
  new URL("../apps/product-integration/package.json", import.meta.url)
);
const expectedPackage = "@daocloud-proto/ipavo";
const expectedVersion = "0.13.0-20";
const requiredFiles = [
  "ipavo/v1alpha1/ipavo.pb.ts",
  "ipavo/v1alpha1/ipavo_type.pb.ts"
];
const env = readMergedEnv(process.env);
const liveEnv = readLiveEnv(env);

const checks = [
  checkSdkPackage(),
  checkBackendUrl(liveEnv.apiUrl),
  checkToken(liveEnv.authToken),
  checkAllowedHosts(liveEnv.apiUrl, liveEnv.allowedHosts)
];

let failed = false;

for (const check of checks) {
  if (check.ok) {
    console.log(`PASS ${check.label}: ${check.detail}`);
    continue;
  }

  failed = true;
  console.error(`FAIL ${check.label}: ${check.detail}`);
}

if (failed) {
  console.error(
    [
      "",
      "Ipavo live pilot is not ready.",
      "Fix the failed checks above before claiming the live pilot is ready.",
      "A ready live pilot requires @daocloud-proto/ipavo@0.13.0-20 in the product app,",
      "PRODUCT_API_URL, PRODUCT_AUTH_TOKEN, and PRODUCT_API_ALLOWED_HOSTS.",
      "Do not put backend URLs, JWTs, cookies, or auth headers in DashboardConfig or AI prompt/catalog payloads."
    ].join("\n")
  );
  process.exitCode = 1;
}

function readLiveEnv(env) {
  return {
    apiUrl: readFirstEnv(env, ["PRODUCT_API_URL"]),
    authToken: readFirstEnv(env, ["PRODUCT_AUTH_TOKEN"]),
    allowedHosts: readFirstEnv(env, ["PRODUCT_API_ALLOWED_HOSTS"])
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

function checkSdkPackage() {
  let packageJsonPath;

  try {
    packageJsonPath = productRequire.resolve(`${expectedPackage}/package.json`);
  } catch {
    return {
      ok: false,
      label: "ipavo SDK package",
      detail: `${expectedPackage}@${expectedVersion} is not installed in the product integration app`
    };
  }

  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (manifest.version !== expectedVersion) {
    return {
      ok: false,
      label: "ipavo SDK package",
      detail: `${expectedPackage} version ${manifest.version} is installed; expected ${expectedVersion}`
    };
  }

  const packageRoot = dirname(packageJsonPath);
  const missingFiles = requiredFiles.filter((file) => !existsSync(join(packageRoot, file)));
  if (missingFiles.length) {
    return {
      ok: false,
      label: "ipavo SDK package",
      detail: `missing generated files: ${missingFiles.join(", ")}`
    };
  }

  return {
    ok: true,
    label: "ipavo SDK package",
    detail: `${expectedPackage}@${expectedVersion} with generated service/type files`
  };
}

function checkBackendUrl(rawUrl) {
  if (!rawUrl?.trim()) {
    return {
      ok: false,
      label: "PRODUCT_API_URL",
      detail: "not configured"
    };
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        ok: false,
        label: "PRODUCT_API_URL",
        detail: "must use http or https"
      };
    }

    return {
      ok: true,
      label: "PRODUCT_API_URL",
      detail: `[configured ${url.protocol}//${url.host}]`
    };
  } catch {
    return {
      ok: false,
      label: "PRODUCT_API_URL",
      detail: "must be an absolute http(s) URL"
    };
  }
}

function checkToken(token) {
  if (!isConfiguredSecret(token)) {
    return {
      ok: false,
      label: "PRODUCT_AUTH_TOKEN",
      detail: "not configured"
    };
  }

  return {
    ok: true,
    label: "PRODUCT_AUTH_TOKEN",
    detail: "[configured and redacted]"
  };
}

function isConfiguredSecret(value) {
  const trimmed = value?.trim();
  return Boolean(trimmed && !["<jwt>", "<paste-jwt-here>"].includes(trimmed));
}

function checkAllowedHosts(rawUrl, rawAllowedHosts) {
  if (!rawAllowedHosts?.trim()) {
    return {
      ok: false,
      label: "PRODUCT_API_ALLOWED_HOSTS",
      detail:
        "not configured; an explicit allowlist is required before shared preview or release-candidate live pilot"
    };
  }

  let targetHost = "";
  try {
    targetHost = new URL(rawUrl).host;
  } catch {
    return {
      ok: false,
      label: "PRODUCT_API_ALLOWED_HOSTS",
      detail: "cannot verify allowlist because PRODUCT_API_URL is invalid"
    };
  }

  const allowedHosts = rawAllowedHosts
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  if (!allowedHosts.includes(targetHost)) {
    return {
      ok: false,
      label: "PRODUCT_API_ALLOWED_HOSTS",
      detail: `target host ${targetHost} is not allowlisted`
    };
  }

  return {
    ok: true,
    label: "PRODUCT_API_ALLOWED_HOSTS",
    detail: "[configured and matched]"
  };
}
