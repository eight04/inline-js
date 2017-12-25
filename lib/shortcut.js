const globalShortcuts = new Map;
const localShortcuts = new Map;

const {escapePipeValue, pipesToString} = require("./parser");

function add(source, name, expand) {
  let localMap = localShortcuts.get(source);
  if (!localMap) {
    localMap = new Map;
    localShortcuts.set(source, localMap);
  }
  localMap.set(name, {name, expand});
}

function addGlobal(shortcut) {
  globalShortcuts.set(shortcut.name, shortcut);
}

function expand(source, pipes) {
  const shortcut = getShortcut(source, pipes[0].name);
  let expanded;
  if (typeof shortcut.expand == "function") {
    expanded = shortcut.expand(source, ...pipes[0].args);
  } else if (typeof shortcut.expand == "string") {
    expanded = shortcut.expand.replace(/\$(\d+|&)/g, (match, n) => {
      if (n == "&") {
        return pipes[0].args.map(escapePipeValue).join(",");
      }
      return pipes[0].args[n - 1];
    });
  } else {
    throw new Error("shortcut.expand must be a string or a function");
  }
  if (pipes.length === 1) {
    return expanded;
  }
  return `${expanded}|${pipesToString(pipes.slice(1))}`;
}

function remove(source) {
  localShortcuts.delete(source);
}

function getShortcut(file, name) {
  if (localShortcuts.has(file) && localShortcuts.get(file).has(name)) {
    return localShortcuts.get(file).get(name);
  }
  if (globalShortcuts.has(name)) {
    return globalShortcuts.get(name);
  }
  return null;
}

module.exports = {add, addGlobal, expand, remove};
