import Raw from "unplugin-raw/rolldown";
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    // Only the grammar entry is bundled. The package's `.` export is the
    // hand-written `index.js` + `index.d.ts` at the repo root, which simply
    // re-export the parsed JSON via an import attribute.
    entry: { grammar: "src/grammar.ts" },
    dts: {
      tsgo: true,
    },
    exports: {
      customExports(exports) {
        exports["."] = {
          types: "./index.d.ts",
          import: "./index.js",
        };
        exports["./grammar"] = {
          types: "./dist/grammar.d.mts",
          import: "./dist/grammar.mjs",
        };
        return exports;
      },
    },
    plugins: [Raw()],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["**/*.json"],
  },
});
