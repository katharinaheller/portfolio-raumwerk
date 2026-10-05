import { defineConfig } from "vite";
import { resolve } from "node:path";
const base = process.env.BASE_PATH || "/";
const site =
  (process.env.SITE_ORIGIN || "https://katharinaheller.github.io") + base;
export default defineConfig({
  base,
  plugins: [
    {
      name: "site-meta",
      transformIndexHtml(html) {
        return html.replaceAll("__SITE_URL__", site);
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        impressum: resolve("impressum/index.html"),
        datenschutz: resolve("datenschutz/index.html"),
      },
    },
  },
});
