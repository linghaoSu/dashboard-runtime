import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: [
        "vue",
        "@dao-style-viz/ai-dashboard-runtime",
        "@dao-style-viz/ai-dashboard-schema"
      ]
    }
  }
});
