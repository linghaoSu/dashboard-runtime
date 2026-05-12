import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import {
  createProductApiProxyConfig,
  type ProductApiProxyEnv
} from "./src/proxy-config";

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, appRoot, "PRODUCT_");
  const proxyEnv: ProductApiProxyEnv = {
    PRODUCT_API_URL: process.env.PRODUCT_API_URL ?? fileEnv.PRODUCT_API_URL,
    PRODUCT_AUTH_TOKEN:
      process.env.PRODUCT_AUTH_TOKEN ?? fileEnv.PRODUCT_AUTH_TOKEN,
    PRODUCT_API_ALLOWED_HOSTS:
      process.env.PRODUCT_API_ALLOWED_HOSTS ??
      fileEnv.PRODUCT_API_ALLOWED_HOSTS,
    PRODUCT_API_INSECURE_TLS:
      process.env.PRODUCT_API_INSECURE_TLS ?? fileEnv.PRODUCT_API_INSECURE_TLS
  };

  return {
    plugins: [vue()],
    server: {
      host: "127.0.0.1",
      port: 5174,
      proxy: createProductApiProxyConfig(proxyEnv)
    }
  };
});
