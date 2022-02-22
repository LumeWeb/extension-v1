import { createRequire } from "module";

const require = createRequire(import.meta.url);
require("esbuild").buildSync({
  entryPoints: ["src/background.ts"],
  outfile: "public/background.mjs",
  platform: "browser",
  define: { global: "window" },
  inject: ["./polyfill.js"],
  bundle: true,
  format: "esm",
  minify: true,
});
