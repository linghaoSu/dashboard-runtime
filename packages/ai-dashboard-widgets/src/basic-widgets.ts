import { defineVueWidget } from "@dao-style-viz/ai-dashboard-vue";
import AlarmList from "./AlarmList.vue";
import FilterBar from "./FilterBar.vue";
import MetricCard from "./MetricCard.vue";
import Panel from "./Panel.vue";
import RankingList from "./RankingList.vue";
import ScrollTable from "./ScrollTable.vue";
import StatusBadge from "./StatusBadge.vue";
import TimeRangePicker from "./TimeRangePicker.vue";
import {
  alarmListDataSchema,
  alarmListPropsSchema,
  filterBarDataSchema,
  filterBarPropsSchema,
  metricCardDataSchema,
  metricCardPropsSchema,
  panelDataSchema,
  panelPropsSchema,
  rankingListDataSchema,
  rankingListPropsSchema,
  scrollTableDataSchema,
  scrollTablePropsSchema,
  statusBadgeDataSchema,
  statusBadgePropsSchema,
  timeRangePickerDataSchema,
  timeRangePickerPropsSchema,
  type AlarmListData,
  type AlarmListProps,
  type FilterBarData,
  type FilterBarProps,
  type MetricCardData,
  type MetricCardProps,
  type PanelData,
  type PanelProps,
  type RankingListData,
  type RankingListProps,
  type ScrollTableData,
  type ScrollTableProps,
  type StatusBadgeData,
  type StatusBadgeProps,
  type TimeRangePickerData,
  type TimeRangePickerProps
} from "./schemas.js";

export const panelWidget = defineVueWidget<PanelData, PanelProps>({
  type: "Panel",
  name: "Panel",
  description: "Displays supporting dashboard text inside a panel body",
  category: "layout",
  component: Panel,
  dataSchema: panelDataSchema,
  propsSchema: panelPropsSchema,
  examples: [
    {
      title: "Cluster note",
      data: undefined,
      props: {
        tone: "success",
        subtitle: "SLO",
        content: "No availability breach in the current window."
      }
    }
  ],
  aiHints: {
    goodFor: ["short annotations", "dashboard notes", "group labels"],
    notGoodFor: ["large tables", "chart visualizations"],
    preferredDataShape: "optional subtitle/content strings"
  }
});

export const metricCardWidget = defineVueWidget<
  MetricCardData,
  MetricCardProps
>({
  type: "MetricCard",
  name: "Metric Card",
  description: "Shows one numeric KPI with optional trend and status color",
  category: "metric",
  component: MetricCard,
  dataSchema: metricCardDataSchema,
  propsSchema: metricCardPropsSchema,
  examples: [
    {
      title: "CPU Usage",
      data: {
        label: "CPU Usage",
        value: 72.5,
        unit: "%",
        trend: 0.035,
        status: "warning"
      },
      props: {
        precision: 1
      }
    }
  ],
  aiHints: {
    goodFor: ["single KPI", "current value", "status-colored metric"],
    notGoodFor: ["trend over time", "large category list"],
    preferredDataShape: "object with label, numeric value, optional unit"
  }
});

export const statusBadgeWidget = defineVueWidget<
  StatusBadgeData,
  StatusBadgeProps
>({
  type: "StatusBadge",
  name: "Status Badge",
  description: "Shows a compact status label with severity color",
  category: "metric",
  component: StatusBadge,
  dataSchema: statusBadgeDataSchema,
  propsSchema: statusBadgePropsSchema,
  examples: [
    {
      title: "Health",
      data: {
        label: "Healthy",
        status: "success",
        description: "All checks passed"
      },
      props: {}
    }
  ],
  aiHints: {
    goodFor: ["health state", "availability status", "small severity label"],
    notGoodFor: ["numeric ranking", "time series"],
    preferredDataShape: "object with label, status, optional description"
  }
});

export const rankingListWidget = defineVueWidget<
  RankingListData,
  RankingListProps
