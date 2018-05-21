const path = require("path");
const childProcess = require("child_process");

const isBinaryPath = require("is-binary-path");
const fse = require("fs-extra");

const PATH_LIKE = new Set(["file", "text", "raw"]);

const DEFAULT_RESOURCES = [{
	name: "file",
	read: readFile,
  hash: getFileSign,
  resolve
}, {
	name: "text",
	read: (...args) => readFile(...args, false),
  hash: getFileSign,
  resolve
}, {
	name: "raw",
	read: (...args) => readFile(...args, true),
  hash: getFileSign,
  resolve
}, {
	name: "cmd",
	read: readCmd,
  hash: getCmdSign
}];

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
    cp.stdout.pipe(process.stderr);
    cp.stdout.on("data", chunk => output.push(chunk));
    cp.on("close", exitCode => {
      if (exitCode) {
        reject(new Error(`Non-zero exit code: ${exitCode}`));
        return;
      }
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

function resolve(source, target) {
  target.args[0] = path.resolve(getDir(source), target.args[0]);
}

function isPath(source) {
  return source && PATH_LIKE.has(source.name);
}

module.exports = {DEFAULT_RESOURCES, PATH_LIKE};
