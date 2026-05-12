import { describe, expect, it } from "vitest";
import {
  createProductApiProxyConfig,
  redactProductApiProxyEnv
} from "../proxy-config";

describe("product API proxy config", () => {
  it("returns no proxy when PRODUCT_API_URL is unset", () => {
    expect(createProductApiProxyConfig({})).toBeUndefined();
  });

  it("creates a server-side JWT Authorization header for a fake backend", () => {
    expect(
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://backend.example.test/",
        PRODUCT_AUTH_TOKEN: "fake.jwt.token",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test"
      })
    ).toEqual({
      "/apis": {
        target: "https://backend.example.test",
        changeOrigin: true,
        secure: true,
        headers: {
          Authorization: "Bearer fake.jwt.token"
        }
      }
    });
  });

  it("can disable TLS verification for explicit local debug previews", () => {
    expect(
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://backend.example.test/",
        PRODUCT_AUTH_TOKEN: "fake.jwt.token",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test",
        PRODUCT_API_INSECURE_TLS: "true"
      })
    ).toEqual({
      "/apis": {
        target: "https://backend.example.test",
        changeOrigin: true,
        secure: false,
        headers: {
          Authorization: "Bearer fake.jwt.token"
        }
      }
    });
  });

  it("does not inject placeholder JWT values", () => {
    expect(
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://backend.example.test/",
        PRODUCT_AUTH_TOKEN: "<paste-jwt-here>",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test"
      })
    ).toEqual({
      "/apis": {
        target: "https://backend.example.test",
        changeOrigin: true,
        secure: true,
        headers: undefined
      }
    });
  });

  it("rejects invalid insecure TLS flags", () => {
    expect(() =>
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://backend.example.test/",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test",
        PRODUCT_API_INSECURE_TLS: "sometimes"
      })
    ).toThrow("PRODUCT_API_INSECURE_TLS");
  });

  it("rejects unsupported or non-allowlisted backend URLs", () => {
    expect(() =>
      createProductApiProxyConfig({
        PRODUCT_API_URL: "file:///tmp/token"
      })
    ).toThrow("http or https");

    expect(() =>
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://backend.example.test"
      })
    ).toThrow("PRODUCT_API_ALLOWED_HOSTS is required");

    expect(() =>
      createProductApiProxyConfig({
        PRODUCT_API_URL: "https://attacker.example.test",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test"
      })
    ).toThrow("not allowlisted");
  });

  it("redacts proxy env values for diagnostics", () => {
    expect(
      redactProductApiProxyEnv({
        PRODUCT_API_URL: "https://backend.example.test",
        PRODUCT_AUTH_TOKEN: "fake.jwt.token",
        PRODUCT_API_ALLOWED_HOSTS: "backend.example.test"
      })
    ).toEqual({
      PRODUCT_API_URL: "[configured]",
      PRODUCT_AUTH_TOKEN: "[redacted]",
      PRODUCT_API_ALLOWED_HOSTS: "[configured]"
    });
  });
});
