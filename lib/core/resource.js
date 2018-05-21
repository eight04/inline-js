function createResourceLoader() {
  const resources = new Map;
  const cache = new Map;

  return {
    add,
    remove,
    read,
    resolve
  };
  
  function add(reader) {
    resources.set(reader.name, reader);
  }
  
  function remove(name) {
    resources.delete(name);
  }
  
  function read(source, target) {
    const reader = resources.get(target.name);
    const hash = reader.hash && reader.hash(source, target);
    let result;
    if (hash && cache.has(hash)) {
      result = cache.get(hash);
    } else {
      result = reader.read(source, target);
      if (hash) {
        cache.set(hash, result);
      }
    }
    return Promise.resolve(result);
  }
  
  function resolve(source, target) {
    const reader = resources.get(target.name);
    if (reader.resolve) {
      reader.resolve(source, target);
    }
  }
}

module.exports = {createResourceLoader};
