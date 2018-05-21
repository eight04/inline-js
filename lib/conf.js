const path = require("path");
const fs = require("fs");

function findConfig(file) {
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
	} while (path.parse(dir).base);
		
	if (conf) {
    return {conf, confPath};
  }
}

module.exports = {findConfig};
