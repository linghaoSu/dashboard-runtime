import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const scriptPath = resolve(repoRoot, "scripts/check-roadmap-completion.mjs");

function runRoadmapCompletionGate(env: Record<string, string> = {}) {
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

describe("roadmap completion gate script", () => {
  it("fails without live ipavo env and keeps auth material redacted", () => {
    const result = runRoadmapCompletionGate();

    expect(result.status).toBe(1);
    expect(result.output).toContain("PASS roadmap artifact surface");
    expect(result.output).toContain("PASS roadmap source/test surface");
    expect(result.output).toContain("PASS root package script surface");
    expect(result.output).toContain("PASS product SDK dependency surface");
    expect(result.output).toContain("PASS product live env example surface");
    expect(result.output).toContain("PASS roadmap evidence freshness");
    expect(result.output).toContain("PASS markdown auth-material safety");
    expect(result.output).toContain("PASS source auth-material safety");
    expect(result.output).toContain("ITS-003 live pilot preflight failed");
    expect(result.output).toContain("ITS-003 live backend smoke failed");
    expect(result.output).toContain(
      "Roadmap completion is blocked by the live ipavo backend/JWT gate"
    );
    expect(result.output).not.toContain("fake.jwt.token");
    expect(result.output).not.toContain("\n    at ");
  });
});
