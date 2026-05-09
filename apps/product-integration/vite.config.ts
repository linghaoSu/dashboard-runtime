import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { createProductApiProxyConfig } from "./src/proxy-config";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 5174,
    proxy: createProductApiProxyConfig(process.env)
  }
});
