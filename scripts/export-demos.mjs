#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const demos = [
  ["google-swe-intern", "google-big-tech"],
  ["finance-analyst", "investment-banking-analyst"],
  ["consulting-ba", "mbb-consulting"],
  ["chinese-internet-product", "chinese-product-ops"],
  ["uk-graduate-scheme", "uk-graduate-scheme"],
];

for (const [demo, route] of demos) {
  const base = path.join("examples", "demos", demo);
  const result = spawnSync(
    process.execPath,
    [
      "scripts/export-resume.mjs",
      "--input",
      path.join(base, "outputs", "source-resume.md"),
      "--out-dir",
      path.join(base, "outputs"),
      "--base-name",
      "targeted-resume",
      "--template-route",
      route,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
