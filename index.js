const fse = require("fs-extra");
const treeify = require("treeify");
const {createInliner} = require("inline-js-core");

const {DEFAULT_RESOURCES} = require("./lib/default-resources");
const {DEFAULT_TRANSFORMS} = require("./lib/default-transforms");
const {findConfig} = require("./lib/conf");

function init({
  "--out": out,
  "--dry-run": dryRun,
  "--max-depth": maxDepth,
  "<entry_file>": file
}) {
  const inliner = createInliner({maxDepth});
  
  DEFAULT_RESOURCES.forEach(inliner.resource.add);
  DEFAULT_TRANSFORMS.forEach(inliner.transformer.add);
  
  const config = findConfig(file);
  if (config) {
    console.error(`Use config file: ${config.confPath}`);
    if (config.resources) {
      config.resources.forEach(inliner.resource.add);
    }
    if (config.transforms) {
      config.transforms.forEach(inliner.transformer.add);
    }
    if (config.shortcuts) {
      config.shorcuts.forEach(inliner.globalShortcuts.add);
    }
  }
  
	console.error("inline-js started\n");
  return inliner.inline({name: "text", args: [file]}).then(({content, dependency}) => {
    console.error(`Result inline tree:`);
    console.error(file);
    console.error(treeify.asTree(dependency));
    
    if (dryRun) {
      console.error(`[dry] Output to ${out || "stdout"}`);
    } else if (out) {
      fse.outputFileSync(out, content);
    } else {
      process.stdout.write(content);
    }
  });
}

module.exports = {init};
