import { readFile } from "node:fs/promises";
import { basename } from "node:path";

/** Turn an uploaded iPhone HEIC into a JPEG the browser can show. */
export function heicMomentsPlugin() {
  return {
    name: "heic-moments",
    enforce: "pre",
    async load(id) {
      const file = id.split("?")[0] ?? "";
      if (!/\.hei[cf]$/i.test(file)) return null;
      const convert = (await import("heic-convert")).default;
      const input = await readFile(file);
      const output = Buffer.from(await convert({ buffer: input, format: "JPEG", quality: 0.82 }));
      const building = this.meta?.watchMode !== true && typeof this.emitFile === "function" && process.argv.includes("build");
      if (building) {
        const referenceId = this.emitFile({
          type: "asset",
          name: basename(file).replace(/\.hei[cf]$/i, ".jpg"),
          source: output,
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
      return `export default ${JSON.stringify(`data:image/jpeg;base64,${output.toString("base64")}`)};`;
    },
  };
}
