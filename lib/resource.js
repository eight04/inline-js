const path = require("path");
const childProcess = require("child_process");

const isBinaryPath = require("is-binary-path");
const fse = require("fs-extra");

const logger = require("./logger");

const resources = new Map;
const cache = new Map;

const PATH_LIKE = new Set(["file", "text", "raw"]);

const DEFAULT_READERS = [{
	name: "file",
	read: readFile,
  getSign: getFileSign
}, {
	name: "text",
	read: (...args) => readFile(...args, false),
  getSign: getFileSign
}, {
	name: "raw",
	read: (...args) => readFile(...args, true),
  getSign: getFileSign
}, {
	name: "cmd",
	read: readCmd,
  getSign: getCmdSign
}];

DEFAULT_READERS.forEach(add);

function getFileSign(source, target) {
  return JSON.stringify(target);
}

function getCmdSign(source, target) {
  return JSON.stringify([target, getDir(source)]);
}

function readFile(source, target, isBinary = isBinaryPath(target.args[0])) {
	return fse.readFile(
		path.resolve(getDir(source), target.args[0]),
		isBinary ? null : "utf8"
	);
}

function readCmd(source, target) {
	return new Promise((resolve, reject) => {
		const options = {
			cwd: getDir(source),
      stdio: [0, "pipe", 2],
      shell: true
		};
    const output = [];
		const cp = childProcess.spawn(target.args[0], options);
    cp.on("error", reject);
    cp.stdout.pipe(logger.getLogStream());
    cp.stdout.on("data", chunk => output.push(chunk));
    cp.stdout.on("end", () => {
      let data = Buffer.concat(output);
      if (target.args[1] !== "buffer") {
        data = data.toString(target.args[1]);
      }
      resolve(data);
    });
	});
}

function getDir(source) {
	return path.resolve(isPath(source) ? path.dirname(source.args[0]) : ".");
}

function add(reader) {
	resources.set(reader.name, reader);
}

function read(source, target) {
  const reader = resources.get(target.name);
  const sign = reader.getSign(source, target);
	if (!cache.has(sign)) {
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

module.exports = {add, read, resolve, PATH_LIKE};
