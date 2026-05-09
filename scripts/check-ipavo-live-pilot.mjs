#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const productRequire = createRequire(
  new URL("../apps/product-integration/package.json", import.meta.url)
);
const expectedPackage = "@daocloud-proto/ipavo";
const expectedVersion = "0.13.0";
const requiredFiles = [
  "ipavo/v1alpha1/ipavo.pb.ts",
  "ipavo/v1alpha1/ipavo_type.pb.ts"
];

const checks = [
  checkSdkPackage(),
  checkBackendUrl(process.env.PRODUCT_API_URL),
  checkToken(process.env.PRODUCT_AUTH_TOKEN),
  checkAllowedHosts(process.env.PRODUCT_API_URL, process.env.PRODUCT_API_ALLOWED_HOSTS)
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
      "A ready live pilot requires @daocloud-proto/ipavo@0.13.0 in the product app,",
      "PRODUCT_API_URL, PRODUCT_AUTH_TOKEN, and PRODUCT_API_ALLOWED_HOSTS.",
      "Do not put backend URLs, JWTs, cookies, or auth headers in DashboardConfig or AI prompt/catalog payloads."
    ].join("\n")
  );
  process.exitCode = 1;
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
  if (!token?.trim()) {
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

function checkAllowedHosts(rawUrl, rawAllowedHosts) {
  if (!rawAllowedHosts?.trim()) {
    return {
      ok: false,
      label: "PRODUCT_API_ALLOWED_HOSTS",
      detail: "not configured; required before shared preview or release-candidate live pilot"
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
