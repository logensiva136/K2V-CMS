// Regenerates data/content.json from the single source of truth in
// src/content/defaults.js. Run: node scripts/gen-content-json.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { DEFAULT_CONTENT } from "../src/content/defaults.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
writeFileSync(
  resolve(root, "data/content.json"),
  JSON.stringify(DEFAULT_CONTENT, null, 2) + "\n"
);
console.log("wrote data/content.json");
