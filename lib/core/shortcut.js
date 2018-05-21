const {escapePipeValue, pipesToString} = require("./parser");

function createShortcutExpander(parent) {
  const shortcuts = new Map;
  const self = {add, remove, clone, has, expand, lookup};
  return self;
  
  function add(shortcut) {
    shortcuts.set(shortcut.name, shortcut);
  }
  
  function remove(name) {
    shortcuts.delete(name);
  }
  
  function clone() {
    return createShortcutExpander(self);
  }
  
  function has(name) {
    return shortcuts.has(name) || parent && parent.has(name);
  }
  
  function lookup(name) {
    return shortcuts.get(name) || parent && parent.lookup(name);
  }
  
  function expand(target, pipes) {
    const [shortcut, ...transforms] = pipes;
    const expander = lookup(shortcut.name);
    let expanded;
    if (typeof expander.expand == "function") {
      expanded = expander.expand(target, ...shortcut.args);
    } else if (typeof expander.expand == "string") {
      expanded = expander.expand.replace(/\$(\d+|&)/g, (match, n) => {
        if (n == "&") {
          return shortcut.args.map(escapePipeValue).join(",");
        }
        return shortcut.args[n - 1];
      });
    } else {
      throw new Error("shortcut.expand must be a string or a function");
    }
    if (!transforms.length) {
      return expanded;
    }
    return `${expanded}|${pipesToString(transforms)}`;
  }
}

module.exports = {createShortcutExpander};
