#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredArtifacts = [
  ".idea-to-ship/ai-dashboard-builder/requirements.md",
  ".idea-to-ship/ai-dashboard-builder/architecture.md",
  ".idea-to-ship/ai-dashboard-builder/roadmap.md",
  ".idea-to-ship/ai-dashboard-builder/release-gate.md",
  ".idea-to-ship/ai-dashboard-builder/test-plan.md",
  ".idea-to-ship/ai-dashboard-builder/code-review.md",
  "docs/ai-dashboard-v0.1-adoption.md",
  "docs/design.md",
  "docs/mcp-echarts.md"
];

const requiredSourceFiles = [
  "scripts/check-bundle-budget.mjs",
  "scripts/check-ipavo-live-pilot.mjs",
  "scripts/check-ipavo-live-backend.mjs",
  "scripts/ipavo-live-backend-shape.mjs",
  "scripts/check-roadmap-completion.mjs",
  "apps/product-integration/src/dashboards/ipavo-overview.ts",
  "apps/product-integration/src/product-sdk/ipavo-live-contract.ts",
  "apps/product-integration/src/__tests__/ipavo-live-contract.test.ts",
  "apps/product-integration/src/__tests__/ipavo-live-pilot-script.test.ts",
  "apps/product-integration/src/__tests__/ipavo-live-backend-script.test.ts",
  "apps/product-integration/src/__tests__/roadmap-completion-script.test.ts",
  "apps/product-integration/src/proxy-config.ts",
  "packages/ai-dashboard-ai-catalog/src/create-layout-catalog.ts",
  "packages/ai-dashboard-ai-catalog/src/create-theme-catalog.ts"
];

const requiredRootScripts = [
  "build",
  "typecheck",
  "lint",
  "test",
  "check:bundle-budget",
  "check:ipavo-live-pilot",
  "check:ipavo-live-backend",
  "check:roadmap-completion"
];

