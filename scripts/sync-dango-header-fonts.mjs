/**
 * dango-header 用フォントを @fontsource から public/fonts/dango-header へ同期する。
 * build 前に実行し、ポータル origin から woff2 を配信する。
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "fonts", "dango-header");

const files = [
  ["@fontsource/outfit/files/outfit-latin-500-normal.woff2", "outfit-latin-500-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-600-normal.woff2", "outfit-latin-600-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-700-normal.woff2", "outfit-latin-700-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-900-normal.woff2", "outfit-latin-900-normal.woff2"],
  ["@fontsource/syne/files/syne-latin-700-normal.woff2", "syne-latin-700-normal.woff2"],
  ["@fontsource/syne/files/syne-latin-800-normal.woff2", "syne-latin-800-normal.woff2"],
];

mkdirSync(outDir, { recursive: true });

for (const [pkgRel, destName] of files) {
  const src = join(root, "node_modules", ...pkgRel.split("/"));
  const dest = join(outDir, destName);
  copyFileSync(src, dest);
  console.log(`synced ${destName}`);
}
