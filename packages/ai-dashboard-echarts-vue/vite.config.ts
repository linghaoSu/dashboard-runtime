import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: [
        "vue",
        "echarts",
        "echarts/core",
        "echarts/charts",
        "echarts/components",
        "echarts/renderers",
        "vue-echarts",
        "@dao-style-viz/ai-dashboard-runtime",
        "@dao-style-viz/ai-dashboard-vue"
      ]
    }
  }
});