>({
  type: "RankingList",
  name: "Ranking List",
  description: "Shows sorted entities with relative bars and values",
  category: "table",
  component: RankingList,
  dataSchema: rankingListDataSchema,
  propsSchema: rankingListPropsSchema,
  examples: [
    {
      title: "Top namespaces",
      data: [
        { name: "prod", value: 91 },
        { name: "staging", value: 66 },
        { name: "dev", value: 38 }
      ],
      props: {
        maxItems: 5,
        unit: "%"
      }
    }
  ],
  aiHints: {
    goodFor: ["top N ranking", "comparison list", "ordered entities"],
    notGoodFor: ["full tabular records", "part-to-whole distribution"],
    preferredDataShape: "array of name/value items sorted by value"
  }
});

export const scrollTableWidget = defineVueWidget<
  ScrollTableData,
  ScrollTableProps
>({
  type: "ScrollTable",
  name: "Scroll Table",
  description: "Shows compact tabular records with fixed columns",
  category: "table",
  component: ScrollTable,
  dataSchema: scrollTableDataSchema,
  propsSchema: scrollTablePropsSchema,
  examples: [
    {
      title: "Pods",
      data: {
        columns: [
          { key: "name", label: "Name" },
          { key: "status", label: "Status" }
        ],
        rows: [
          { name: "api-0", status: "Running" },
          { name: "worker-0", status: "Pending" }
        ]
      },
      props: {
        maxRows: 20
      }
    }
  ],
  aiHints: {
    goodFor: ["records", "resource lists", "dense comparisons"],
    notGoodFor: ["single KPI", "geographic points"],
    preferredDataShape: "columns plus rows keyed by column key"
  }
});

export const alarmListWidget = defineVueWidget<AlarmListData, AlarmListProps>({
  type: "AlarmList",
  name: "Alarm List",
  description: "Shows recent alarms with severity and time",
  category: "table",
  component: AlarmList,
  dataSchema: alarmListDataSchema,
  propsSchema: alarmListPropsSchema,
  examples: [
    {
      title: "Active alarms",
      data: [
        {
          id: "alarm-1",
          title: "CPU pressure",
          severity: "warning",
          time: "10:20"
        }
      ],
      props: {
        maxItems: 10
      }
    }
  ],
  aiHints: {
    goodFor: ["recent alarms", "events", "severity list"],
    notGoodFor: ["numeric trend", "general table"],
    preferredDataShape: "array of alarm records with severity"
  }
});

export const filterBarWidget = defineVueWidget<FilterBarData, FilterBarProps>({
  type: "FilterBar",
  name: "Filter Bar",
  description: "Emits a selected option so config can update dashboard filters",
  category: "filter",
  component: FilterBar,
  dataSchema: filterBarDataSchema,
  propsSchema: filterBarPropsSchema,
  examples: [
    {
      title: "Cluster filter",
      data: undefined,
      props: {
        trigger: "change",
        options: [
          { label: "Cluster A", value: "cluster-a", active: true },
          { label: "Cluster B", value: "cluster-b" }
        ]
      }
    }
  ],
  aiHints: {
    goodFor: ["small option sets", "dashboard filter controls"],
    notGoodFor: ["long searchable lists", "free-text input"],
    preferredDataShape: "array of label/value options"
  }
});

export const timeRangePickerWidget = defineVueWidget<
  TimeRangePickerData,
  TimeRangePickerProps
>({
  type: "TimeRangePicker",
  name: "Time Range Picker",
  description: "Emits a selected time range value for dashboard filters",
  category: "filter",
  component: TimeRangePicker,
  dataSchema: timeRangePickerDataSchema,
  propsSchema: timeRangePickerPropsSchema,
  examples: [
    {
      title: "Time range",
      data: undefined,
      props: {
        trigger: "change",
        options: [
          { label: "1h", value: "last_1h" },
          { label: "24h", value: "last_24h", active: true }
        ]
      }
    }
  ],
  aiHints: {
    goodFor: ["time range controls", "refresh window filters"],
    notGoodFor: ["calendar date editing", "arbitrary cron schedules"],
    preferredDataShape: "array of label/value time range options"
  }
});

export const basicWidgetRegistry = {
  Panel: panelWidget,
  MetricCard: metricCardWidget,
  StatusBadge: statusBadgeWidget,
  RankingList: rankingListWidget,
  ScrollTable: scrollTableWidget,
  AlarmList: alarmListWidget,
  FilterBar: filterBarWidget,
  TimeRangePicker: timeRangePickerWidget
};
