import resolve from "rollup-plugin-node-resolve";
import cjs from "rollup-plugin-cjs-es";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import vue from "rollup-plugin-vue";
import copy from "rollup-plugin-cpy";
import {terser} from "rollup-plugin-terser";
import json from "rollup-plugin-json";
import re from "rollup-plugin-re";

export default {
	input: ["src/index.js", "src/worker.js"],
	output: {
    dir: "docs",
		format: "es",
		sourcemap: true
	},
	plugins: [
    resolve({
      extensions: [ '.mjs', '.js', '.json', '.node' ]
    }),
    json(),
    vue(),
    re({
      include: [
        "**/properties/override-properties.js"
      ],
      patterns: [
        {
          test: /(var deepClone.+)\n\1/g,
          replace: "$1"
        }
      ]
    }),
    cjs({nested: true}),
    globals(),
    builtins({
      fs: true
    }),
    copy({
      files: [
        "src/index.html"
      ],
      dest: "docs"
    }),
    terser()
	],
  experimentalCodeSplitting: true
};
