import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const productApiUrl = process.env.PRODUCT_API_URL;
const productAuthToken = process.env.PRODUCT_AUTH_TOKEN;

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 5174,
    proxy: productApiUrl
      ? {
          "/apis": {
            target: productApiUrl,
            changeOrigin: true,
            secure: false,
            headers: productAuthToken
              ? {
                  Authorization: `Bearer ${productAuthToken}`
                }
              : undefined
          }
        }
      : undefined
  }
});
