import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dest = join(process.cwd(), ".vercel/output/functions/__server.func/_libs");
if (!existsSync(dest)) process.exit(0);

const src = join(process.cwd(), "node_modules/@electric-sql/pglite/dist");
mkdirSync(dest, { recursive: true });
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(src, name);
  if (!existsSync(from)) throw new Error(`Missing ${from}`);
  copyFileSync(from, join(dest, name));
}
console.log("[pglite] copied data and wasm into the Vercel function");
