function runInNewContext(code, context) {
  const $0 = context.$0;
  return eval(code);
}

module.exports = {runInNewContext};