const roadmapArtifactDir = ".idea-to-ship/ai-dashboard-builder";
const expectedProductSdkDependencies = {
  "@daocloud-proto/ipavo": "0.13.0-20"
};
const requiredProductEnvKeys = [
  "PRODUCT_API_URL",
  "PRODUCT_API_ALLOWED_HOSTS",
  "PRODUCT_AUTH_TOKEN",
  "PRODUCT_API_TIMEOUT_MS",
  "PRODUCT_API_INSECURE_TLS",
  "PRODUCT_IPAVO_VERSION_PATH",
  "PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH"
];
const authMaterialSafetyFiles = [
  "apps/product-integration/.env.example",
  "apps/product-integration/src/proxy-config.ts",
  "scripts/check-ipavo-live-pilot.mjs",
  "scripts/check-ipavo-live-backend.mjs",
  "packages/ai-dashboard-ai-catalog/src/prompt-templates.ts"
];
const staleEvidencePatterns = [
  /6 files \/ 19 tests/,
  /6 files \/ 23 tests/,
  /6 files \/ 25 tests/,
  /6 files, 25 tests/,
  /6 files \/ 28 tests/,
  /17 test files \/ 86 tests/,
  /17 files \/ 86 tests/,
  /17 files, 86 tests/,
  /18 files \/ 87 tests/,
  /18 files, 87 tests/,
  /18 files \/ 90 tests/,
  /18 files, 90 tests/,
  /18 files \/ 92 tests/,
  /18 files, 92 tests/,
  /18 files \/ 94 tests/,
  /18 files, 94 tests/,
  /18 files \/ 95 tests/,
  /18 files, 95 tests/
];
const markdownAuthMaterialPatterns = [
  {
    label: "JWT-like token",
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/
  },
  {
    label: "literal bearer token",
    pattern:
      /\bBearer\s+(?!<[^>]+>|\$\{|\$|`|\[redacted\]|fake\.jwt\.token)[A-Za-z0-9._~+/=-]{12,}/i
  },
  {
    label: "PRODUCT_AUTH_TOKEN concrete assignment",
    pattern:
      /PRODUCT_AUTH_TOKEN\s*=\s*(?!"<jwt>"|'<jwt>'|<jwt>|fake\.jwt\.token|\[redacted\])\S+/
  },
  {
    label: "private key block",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/
  }
];

const failures = [];
let liveGateFailed = false;

checkRequiredFiles("roadmap artifact surface", requiredArtifacts);
checkRequiredFiles("roadmap source/test surface", requiredSourceFiles);
checkRequiredRootScripts();
checkProductSdkSurface();
checkProductEnvExampleSurface();
checkStaleEvidence();
checkMarkdownAuthMaterialSafety();
checkSourceAuthMaterialSafety();
runGate("ITS-003 live pilot preflight", "scripts/check-ipavo-live-pilot.mjs");
runGate("ITS-003 live backend smoke", "scripts/check-ipavo-live-backend.mjs");

if (failures.length) {
  console.error("FAIL roadmap completion gate");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  if (liveGateFailed) {
    console.error(
      [
        "",
        "Roadmap completion is blocked by the live ipavo backend/JWT gate.",
        "Provide PRODUCT_API_URL, PRODUCT_AUTH_TOKEN, and PRODUCT_API_ALLOWED_HOSTS,",
        "or explicitly revise the roadmap so the live backend run is out of scope."
      ].join("\n")
    );
  }

  console.error(
    [
      "",
      "The roadmap is not complete until the missing items above are fixed.",
      "Do not commit backend URLs, JWTs, cookies, auth headers, or raw production responses."
    ].join("\n")
  );
  process.exit(1);
}

console.log("PASS roadmap completion gate");

function checkRequiredFiles(label, files) {
  const missing = files.filter((file) => !existsSync(resolve(repoRoot, file)));

  if (missing.length === 0) {
    console.log(`PASS ${label}: ${files.length} files`);
    return;
  }

  for (const file of missing) {
    failures.push(`missing required file: ${file}`);
  }
}

function checkRequiredRootScripts() {
  const rootPackage = JSON.parse(
    readFileSync(resolve(repoRoot, "package.json"), "utf8")
  );
  const missing = requiredRootScripts.filter(
    (script) => !rootPackage.scripts?.[script]
  );

  if (missing.length === 0) {
    console.log(
      `PASS root package script surface: ${requiredRootScripts.length} scripts`
    );
    return;
  }

  for (const script of missing) {
    failures.push(`missing root package script: ${script}`);
  }
}

function checkProductSdkSurface() {
  const packageJsonPath = "apps/product-integration/package.json";
  const productPackage = JSON.parse(
    readFileSync(resolve(repoRoot, packageJsonPath), "utf8")
  );
  const missing = Object.entries(expectedProductSdkDependencies).filter(
    ([dependency, version]) => productPackage.dependencies?.[dependency] !== version
  );

  if (missing.length === 0) {
    console.log(
      `PASS product SDK dependency surface: ${
        Object.keys(expectedProductSdkDependencies).length
      } package`
    );
    return;
  }

  for (const [dependency, version] of missing) {
    failures.push(
      `${packageJsonPath} must depend on ${dependency}@${version}`
    );
  }
}

function checkProductEnvExampleSurface() {
  const envExamplePath = "apps/product-integration/.env.example";
  const content = readFileSync(resolve(repoRoot, envExamplePath), "utf8");
  const values = readEnvExampleValues(content);
  const missing = requiredProductEnvKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(values, key)
  );
  const invalidPlaceholders = [];

  if (values.PRODUCT_API_URL !== "http://localhost:8080") {
    invalidPlaceholders.push("PRODUCT_API_URL must stay on localhost placeholder");
  }
  if (values.PRODUCT_API_ALLOWED_HOSTS !== "localhost:8080") {
    invalidPlaceholders.push(
      "PRODUCT_API_ALLOWED_HOSTS must stay on localhost placeholder"
    );
  }
  if (values.PRODUCT_AUTH_TOKEN !== "<jwt>") {
    invalidPlaceholders.push("PRODUCT_AUTH_TOKEN must stay as <jwt>");
  }
  if (Number(values.PRODUCT_API_TIMEOUT_MS) <= 0) {
    invalidPlaceholders.push("PRODUCT_API_TIMEOUT_MS must be positive");
  }
  if (!["false", "0", "no"].includes(values.PRODUCT_API_INSECURE_TLS)) {
    invalidPlaceholders.push(
      "PRODUCT_API_INSECURE_TLS must stay disabled in .env.example"
    );
  }
  for (const key of [
    "PRODUCT_IPAVO_VERSION_PATH",
    "PRODUCT_IPAVO_RESOURCE_SUMMARY_PATH"
  ]) {
    const value = values[key] ?? "";
    if (
      !value.startsWith("/") ||
      value.startsWith("//") ||
      value.includes("://")
    ) {
      invalidPlaceholders.push(`${key} must stay as a backend path placeholder`);
    }
  }

  if (missing.length === 0 && invalidPlaceholders.length === 0) {
    console.log(
      `PASS product live env example surface: ${requiredProductEnvKeys.length} keys`
    );
    return;
  }

  if (missing.length) {
    failures.push(
      `${envExamplePath} is missing required live env keys: ${missing.join(", ")}`
    );
  }

  for (const invalidPlaceholder of invalidPlaceholders) {
    failures.push(`${envExamplePath}: ${invalidPlaceholder}`);
  }
}

function readEnvExampleValues(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
          return [line, ""];
        }
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );
}

function checkStaleEvidence() {
  let staleCount = 0;
  const markdownFiles = getRoadmapMarkdownFiles();

  for (const file of markdownFiles) {
    const content = readFileSync(resolve(repoRoot, file), "utf8");
    for (const pattern of staleEvidencePatterns) {
      if (pattern.test(content)) {
        staleCount += 1;
        failures.push(
          `stale verification evidence in ${file}: ${pattern.source}`
        );
      }
    }
  }

  if (staleCount === 0) {
    console.log(`PASS roadmap evidence freshness: ${markdownFiles.length} files`);
  }
}

function checkMarkdownAuthMaterialSafety() {
  const markdownFiles = [
    ...getRoadmapMarkdownFiles(),
    "docs/ai-dashboard-v0.1-adoption.md",
    "docs/design.md",
    "docs/mcp-echarts.md"
  ];
  let matchCount = 0;

  for (const file of markdownFiles) {
    const content = readFileSync(resolve(repoRoot, file), "utf8");
    for (const { label, pattern } of markdownAuthMaterialPatterns) {
      if (pattern.test(content)) {
        matchCount += 1;
        failures.push(`${file} contains forbidden auth material: ${label}`);
      }
    }
  }

  if (matchCount === 0) {
    console.log(
      `PASS markdown auth-material safety: ${markdownFiles.length} files`
    );
  }
}

function checkSourceAuthMaterialSafety() {
  let matchCount = 0;

  for (const file of authMaterialSafetyFiles) {
    const content = readFileSync(resolve(repoRoot, file), "utf8");
    for (const { label, pattern } of markdownAuthMaterialPatterns) {
      if (pattern.test(content)) {
        matchCount += 1;
        failures.push(`${file} contains forbidden auth material: ${label}`);
      }
    }
  }

  if (matchCount === 0) {
    console.log(
      `PASS source auth-material safety: ${authMaterialSafetyFiles.length} files`
    );
  }
}

function getRoadmapMarkdownFiles() {
  return readdirSync(resolve(repoRoot, roadmapArtifactDir))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `${roadmapArtifactDir}/${file}`);
}

function runGate(label, scriptPath) {
  const result = spawnSync(process.execPath, [resolve(repoRoot, scriptPath)], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8"
  });

  if (result.status === 0) {
    console.log(`PASS ${label}`);
    return;
  }

  liveGateFailed = true;
  failures.push(`${label} failed; rerun node ${scriptPath} for details`);
}
