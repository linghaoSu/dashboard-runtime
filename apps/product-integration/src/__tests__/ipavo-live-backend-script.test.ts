import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const scriptPath = resolve(repoRoot, "scripts/check-ipavo-live-backend.mjs");

function runLiveBackendSmoke(env: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    env: {
      FORCE_COLOR: "0",
      PRODUCT_SKIP_ENV_FILE: "1",
      ...env
    },
    encoding: "utf8"
  });

  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`
  };
}

describe("ipavo live backend smoke script", () => {
  it("fails before network when required env is missing", () => {
    const result = runLiveBackendSmoke();

    expect(result.status).toBe(1);
    expect(result.output).toContain("PRODUCT_API_URL is not configured");
    expect(result.output).not.toContain("\n    at ");
  });

  it("rejects endpoint overrides that are not backend paths", () => {
    const result = runLiveBackendSmoke({
      PRODUCT_API_URL: "http://localhost:8080",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "localhost:8080",
      PRODUCT_IPAVO_VERSION_PATH: "https://evil.example/apis"
    });

    expect(result.status).toBe(1);
    expect(result.output).toContain(
      'PRODUCT_IPAVO_VERSION_PATH must be a backend path that starts with a single "/"'
    );
    expect(result.output).not.toContain("fake.jwt.token");
    expect(result.output).not.toContain("\n    at ");
  });

  it("rejects invalid insecure TLS flags before network", () => {
    const result = runLiveBackendSmoke({
      PRODUCT_API_URL: "http://localhost:8080",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "localhost:8080",
      PRODUCT_API_INSECURE_TLS: "sometimes"
    });

    expect(result.status).toBe(1);
    expect(result.output).toContain("PRODUCT_API_INSECURE_TLS must be one of");
    expect(result.output).not.toContain("fake.jwt.token");
    expect(result.output).not.toContain("\n    at ");
  });

  it("rejects invalid timeout values before network", () => {
    const result = runLiveBackendSmoke({
      PRODUCT_API_URL: "http://localhost:8080",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "localhost:8080",
      PRODUCT_API_TIMEOUT_MS: "0"
    });

    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "PRODUCT_API_TIMEOUT_MS must be a positive number"
    );
    expect(result.output).not.toContain("fake.jwt.token");
    expect(result.output).not.toContain("\n    at ");
  });

  it("rejects weak version response shapes", async () => {
    const { isVersionInfo } = await import(
      pathToFileURL(resolve(repoRoot, "scripts/ipavo-live-backend-shape.mjs")).href
    );

    expect(isVersionInfo({})).toBe(false);
    expect(isVersionInfo({ gitVersion: "v0.0.0-test" })).toBe(true);
  });

  it("rejects weak resource summary response shapes", async () => {
    const { isResourceSummary } = await import(
      pathToFileURL(resolve(repoRoot, "scripts/ipavo-live-backend-shape.mjs")).href
    );

    expect(isResourceSummary({ clusterCount: {} })).toBe(false);
    expect(
      isResourceSummary({
        clusterCount: { healthy: 2, total: 2 },
        nodeCount: { healthy: 8, total: 8 },
        podCount: { healthy: 241, total: 278 }
      })
    ).toBe(true);
  });
});
