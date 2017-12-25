const readline = require("readline");

let logStream = process.stdout;

function write(data) {
  process.stdout.write(data);
}

function log(data = "", end = "\n") {
  logStream.write(data + end);
}

function clear() {
  readline.clearLine(process.stdout, -1);
  readline.cursorTo(process.stdout, 0, null);
}

function startDebug() {
  logStream = process.stderr;
}

function getLogStream() {
  return logStream;
}

module.exports = {write, log, clear, startDebug, getLogStream};
