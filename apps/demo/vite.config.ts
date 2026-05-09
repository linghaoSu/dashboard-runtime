import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@dao-style-viz/ai-dashboard-schema": fileURLToPath(
        new URL("../../packages/ai-dashboard-schema/src/index.ts", import.meta.url)
      ),
      "@dao-style-viz/ai-dashboard-runtime": fileURLToPath(
        new URL("../../packages/ai-dashboard-runtime/src/index.ts", import.meta.url)
      ),
      "@dao-style-viz/ai-dashboard-vue": fileURLToPath(
        new URL("../../packages/ai-dashboard-vue/src/index.ts", import.meta.url)
      ),
      "@dao-style-viz/ai-dashboard-widgets": fileURLToPath(
        new URL(
          "../../packages/ai-dashboard-widgets/src/index.ts",
          import.meta.url
        )
      ),
      "@dao-style-viz/ai-dashboard-ai-catalog": fileURLToPath(
        new URL(
          "../../packages/ai-dashboard-ai-catalog/src/index.ts",
          import.meta.url
        )
      ),
      "@dao-style-viz/ai-dashboard-echarts-vue": fileURLToPath(
        new URL(
          "../../packages/ai-dashboard-echarts-vue/src/index.ts",
          import.meta.url
        )
      )
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
