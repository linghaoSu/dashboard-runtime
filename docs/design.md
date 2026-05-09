# AI Dashboard Design Guidelines

**Status:** v0.1 design evidence
**Audience:** dashboard authors, AI generation prompts, product frontend reviewers

## Layout Principles

Dashboard layouts should be designed for fast scanning first, then detail reading. The default layout model is a fixed-format canvas with absolute widget slots and runtime scaling, because large-screen dashboards and embedded product dashboards need stable geometry that does not shift when data changes.

Use these principles when generating or reviewing DashboardConfig layouts:

- Start with a canonical canvas: `1920x1080` for wall screens, `1440x900` for embedded product pages, or a documented product-specific size.
- Use a consistent outer margin and gutter. Prefer 32-40 px outer margins on 1440-1920 px canvases and 24-40 px gutters between widgets.
- Reserve the top-left and top row for primary filters, time scope, and the most important KPIs.
- Give the primary chart the largest continuous slot. It should be visually dominant and should not compete with more than one other large chart.
- Put secondary tables, lists, and alerts to the right or below the primary chart.
- Align widget edges to a small set of x/y coordinates. Avoid almost-aligned offsets that make the dashboard feel accidental.
- Keep widget title, data, hover, and error states inside stable bounds. Text or loading states must not resize the widget.
- Avoid nested card compositions. Each widget shell is already a frame; page sections should be canvas bands or slots, not cards inside cards.
- Keep chart slots large enough for labels. Bar/line/area charts need at least 320 px height for meaningful axes; dense legends need extra top or side room.
- Use layout overflow validation as a release gate, not a visual review substitute.

## Catalog Layout Presets

The layout catalog should expose reusable patterns rather than arbitrary coordinates. Each preset should include:

- Canvas size.
- Slot coordinates.
- Recommended widget categories for each slot.
- A short rationale.
- Design evidence pointing back to this file.

Recommended v0.1 presets:

| Preset | Best For | Structure |
|---|---|---|
| `overview-3-kpi-chart-table` | cluster, tenant, resource, and operations overview pages | top KPI row, primary chart, side list/table |
| `map-with-side-panel` | geography, topology, site status | dominant map/coordinate chart, side detail panel |
| `tenant-ops-command` | product operations dashboard | filter band, note/status band, KPI row, full-width diagnostic chart |
| `ipavo-console-overview` | DaoCloud product console pages similar to the ipavo reference | pod statistics, compact CPU/memory trends, health, alerts, cluster/resource/function panels |

For ipavo-style product pages, prefer a `1920x760` canvas with a 24 px outer margin, 16 px card gutters, four aligned columns, and two rows. The reference slot pattern is:

- Row 1: pod statistics, CPU/memory trend stack, health status, alert list.
- Row 2: cluster count, wide resource usage, function overview.

## Color System

Charts should use a global palette by default, with local chart overrides only when the chart has a specific semantic need. The global palette lives on `canvas.chartPalette`; individual ECharts widget configs can override it with `props.palette`.

Palette rules:

- Use 6-8 colors for categorical charts.
- Mix hue families. Avoid one-note palettes dominated by a single blue, purple, beige, or orange family.
- Keep status colors stable: success green, warning amber, danger red.
- Use saturated accents on dark dashboards and slightly deeper tones on light dashboards.
- Do not use low-contrast adjacent colors in the same chart.
- Do not use palette overrides to encode product-specific permission or business logic.

## Prebuilt Palettes

Use these palettes as starting points:

| Key | Name | Best For | Colors |
|---|---|---|---|
| `dao-ops-vivid` | Dao Ops Vivid | dark operations dashboards | `#38bdf8`, `#22c55e`, `#f59e0b`, `#ef4444`, `#a78bfa`, `#14b8a6`, `#f472b6`, `#eab308` |
| `aurora-contrast` | Aurora Contrast | high-contrast charts with many categories | `#60a5fa`, `#34d399`, `#fbbf24`, `#fb7185`, `#c084fc`, `#2dd4bf`, `#f97316`, `#a3e635` |
| `product-light` | Product Light | embedded light product pages | `#2563eb`, `#059669`, `#d97706`, `#dc2626`, `#7c3aed`, `#0891b2`, `#db2777`, `#65a30d` |
| `capacity-signal` | Capacity Signal | capacity and SLO views | `#0ea5e9`, `#10b981`, `#f59e0b`, `#ef4444`, `#8b5cf6`, `#06b6d4`, `#84cc16`, `#f43f5e` |
| `ipavo-console-light` | Ipavo Console Light | light card-based product consoles | `#2497df`, `#32d475`, `#f4b434`, `#dd5250`, `#7b61ff`, `#00b8a9`, `#e85aad`, `#7cb342` |

## DashboardConfig Pattern

Use a global chart palette on the canvas:

```ts
canvas: {
  width: 1440,
  height: 900,
  scaleMode: "fit",
  theme: "dao-dark",
  background: "#08111f",
  chartPalette: [
    "#38bdf8",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a78bfa",
    "#14b8a6"
  ]
}
```

Override a single chart only when the local visual intent is different:

```ts
props: {
  xField: "namespace",
  yField: "value",
  palette: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"]
}
```
