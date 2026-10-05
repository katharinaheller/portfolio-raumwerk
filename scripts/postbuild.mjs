import { readFile, writeFile, cp, copyFile } from "node:fs/promises";
const config = JSON.parse(await readFile("site.config.json", "utf8"));
await cp("licenses", config.output + "/third-party-licenses", {
  recursive: true,
});
await copyFile("CREDITS.md", config.output + "/credits.txt");
const base = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "/";
const normalized = base.endsWith("/") ? base : base + "/";
const origin = process.env.SITE_ORIGIN || config.origin;
const urls = config.routes
  .filter((route) => route !== "kasse/")
  .map((route) => origin + normalized + route);
await writeFile(
  config.output + "/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map((url) => "<url><loc>" + url + "</loc></url>").join("") +
    "</urlset>",
);
await writeFile(
  config.output + "/robots.txt",
  "User-agent: *\nAllow: /\n" +
    (config.slug === "ton-und-form"
      ? "Disallow: " + normalized + "kasse/\n"
      : "") +
    "Sitemap: " +
    origin +
    normalized +
    "sitemap.xml\n",
);
