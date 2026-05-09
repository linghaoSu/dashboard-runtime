import type {
  GeneratedChartManifest,
  GeneratedChartPackageJson
} from "./schemas.js";

export type DependencyIssue = {
  code: "unapproved_dependency";
  packageName: string;
  dependencyType: "dependencies" | "peerDependencies" | "devDependencies";
  message: string;
};

export type DependencyAllowlistOptions = {
  allowedDependencies?: readonly string[];
  allowDevDependencies?: boolean;
};

export const defaultGeneratedChartDependencyAllowlist = [
  "@dao-style-viz/ai-dashboard-echarts-vue",
  "@dao-style-viz/ai-dashboard-runtime",
  "@dao-style-viz/ai-dashboard-vue",
  "echarts",
  "vue",
  "vue-echarts",
  "zod"
] as const;

export function checkDependencyAllowlist(
  input: {
    manifest: GeneratedChartManifest;
    packageJson: GeneratedChartPackageJson;
  },
  options: DependencyAllowlistOptions = {}
): DependencyIssue[] {
  const allowed = new Set(
    options.allowedDependencies ?? defaultGeneratedChartDependencyAllowlist
  );
  const issues: DependencyIssue[] = [];

  collectDependencyIssues(
    input.manifest.dependencies,
    "dependencies",
    allowed,
    issues
  );
  collectDependencyIssues(
    input.manifest.peerDependencies,
    "peerDependencies",
    allowed,
    issues
  );
  collectDependencyIssues(
    input.packageJson.dependencies,
    "dependencies",
    allowed,
    issues
  );
  collectDependencyIssues(
    input.packageJson.peerDependencies,
    "peerDependencies",
    allowed,
    issues
  );

  if (options.allowDevDependencies ?? false) {
    collectDependencyIssues(
      input.packageJson.devDependencies,
      "devDependencies",
      allowed,
      issues
    );
  } else {
    Object.keys(input.packageJson.devDependencies).forEach((packageName) => {
      issues.push(createDependencyIssue(packageName, "devDependencies"));
    });
  }

  return dedupeDependencyIssues(issues);
}

function collectDependencyIssues(
  dependencies: Record<string, string>,
  dependencyType: DependencyIssue["dependencyType"],
  allowed: Set<string>,
  issues: DependencyIssue[]
) {
  Object.keys(dependencies).forEach((packageName) => {
    if (!allowed.has(packageName)) {
      issues.push(createDependencyIssue(packageName, dependencyType));
    }
  });
}

function createDependencyIssue(
  packageName: string,
  dependencyType: DependencyIssue["dependencyType"]
): DependencyIssue {
  return {
    code: "unapproved_dependency",
    packageName,
    dependencyType,
    message: `${dependencyType} contains unapproved package: ${packageName}`
  };
}

function dedupeDependencyIssues(issues: DependencyIssue[]): DependencyIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.dependencyType}:${issue.packageName}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
