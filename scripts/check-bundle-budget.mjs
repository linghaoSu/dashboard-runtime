#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const kib = 1024;

const budgets = [
  {
    label: "demo app total JS",
    directory: "apps/demo/dist/assets",
    extension: ".js",
    maxBytes: 950 * kib
  },
  {
    label: "demo app total CSS",
    directory: "apps/demo/dist/assets",
    extension: ".css",
    maxBytes: 32 * kib
  },
  {
    label: "product integration app total JS",
    directory: "apps/product-integration/dist/assets",
    extension: ".js",
    maxBytes: 950 * kib
  },
  {
    label: "product integration app total CSS",
    directory: "apps/product-integration/dist/assets",
    extension: ".css",
    maxBytes: 32 * kib
  },
  {
    label: "ai-dashboard-vue library JS",
    file: "packages/ai-dashboard-vue/dist/index.js",
    maxBytes: 20 * kib
  },
  {
    label: "ai-dashboard-widgets library JS",
    file: "packages/ai-dashboard-widgets/dist/index.js",
    maxBytes: 32 * kib
  },
  {
    label: "ai-dashboard-echarts-vue library JS",
    file: "packages/ai-dashboard-echarts-vue/dist/index.js",
    maxBytes: 150 * kib
  }
];

let failed = false;

for (const budget of budgets) {
  const result = measureBudget(budget);
  const budgetText = formatBytes(budget.maxBytes);
  const sizeText = formatBytes(result.bytes);
  const gzipText = formatBytes(result.gzipBytes);

  if (result.bytes > budget.maxBytes) {
    failed = true;
    console.error(
      `FAIL ${budget.label}: ${sizeText} raw / ${gzipText} gzip exceeds ${budgetText}`
    );
    continue;
  }

  console.log(`PASS ${budget.label}: ${sizeText} raw / ${gzipText} gzip <= ${budgetText}`);
}

if (failed) {
  process.exitCode = 1;
}

function measureBudget(budget) {
  if (budget.file) {
    const data = readFileSync(budget.file);
    return {
      bytes: data.byteLength,
      gzipBytes: gzipSync(data).byteLength
    };
  }

  const files = readdirSync(budget.directory)
    .filter((file) => file.endsWith(budget.extension))
    .map((file) => join(budget.directory, file))
    .filter((file) => statSync(file).isFile());

  if (!files.length) {
    throw new Error(`No ${budget.extension} assets found in ${budget.directory}`);
  }

  return files.reduce(
    (total, file) => {
      const data = readFileSync(file);
      return {
        bytes: total.bytes + data.byteLength,
        gzipBytes: total.gzipBytes + gzipSync(data).byteLength
      };
    },
    { bytes: 0, gzipBytes: 0 }
  );
}

function formatBytes(bytes) {
  return `${(bytes / kib).toFixed(1)} KiB`;
}
