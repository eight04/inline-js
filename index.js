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
  "<entry_file>": file,
  _outputFileSync = fse.outputFileSync,
  _log = console.error, // eslint-disable-line no-console
  _write = process.stdout.write.bind(process.stdout)
}) {
  const inliner = createInliner({maxDepth});
  
  DEFAULT_RESOURCES.forEach(inliner.resource.add);
  DEFAULT_TRANSFORMS.forEach(inliner.transformer.add);
  
  _log("inline-js started\n");
  return findConfig(file)
    .then(result => {
      if (result) {
        const {conf, confPath} = result;
        _log(`Use config file: ${confPath}`);
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
      return inliner.inline({name: "text", args: [file]});
    })
    .then(({content, dependency}) => {
      _log(`Result inline tree:`);
      _log(path.resolve(file));
      _log(treeify.asTree(dependency));
      
      if (dryRun) {
        _log(`[dry] Output to ${out || "stdout"}`);
      } else if (out) {
        _outputFileSync(out, content);
      } else {
        _write(content);
      }
    });
}

module.exports = {init};
