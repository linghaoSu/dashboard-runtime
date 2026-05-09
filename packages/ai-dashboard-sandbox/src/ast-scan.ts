import ts from "typescript";
import type { GeneratedChartFileMap } from "./schemas.js";

export type AstScanIssue = {
  code:
    | "forbidden_identifier"
    | "forbidden_member"
    | "forbidden_import"
    | "dynamic_import";
  file: string;
  line: number;
  column: number;
  message: string;
};

export type AstSafetyScanOptions = {
  allowedImports?: readonly string[];
  forbiddenIdentifiers?: readonly string[];
  forbiddenMembers?: readonly string[];
};

export const defaultAllowedGeneratedChartImports = [
  "@dao-style-viz/ai-dashboard-echarts-vue",
  "@dao-style-viz/ai-dashboard-runtime",
  "@dao-style-viz/ai-dashboard-vue",
  "echarts",
  "vue",
  "vue-echarts",
  "zod"
] as const;

export const defaultForbiddenGeneratedChartIdentifiers = [
  "document",
  "eval",
  "fetch",
  "Function",
  "globalThis",
  "history",
  "indexedDB",
  "localStorage",
  "location",
  "navigator",
  "process",
  "sessionStorage",
  "setInterval",
  "setTimeout",
  "SharedWorker",
  "WebSocket",
  "window",
  "Worker",
  "XMLHttpRequest"
] as const;

export const defaultForbiddenGeneratedChartMembers = [
  "document.cookie",
  "document.createElement",
  "globalThis.fetch",
  "window.fetch",
  "window.localStorage",
  "window.sessionStorage"
] as const;

export function scanGeneratedChartAst(
  files: GeneratedChartFileMap,
  options: AstSafetyScanOptions = {}
): AstScanIssue[] {
  const allowedImports = new Set(
    options.allowedImports ?? defaultAllowedGeneratedChartImports
  );
  const forbiddenIdentifiers = new Set(
    options.forbiddenIdentifiers ?? defaultForbiddenGeneratedChartIdentifiers
  );
  const forbiddenMembers = new Set(
    options.forbiddenMembers ?? defaultForbiddenGeneratedChartMembers
  );

  return Object.entries(files).flatMap(([file, content]) =>
    scanFile(file, content, {
      allowedImports,
      forbiddenIdentifiers,
      forbiddenMembers
    })
  );
}

function scanFile(
  file: string,
  content: string,
  options: {
    allowedImports: Set<string>;
    forbiddenIdentifiers: Set<string>;
    forbiddenMembers: Set<string>;
  }
): AstScanIssue[] {
  if (!/\.(?:ts|tsx|vue)$/u.test(file)) {
    return [];
  }

  const scripts = file.endsWith(".vue")
    ? extractVueScanSources(content)
    : [content];

  return scripts.flatMap((script, index) => {
    const sourceFile = ts.createSourceFile(
      `${file}#script${index + 1}.ts`,
      script,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );
    const issues: AstScanIssue[] = [];

    visitNode(sourceFile, sourceFile, file, options, issues);
    return issues;
  });
}

function visitNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  file: string,
  options: {
    allowedImports: Set<string>;
    forbiddenIdentifiers: Set<string>;
    forbiddenMembers: Set<string>;
  },
  issues: AstScanIssue[]
) {
  if (ts.isImportDeclaration(node)) {
    const moduleName = readImportModuleName(node);
    if (
      moduleName &&
      !moduleName.startsWith(".") &&
      !isAllowedImport(moduleName, options.allowedImports)
    ) {
      issues.push(
        createIssue(
          "forbidden_import",
          file,
          sourceFile,
          node,
          `Import is not allowlisted: ${moduleName}`
        )
      );
    }
  }

  if (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword
  ) {
    issues.push(
      createIssue(
        "dynamic_import",
        file,
        sourceFile,
        node,
        "Dynamic import is not allowed in generated chart packages"
      )
    );
  }

  if (ts.isIdentifier(node) && options.forbiddenIdentifiers.has(node.text)) {
    issues.push(
      createIssue(
        "forbidden_identifier",
        file,
        sourceFile,
        node,
        `Forbidden identifier used: ${node.text}`
      )
    );
  }

  if (ts.isPropertyAccessExpression(node)) {
    const memberName = readPropertyAccess(node);
    if (options.forbiddenMembers.has(memberName)) {
      issues.push(
        createIssue(
          "forbidden_member",
          file,
          sourceFile,
          node,
          `Forbidden member expression used: ${memberName}`
        )
      );
    }
  }

  ts.forEachChild(node, (child) =>
    visitNode(child, sourceFile, file, options, issues)
  );
}

function extractVueScanSources(content: string): string[] {
  return [
    ...extractVueScriptBlocks(content),
    ...extractVueTemplateExpressions(content)
  ];
}

function extractVueScriptBlocks(content: string): string[] {
  const scripts: string[] = [];
  const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/giu;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(content)) !== null) {
    scripts.push(match[1] ?? "");
  }

  return scripts;
}

function extractVueTemplateExpressions(content: string): string[] {
  const expressions: string[] = [];
  const templatePattern = /<template\b[^>]*>([\s\S]*?)<\/template>/giu;
  let templateMatch: RegExpExecArray | null;

  while ((templateMatch = templatePattern.exec(content)) !== null) {
    const template = templateMatch[1] ?? "";
    expressions.push(...extractMustacheExpressions(template));
    expressions.push(...extractDirectiveExpressions(template));
  }

  return expressions.map((expression) => `void (${expression});`);
}

function extractMustacheExpressions(template: string): string[] {
  const expressions: string[] = [];
  const mustachePattern = /\{\{([\s\S]*?)\}\}/gu;
  let match: RegExpExecArray | null;

  while ((match = mustachePattern.exec(template)) !== null) {
    expressions.push(match[1] ?? "");
  }

  return expressions;
}

function extractDirectiveExpressions(template: string): string[] {
  const expressions: string[] = [];
  const directivePattern =
    /(?:^|\s)(?:@[\w:-]+|:[\w:-]+|v-on:[\w:-]+|v-bind:[\w:-]+|v-if|v-else-if|v-show|v-for|v-model(?::[\w:-]+)?|v-html|v-text)(?:\.[\w-]+)*\s*=\s*(?:"([^"]*)"|'([^']*)')/giu;
  let match: RegExpExecArray | null;

  while ((match = directivePattern.exec(template)) !== null) {
    expressions.push(match[1] ?? match[2] ?? "");
  }

  return expressions;
}

function readImportModuleName(node: ts.ImportDeclaration): string | undefined {
  return ts.isStringLiteral(node.moduleSpecifier)
    ? node.moduleSpecifier.text
    : undefined;
}

function isAllowedImport(moduleName: string, allowedImports: Set<string>): boolean {
  return allowedImports.has(getPackageName(moduleName));
}

function getPackageName(moduleName: string): string {
  if (!moduleName.startsWith("@")) {
    return moduleName.split("/")[0] ?? moduleName;
  }

  const [scope, name] = moduleName.split("/");
  return scope && name ? `${scope}/${name}` : moduleName;
}

function readPropertyAccess(node: ts.PropertyAccessExpression): string {
  const left = ts.isIdentifier(node.expression)
    ? node.expression.text
    : node.expression.getText();

  return `${left}.${node.name.text}`;
}

function createIssue(
  code: AstScanIssue["code"],
  file: string,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string
): AstScanIssue {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());

  return {
    code,
    file,
    line: position.line + 1,
    column: position.character + 1,
    message
  };
}
