const treeify = require("treeify");
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
  
  if (options.config) {
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

module.exports = {createDefaultInliner, buildDependency};
