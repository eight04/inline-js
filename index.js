const path = require("path");
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
  
  return findConfig(file)
    .then(result => {
      if (result) {
        const {conf, confPath} = result;
        console.error(`Use config file: ${confPath}`);
        if (conf.resources) {
          conf.resources.forEach(inliner.resource.add);
        }
        if (conf.transforms) {
          conf.transforms.forEach(inliner.transformer.add);
        }
        if (conf.shortcuts) {
          conf.shortcuts.forEach(inliner.globalShortcuts.add);
        }
      }
      console.error("inline-js started\n");
      return inliner.inline({name: "text", args: [file]});
    })
    .then(({content, dependency}) => {
      console.error(`Result inline tree:`);
      console.error(path.resolve(file));
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
