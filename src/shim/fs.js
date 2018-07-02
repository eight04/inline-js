const path = require("path");
const files = new Map;

function readFileSync(file) {
  file = path.resolve(file);
  if (!files.has(file)) {
    throw new Error(`file not found: ${file}`);
  }
  return files.get(file);
}

function readFile(file) {
  try {
    return Promise.resolve(readFileSync(file));
  } catch (err) {
    return Promise.reject(err);
  }
}

function unlinkSync(file) {
  file = path.resolve(file);
  files.delete(file);
}

function writeFileSync(file, data) {
  file = path.resolve(file);
  files.set(file, data);
}

module.exports = {
  readFile,
  readFileSync,
  unlinkSync,
  writeFileSync
};
