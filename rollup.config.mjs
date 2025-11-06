import * as path from "path";

import resolve from "@rollup/plugin-node-resolve";
import cjs from "rollup-plugin-cjs-es";
import iife from "rollup-plugin-iife";
import vue from "rollup-plugin-vue";
import {copy} from "@web/rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import externalGlobals from "rollup-plugin-external-globals";
import inject from "@rollup/plugin-inject";

import glob from "tiny-glob";

const shim = Object.fromEntries(
  (await glob("src/shim/*.js")).map(f => {
    const name = f.slice("src/shim/".length, -3);
    return [
      name,
      path.resolve(f)
    ];
  })
);

export default {
	input: ["src/index.js", "src/worker.js"],
	output: {
    dir: "docs",
		format: "es"
	},
  external: ["fs-extra", "config-locator"],
	plugins: [
    alias({
      entries: shim
    }),
    resolve(),
    json(),
    vue(),
    cjs({
      nested: true
    }),
    inject(shim),
    externalGlobals({
      "vue": "Vue",
    }),
    copy({
      patterns: "**/*",
      rootDir: "src/static",
    }),
    iife({
      names: moduleId => {
        console.log("unresolved import: ", moduleId);
      }
    }),
    terser()
	],
  context: "self"
};
