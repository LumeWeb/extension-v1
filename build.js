import { createRequire } from "module";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const scripts = {
  "src/main/background.ts": {
    outdir: "public/background",
    inject: true,
    format: "esm",
    splitting: true,
  },
  "src/main/content.ts": {
    script: "public/content.js",
    inject: false,
    format: "esm",
  },
  "src/main/content_api.ts": {
    script: "public/content_api.js",
    inject: false,
    format: "esm",
  },
  "src/main/resolver.ts": {
    script: "public/js/resolver.js",
    inject: false,
    format: "esm",
  },
  "src/main/error.ts": {
    script: "public/js/error.js",
    inject: false,
    format: "esm",
  },
};

Object.keys(scripts).forEach((script) => {
  const args = scripts[script];
  esbuild.buildSync({
    entryPoints: [script],
    outfile: args.script,
    outdir: args.outdir,
    platform: "browser",
    define: { global: "window" },
    inject: args.inject ? ["./polyfill.js"] : [],
    bundle: true,
    splitting: args.splitting,
    format: args.format,
    // eslint-disable-next-line no-undef
    minify: Boolean(process.env.PRODUCTION) ?? false,
    globalName: args.global ?? undefined,
  });
});
