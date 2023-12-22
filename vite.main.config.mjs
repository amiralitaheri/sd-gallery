import { defineConfig } from "vite";
import { builtinModules } from "module";
import { dependencies } from "./package.json";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["electron", ...builtinModules, ...Object.keys(dependencies)],
    },
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ["node"],
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
});
