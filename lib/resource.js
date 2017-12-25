const path = require("path");
const isBinaryPath = require("is-binary-path");
const fse = require("fs-extra");
const childProcess = require("child_process");

const resources = new Map;
const cache = new Map;

const PATH_LIKE = new Set(["file", "text", "raw"]);

const DEFAULT_READERS = [{
	name: "file",
	read: readFile
}, {
	name: "text",
	read: (...args) => readFile(...args, false)
}, {
	name: "raw",
	read: (...args) => readFile(...args, true)
}, {
	name: "cmd",
	read: readCmd
}];

DEFAULT_READERS.forEach(add);

function readFile(source, target, isBinary = isBinaryPath(target.args[0])) {
	return fse.readFile(
		path.resolve(getDir(source), target.args[0]),
		isBinary ? null : "utf8"
	);
}

function readCmd(source, target) {
	return new Promise((resolve, reject) => {
		const options = {
			cwd: getDir(source)
		};
		childProcess.exec(target.args[0], options, (err, stdout) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(stdout);
		});
	});
}

function getDir(source) {
	return isPath(source) ? path.dirname(source.args[0]) : ".";
}

function add(reader) {
	resources.set(reader.name, reader);
}

function read(source, target) {
	const sign = JSON.stringify([source, target]);
	if (!cache.has(sign)) {
		const reader = resources.get(target.name);
		cache.set(sign, reader.read(source, target));
	}
	return cache.get(sign);
}

function resolve(source, target) {
  if (isPath(target)) {
    target.args[0] = path.resolve(getDir(source), target.args[0]);
  }
}

function isPath(source) {
  return source && PATH_LIKE.has(source.name);
}

function toHash(source) {
  return `${source.name}:${source.args.join(",")}`;
}

module.exports = {add, read, resolve, PATH_LIKE, toHash};
