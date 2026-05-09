import { GaugeChart, LineChart, PieChart } from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([
  CanvasRenderer,
  DatasetComponent,
  GaugeChart,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent
]);
