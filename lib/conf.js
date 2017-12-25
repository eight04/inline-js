const path = require("path");
const fs = require("fs");

const resource = require("./resource");
const transformer = require("./transformer");
const shortcut = require("./shortcut");
const logger = require("./logger");

function load({resources, transformers, shortcuts}) {
	if (resources) {
		resources.forEach(resource.add);
	}
	if (transformers) {
		transformers.forEach(transformer.add);
	}
	if (shortcuts) {
		shortcuts.forEach(shortcut.add);
	}
}

function findAndLoad(file) {
	let dir = path.dirname(path.resolve(file));
  let confPath;
	let conf;
	do {
    confPath = path.join(dir, ".inline.js");
		try {
			conf = require(confPath);
			// found
			break;
		} catch (err) {
      // pass
    }
		try {
			fs.accessSync(path.join(dir, "package.json"));
			// don't go upper than package root
			break;
		} catch (err) {
      // pass
    }
		dir = path.join(dir, "..");
	} while (!path.parse(dir).base);
		
	if (conf) {
		load(conf);
    logger.log(`Use config: ${confPath}`);
	}
}

module.exports = {findAndLoad, load};
