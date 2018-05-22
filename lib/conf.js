const path = require("path");
const fse = require("fs-extra");
const requireAsync = require("node-require-async")(module);

function tryAccess(file) {
  return fse.access(file)
    .then(() => true)
    .catch(() => false);
}

function tryRequire(file) {
  return requireAsync(file)
    .catch(() => false);
}

function createConfigLocator({_tryRequire = tryRequire, _tryAccess = tryAccess} = {}) {
  const cache = new Map;
  return {findConfig};
  
  function findConfig(file) {
    let dir = path.dirname(path.resolve(file));
    return searchDir(dir);
  }
  
  function searchDir(dir) {
    const cachedResult = cache.get(dir);
    if (cachedResult) {
      return cachedResult;
    }
    const confPath = path.join(dir, ".inline.js");
    const pkgPath = path.join(dir, "package.json");
    const pendingPkg = _tryAccess(pkgPath);
    const pending = _tryRequire(confPath)
      .then(conf => {
        if (conf) {
          return {conf, confPath};
        }
        return pendingPkg.then(pkg => {
          if (!pkg) {
            const parentDir = path.dirname(dir);
            if (parentDir !== dir) {
              return searchDir(parentDir);
            }
          }
          return null;
        });
      });
    cache.set(dir, pending);
    return pending;
  }
}

module.exports = {
  findConfig: file => createConfigLocator().findConfig(file),
  createConfigLocator,
  tryRequire,
  tryAccess
};
