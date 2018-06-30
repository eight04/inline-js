const files = new Map;

module.exports = {
  readFile(file) {
    if (!files.has(file)) {
      return Promise.reject(new Error("ENOENT"));
    }
    return Promise.resolve(files.get(file));
  },
  readFileSync(file) {
    if (!files.has(file)) {
      throw new Error("ENOENT");
    }
    return files.get(file);
  },
  unlinkSync(file) {
    files.delete(file);
  },
  writeFileSync(file, data) {
    files.set(file, data);
  }
};
