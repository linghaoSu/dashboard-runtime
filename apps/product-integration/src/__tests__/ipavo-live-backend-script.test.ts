import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const scriptPath = resolve(repoRoot, "scripts/check-ipavo-live-backend.mjs");

function runLiveBackendSmoke(env: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    env: {
      FORCE_COLOR: "0",
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
});
