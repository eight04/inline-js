const path = require("path");

const fse = require("fs-extra");
const treeify = require("treeify");
const {findConfig} = require("config-locator");
const {createInliner} = require("inline-js-core");

const {RESOURCES, PATH_LIKE} = require("inline-js-default-resources");
const {TRANSFORMS} = require("inline-js-default-transforms");

function createTree(children) {
  return children.reduce((o, curr) => {
    const name = (PATH_LIKE.has(curr.target.name) ? "" : curr.target.name + ":") +
      curr.target.args[0];
    o[name] = createTree(curr.children);
    return o;
  }, {});
}

function createDefaultInliner(options) {
  const inliner = createInliner(options);
  
  RESOURCES.forEach(inliner.resource.add);
  TRANSFORMS.forEach(inliner.transformer.add);
  
  if (options && options.config) {
    const conf = options.config;
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
  
  return inliner;
}

function buildDependency(root, children) {
  return `${root}\n${treeify.asTree(createTree(children))}`;
}

function init({
  "--out": out,
  "--dry-run": dryRun,
  "--max-depth": maxDepth,
  "<entry_file>": file,
  _outputFile = fse.outputFile,
  _log = console.error, // eslint-disable-line no-console
  _write = process.stdout.write.bind(process.stdout)
}) {
  _log("inline-js started\n");
  return findConfig(file, {config: ".inline.js"})
    .then(result => {
      const options = {maxDepth};
      if (result) {
        _log(`Use config file: ${result.filename}`);
        options.config = result.config;
      }
      return createDefaultInliner(options).inline({name: "text", args: [file]});
    })
    .then(({content, children}) => {
      _log(`Result inline tree:`);
      _log(buildDependency(path.resolve(file), children));
      
      if (dryRun) {
        _log(`[dry] Output to ${out || "stdout"}`);
      } else if (out) {
        return _outputFile(out, content);
      } else {
        _write(content);
      }
    });
}

module.exports = {createDefaultInliner, buildDependency, init};
