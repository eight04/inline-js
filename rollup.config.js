import resolve from "rollup-plugin-node-resolve";
import cjs from "rollup-plugin-cjs-es";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import vue from "rollup-plugin-vue";
import copy from "rollup-plugin-copied";
import {terser} from "rollup-plugin-terser";
import json from "rollup-plugin-json";
import alias from "rollup-plugin-alias";

export default {
	input: ["src/index.js", "src/worker.js"],
	output: {
    dir: "docs",
		format: "es"
	},
	plugins: [
    alias({
      fs: "src/shim/fs.js",
      util: "src/shim/util.js",
      "clean-css": "src/shim/clean-css.js",
      "fs-extra": "src/shim/empty.js",
      "config-locator": "src/shim/empty.js"
    }),
    builtins(),
    resolve({
      extensions: [ '.mjs', '.js', '.json', '.node' ]
    }),
    json(),
    vue(),
    cjs({
      nested: true
    }),
    globals(),
    copy({
      from: "src/static",
      to: "docs"
    }),
    terser()
	],
  context: "self",
  experimentalCodeSplitting: true
};
