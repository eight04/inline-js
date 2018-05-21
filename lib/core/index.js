const {createShortcutExpander} = require("./shortcut");
const {createResourceLoader} = require("./resource");
const {createTransformer} = require("./transformer");

const {parsePipes, parseText} = require("./parser");

function createInliner({maxDepth}) {
  const resource = createResourceLoader();
  const transformer = createTransformer();
  const globalShortcuts = createShortcutExpander();
  return {
    inline: target => inline({target, depth: 0}),
    resource,
    transformer,
    globalShortcuts
  };
  
  // async
  function inline({source, target, depth}) {
    if (depth > maxDepth) {
      throw new Error(`Max recursion depth ${maxDepth} exceeded. If you are not making an infinite loop, try to increase --max-depth limit.`);
    }
    
    resource.resolve(source, target);
    const dependency = {};
    const shortcuts = globalShortcuts.clone();
    
    return resource.read(source, target)
      .then(content => {
        if (typeof content !== 'string') {
          return content;
        }
        return doParseText(content);
      })
      .then(content => ({content, dependency}));
      
    function inlineDirective(directive) {
      let pipes = parsePipes(directive.params[0]);
      if (shortcuts.has(pipes[0].name)) {
        pipes = parsePipes(shortcuts.expand(pipes));
      }
      const inlineTarget = {
        name: pipes[0].args.length ? pipes[0].name : "file",
        args: pipes[0].args.length ? pipes[0].args : [pipes[0].name]
      };
      const transforms = pipes.slice(1);
      return inline({
        source: target,
        target: inlineTarget,
        depth: depth + 1
      })
        .then(({content, subDependency}) => {
          dependency[inlineTarget.args[0]] = subDependency;
          return transformer.transform(inlineTarget, content, transforms);
        });
    }

    function doParseText(content) {
      return Promise.all(
        parseText(content).map(result => {
          if (result.type === "text") {
            return result.value;
          }
          if (result.type == "$inline.shortcut") {
            shortcuts.add(...result.params);
            return "";
          }
          return inlineDirective(result);
        })
      )
        .then(contentArr => {
          if (contentArr.some(Buffer.isBuffer)) {
            return Buffer.concat(contentArr.map(b => {
              if (!Buffer.isBuffer(b)) {
                b = Buffer.from(b, "binary");
              }
              return b;
            }));
          }
          return contentArr.join("");
        });
    }
  }
  
}

module.exports = {createInliner};
