<script setup lang="ts">
import type { WidgetRuntimeProps } from "@dao-style-viz/ai-dashboard-runtime";
import { computed } from "vue";
import type { ScrollTableData, ScrollTableProps } from "./schemas.js";

const runtimeProps =
  defineProps<WidgetRuntimeProps<ScrollTableData, ScrollTableProps>>();

const rows = computed(() =>
  runtimeProps.data.rows.slice(0, runtimeProps.props.maxRows ?? 20)
);

function formatCell(value: unknown): string {
  if (typeof value === "number") {
    return runtimeProps.format.number(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value ?? "");
}
</script>

<template>
  <div class="dao-scroll-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in data.columns" :key="column.key">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="column in data.columns" :key="column.key">
            {{ formatCell(row[column.key]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.dao-scroll-table {
  width: 100%;
  min-width: 0;
  overflow: auto;
}

.dao-scroll-table table {
  width: 100%;
  border-collapse: collapse;
  color: #e5e7eb;
  font-size: 13px;
}

.dao-scroll-table th,
.dao-scroll-table td {
  max-width: 180px;
  overflow: hidden;
  padding: 8px 10px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dao-scroll-table th {
  position: sticky;
  top: 0;
  background: #1e293b;
  color: #cbd5e1;
  font-weight: 600;
}

.dao-scroll-table tr:nth-child(even) td {
  background: rgb(15 23 42 / 42%);
}
</style>
