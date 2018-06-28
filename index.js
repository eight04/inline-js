const path = require("path");
const fse = require("fs-extra");
const treeify = require("treeify");
const {createInliner} = require("inline-js-core");

const {RESOURCES} = require("inline-js-default-resources");
const {TRANSFORMS} = require("inline-js-default-transforms");
const {findConfig} = require("config-locator");

function init({
  "--out": out,
  "--dry-run": dryRun,
  "--max-depth": maxDepth,
  "<entry_file>": file,
  _outputFile = fse.outputFile,
  _log = console.error, // eslint-disable-line no-console
  _write = process.stdout.write.bind(process.stdout)
}) {
  const inliner = createInliner({maxDepth});
  
  RESOURCES.forEach(inliner.resource.add);
  TRANSFORMS.forEach(inliner.transformer.add);
  
  _log("inline-js started\n");
  return findConfig(file, {config: ".inline.js"})
    .then(result => {
      if (result) {
        const {config: conf, filename: confPath} = result;
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
        return _outputFile(out, content);
      } else {
        _write(content);
      }
    });
}

module.exports = {init};
