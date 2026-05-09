import {
  scanGeneratedChartAst,
  type AstSafetyScanOptions,
  type AstScanIssue
} from "./ast-scan.js";
import {
  checkDependencyAllowlist,
  type DependencyAllowlistOptions,
  type DependencyIssue
} from "./dependency-allowlist.js";
import {
  createGeneratedChartHookPlan,
  evaluateGeneratedChartHookResults,
  type GeneratedChartHookCommand,
  type GeneratedChartHookResult
} from "./hooks.js";
import {
  createGeneratedChartPreviewContract,
  type GeneratedChartPreviewContract
} from "./preview-contract.js";
import {
  generatedChartPackageSchema,
  type GeneratedChartPackage
} from "./schemas.js";

export type GeneratedChartGateIssue =
  | {
      code: "invalid_manifest";
      message: string;
    }
  | {
      code: "missing_entry_file";
      message: string;
    }
  | {
      code: "missing_sample_data";
      message: string;
    }
  | {
      code: "missing_manifest_file";
      message: string;
    }
  | {
      code: "invalid_sample_data";
      message: string;
    }
  | DependencyIssue
  | AstScanIssue;

export type GeneratedChartGateResult = {
  success: boolean;
  package?: GeneratedChartPackage;
  issues: GeneratedChartGateIssue[];
  hookPlan: GeneratedChartHookCommand[];
  previewContract?: GeneratedChartPreviewContract;
};

export type GeneratedChartGateOptions = DependencyAllowlistOptions &
  AstSafetyScanOptions & {
    packageDir?: string;
  };

export function validateGeneratedChartPackage(
  input: unknown,
  options: GeneratedChartGateOptions = {}
): GeneratedChartGateResult {
  const parsed = generatedChartPackageSchema.safeParse(input);
  const hookPlan = createGeneratedChartHookPlan({
    packageDir: options.packageDir
  });

  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "invalid_manifest",
        message: issue.message
      })),
      hookPlan
    };
  }

  const generatedPackage = parsed.data;
  const issues: GeneratedChartGateIssue[] = [
    ...validateRequiredFiles(generatedPackage),
    ...checkDependencyAllowlist(generatedPackage, options),
    ...scanGeneratedChartAst(generatedPackage.files, options)
  ];
  const sampleDataResult = readJsonFile(
    generatedPackage.files[generatedPackage.manifest.sampleDataFile]
  );

  if (!sampleDataResult.success) {
    issues.push({
      code: "invalid_sample_data",
      message: sampleDataResult.message
    });
  }

  return {
    success: issues.length === 0,
    package: generatedPackage,
    issues,
    hookPlan,
    previewContract:
      !sampleDataResult.success || sampleDataResult.data === undefined
        ? undefined
        : createGeneratedChartPreviewContract(
            generatedPackage.manifest,
            sampleDataResult.data
          )
  };
}

export function evaluateGeneratedChartApprovalGate(options: {
  validation: GeneratedChartGateResult;
  hookResults: readonly GeneratedChartHookResult[];
  previewRendered: boolean;
  approved: boolean;
}): boolean {
  return (
    options.validation.success &&
    evaluateGeneratedChartHookResults(options.hookResults) &&
    options.previewRendered &&
    options.approved
  );
}

function validateRequiredFiles(
  generatedPackage: GeneratedChartPackage
): GeneratedChartGateIssue[] {
  const issues: GeneratedChartGateIssue[] = [];

  if (!generatedPackage.files[generatedPackage.manifest.entry]) {
    issues.push({
      code: "missing_entry_file",
      message: `Generated chart entry file is missing: ${generatedPackage.manifest.entry}`
    });
  }

  if (!generatedPackage.files[generatedPackage.manifest.sampleDataFile]) {
    issues.push({
      code: "missing_sample_data",
      message: `Generated chart sample data file is missing: ${generatedPackage.manifest.sampleDataFile}`
    });
  }

  generatedPackage.manifest.files.forEach((file) => {
    if (!generatedPackage.files[file]) {
      issues.push({
        code: "missing_manifest_file",
        message: `Generated chart manifest lists a missing file: ${file}`
      });
    }
  });

  return issues;
}

function readJsonFile(content: string | undefined):
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      message: string;
    } {
  if (content === undefined) {
    return {
      success: true,
      data: undefined
    };
  }

  try {
    return {
      success: true,
      data: JSON.parse(content) as unknown
    };
  } catch (caught) {
    return {
      success: false,
      message: caught instanceof Error ? caught.message : String(caught)
    };
  }
}
