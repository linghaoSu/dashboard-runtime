import {
  mergeLocaleMessages,
  type LocaleMessages
} from "@dao-style-viz/ai-dashboard-runtime";
import { clusterOverviewMessages } from "../dashboards/cluster-overview.i18n";

const projectMessages: LocaleMessages = {
  "en-US": {
    app: {
      name: "AI Dashboard Demo"
    }
  },
  "zh-CN": {
    app: {
      name: "AI 大屏演示"
    }
  }
};

export const messages = mergeLocaleMessages(
  projectMessages,
  clusterOverviewMessages
);
