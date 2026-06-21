import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });

for (const item of ["index.html", "src", "docs"]) {
  cpSync(join(root, item), join(dist, item), { recursive: true });
}

for (const item of ["manifest.webmanifest", "sw.js", "icons"]) {
  cpSync(join(root, "public", item), join(dist, item), { recursive: true });
}

console.log("Static deployment bundle written to dist/.");
