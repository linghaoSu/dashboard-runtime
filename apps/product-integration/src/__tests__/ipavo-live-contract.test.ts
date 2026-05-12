import { describe, expect, it } from "vitest";
import {
  assertIpavoLiveSdkContract,
  ipavoLiveSdkContract
} from "../product-sdk/ipavo-live-contract";

describe("ipavo live SDK contract", () => {
  it("imports the real generated ipavo SDK without calling the backend", () => {
    expect(() => assertIpavoLiveSdkContract()).not.toThrow();
    expect(ipavoLiveSdkContract).toMatchObject({
      packageName: "@daocloud-proto/ipavo",
      packageVersion: "0.13.0-20",
      serviceMethods: [
        "GetVersion",
        "GetResourceSummary",
        "GetAlertSummary",
        "GetResourceUsage",
        "ListProducts",
        "GetPodSummary"
      ],
      podDisplayTypes: ["BY_CLUSTER", "BY_NAMESPACE"]
    });
  });
});
