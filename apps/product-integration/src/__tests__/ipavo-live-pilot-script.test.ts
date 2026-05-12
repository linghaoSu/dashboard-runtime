import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const scriptPath = resolve(repoRoot, "scripts/check-ipavo-live-pilot.mjs");

function runLivePilotPreflight(env: Record<string, string> = {}) {
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

describe("ipavo live pilot preflight script", () => {
  it("passes with fake local env without printing the token", () => {
    const result = runLivePilotPreflight({
      PRODUCT_API_URL: "http://localhost:8080",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "localhost:8080"
    });

    expect(result.status).toBe(0);
    expect(result.output).toContain("@daocloud-proto/ipavo@0.13.0-20");
    expect(result.output).toContain("[configured and redacted]");
    expect(result.output).not.toContain("fake.jwt.token");
  });

  it("rejects non-allowlisted backend hosts", () => {
    const result = runLivePilotPreflight({
      PRODUCT_API_URL: "https://backend.example.test",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "other.example.test"
    });

    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "target host backend.example.test is not allowlisted"
    );
    expect(result.output).not.toContain("fake.jwt.token");
  });

  it("requires an absolute http or https backend URL", () => {
    const result = runLivePilotPreflight({
      PRODUCT_API_URL: "file:///tmp/backend",
      PRODUCT_AUTH_TOKEN: "fake.jwt.token",
      PRODUCT_API_ALLOWED_HOSTS: "localhost:8080"
    });

    expect(result.status).toBe(1);
    expect(result.output).toContain("must use http or https");
    expect(result.output).not.toContain("fake.jwt.token");
  });
});
