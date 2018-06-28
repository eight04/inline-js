import vue from "rollup-plugin-vue";
import copy from "rollup-plugin-copy-assets";
import {terser} from "rollup-plugin-terser";

export default {
	input: "src/index.js",
	output: {
		file: "docs/index.js",
		format: "es",
		sourcemap: true
	},
	plugins: [
    vue(),
    copy({
      assets: [
        "src/index.html"
      ]
    }),
    terser()
	]
};
