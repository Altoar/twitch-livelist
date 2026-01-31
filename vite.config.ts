import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  base: "",
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        auth: path.resolve(__dirname, "auth.html")
      }
    },
    minify: "esbuild"
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
