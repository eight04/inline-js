import resolve from "rollup-plugin-node-resolve";
import cjs from "rollup-plugin-cjs-es";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import vue from "rollup-plugin-vue";
import copy from "rollup-plugin-cpy";
import {terser} from "rollup-plugin-terser";
import json from "rollup-plugin-json";
import re from "rollup-plugin-re";
import progress from "rollup-plugin-progress";
import esInfo from "rollup-plugin-es-info";
import shim from "rollup-plugin-shim";
import alias from "rollup-plugin-alias";

export default {
	input: ["src/index.js", "src/worker.js"],
	output: {
    dir: "docs",
		format: "es",
		sourcemap: true
	},
	plugins: [
    alias({
      fs: "src/shim/fs.js",
      util: "src/shim/util.js",
      // vm: "src/shim/vm.js",
      // path: "src/shim/path.js",
      "clean-css": "src/shim/clean-css.js",
      // child_process: "src/shim/child-process.js"
    }),
    builtins(),
    resolve({
      extensions: [ '.mjs', '.js', '.json', '.node' ]
    }),
    json(),
    vue(),
    // re({
      // patterns: [
        // {
          // match: /properties.override-properties\.js$/,
          // test: /(var deepClone.+)\n\1/g,
          // replace: "$1"
        // }
      // ]
    // }),
    cjs({
      exclude: ["**/*.vue"],
      nested: true
    }),
    globals(),
    copy({
      files: [
        "src/index.html"
      ],
      dest: "docs"
    }),
    // terser()
	],
  context: "self",
  experimentalCodeSplitting: true
};
