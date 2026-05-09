import { IPavo } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo.pb";
import { displayType } from "@daocloud-proto/ipavo/ipavo/v1alpha1/ipavo_type.pb";

const ipavoServiceMethods = [
  "GetResourceSummary",
  "GetAlertSummary",
  "GetResourceUsage",
  "ListProducts",
  "GetPodSummary"
] as const;

export const ipavoLiveSdkContract = {
  packageName: "@daocloud-proto/ipavo",
  packageVersion: "0.13.0",
  serviceMethods: ipavoServiceMethods,
  podDisplayTypes: [displayType.BY_CLUSTER, displayType.BY_NAMESPACE]
};

export function assertIpavoLiveSdkContract() {
  const missingMethods = ipavoServiceMethods.filter(
    (method) => typeof IPavo[method] !== "function"
  );

  if (missingMethods.length) {
    throw new Error(`Missing IPavo SDK methods: ${missingMethods.join(", ")}`);
  }
}
