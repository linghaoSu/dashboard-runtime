export type GeneratedChartHookName = "typecheck" | "lint" | "build";

export type GeneratedChartHookCommand = {
  name: GeneratedChartHookName;
  command: string;
  args: string[];
  cwd?: string;
};

export type GeneratedChartHookPlanOptions = {
  packageDir?: string;
  tsconfig?: string;
  lintPattern?: string;
};

export type GeneratedChartHookResult = {
  name: GeneratedChartHookName;
  success: boolean;
  exitCode?: number;
  output?: string;
};

export function createGeneratedChartHookPlan(
  options: GeneratedChartHookPlanOptions = {}
): GeneratedChartHookCommand[] {
  const packageDir = options.packageDir ?? ".";

  return [
    {
      name: "typecheck",
      command: "pnpm",
      args: [
        "--dir",
        packageDir,
        "exec",
        "vue-tsc",
        "--noEmit",
        "-p",
        options.tsconfig ?? "tsconfig.json"
      ]
    },
    {
      name: "lint",
      command: "pnpm",
      args: [
        "--dir",
        packageDir,
        "exec",
        "eslint",
        options.lintPattern ?? "src/**/*.{ts,vue}"
      ]
    },
    {
      name: "build",
      command: "pnpm",
      args: ["--dir", packageDir, "exec", "vite", "build"]
    }
  ];
}

export function evaluateGeneratedChartHookResults(
  results: readonly GeneratedChartHookResult[]
): boolean {
  const requiredHooks: GeneratedChartHookName[] = ["typecheck", "lint", "build"];

  return requiredHooks.every((name) =>
    results.some((result) => result.name === name && result.success)
  );
}
