const asyncro = require("asyncro");
const fse = require("fs-extra");
const treeify = require("treeify");

const resource = require("./lib/resource");
const transformer = require("./lib/transformer");
const shortcut = require("./lib/shortcut");
const {parseText, parsePipes} = require("./lib/parser");
const conf = require("./lib/conf");
const logger = require("./lib/logger");

// async
function inline({source, target, depth = 0, maxDepth = 10, transforms = [], dependency = {}}) {
	if (depth > maxDepth) {
		throw new Error(`Max recursion depth ${maxDepth} exceeded, if you are not making an infinite loop please increase --max-depth limit`);
	}
  
  resource.resolve(source, target);
  dependency = dependency[target.args[0]] = {};
  
	return resource.read(source, target)
		.then(content => {
			if (typeof content !== 'string') {
				return content;
			}
      return doParseText(content);
		})
		.then(content => transformer.transform(target, content, transforms));
    
  function doParseText(content) {
    return asyncro
      .map(parseText(content), result => {
        if (result.type === "text") {
          return result.value;
        }
        if (result.type == "$inline.shortcut") {
          shortcut.add(target, ...result.params);
          return "";
        }
        let pipes = parsePipes(result.params[0]);
        if (shortcut.has(target, pipes[0].name)) {
          pipes = parsePipes(shortcut.expand(target, pipes));
        }
        const inlineTarget = {
          name: pipes[0].args.length ? pipes[0].name : "file",
          args: pipes[0].args.length ? pipes[0].args : [pipes[0].name]
        };
        return inline({
          source: target,
          target: inlineTarget,
          depth: depth + 1,
          maxDepth,
          dependency,
          transforms: pipes.slice(1)
        });
      })
      .then(text => {
        if (text.some(Buffer.isBuffer)) {
          return Buffer.concat(text.map(b => {
            if (!Buffer.isBuffer(b)) {
              b = Buffer.from(b, "binary");
            }
            return b;
          }));
        }
        return text.join("");
      });
  }
}

function init({
	args: {
		"--out": out,
		"--dry-run": dry,
		"--max-depth": maxDepth,
		"<entry_file>": file,
	}
}) {
	if (!dry && !out) {
		logger.startDebug();
	}

	logger.log("inline-js started\n");
  
  conf.findAndLoad(file);

	const target = {
    name: "text",
    args: [file]
  };
  const dependency = {};
  
  return inline({target, maxDepth, dependency}).then(content => {
    logger.log(`Result inline tree:`);
    logger.log(Object.keys(dependency)[0]);
    logger.log(treeify.asTree(Object.values(dependency)[0]));
    
    if (dry) {
      logger.log(`[dry] Output to ${out || "stdout"}`);
    } else if (out) {
      fse.outputFileSync(out, content);
    } else {
      logger.write(content);
    }
  });
}

module.exports = {init, inline};
