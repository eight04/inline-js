function createTransformer() {
  const transformer = new Map;
  return {add, remove, transform};
  
  function add(transform) {
    transformer.set(transform.name, transform);
  }
  
  function remove(name) {
    transformer.delete(name);
  }
  
  function transform(target, content, transforms) {
    return transforms.reduce((pending, transform) => {
      return pending.then(content => {
        return transformer.get(transform.name).transform(
          target,
          content,
          ...transform.args
        );
      });
    }, Promise.resolve(content));
  }
}

module.exports = {createTransformer};
