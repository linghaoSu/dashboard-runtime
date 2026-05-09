import {
  mergeLocaleMessages,
  type LocaleMessages
} from "@dao-style-viz/ai-dashboard-runtime";
import { tenantCapacityMessages } from "../dashboards/tenant-capacity.i18n";

const productMessages: LocaleMessages = {
  "en-US": {
    product: {
      name: "Product Observability"
    }
  },
  "zh-CN": {
    product: {
      name: "产品可观测"
    }
  }
};

export const messages = mergeLocaleMessages(
  productMessages,
  tenantCapacityMessages
);
