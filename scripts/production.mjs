import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const config = JSON.parse(readFileSync("site.config.json", "utf8"));
const env = {
  ...process.env,
  BASE_PATH: config.basePath,
  NEXT_PUBLIC_BASE_PATH: config.basePath.replace(/\/$/, ""),
  SITE_ORIGIN: config.origin,
  NEXT_TELEMETRY_DISABLED: "1",
  ASTRO_TELEMETRY_DISABLED: "1",
};
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npm, ["run", "build"], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
