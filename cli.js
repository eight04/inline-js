#!/usr/bin/env node

var neodoc = require("neodoc"),
	args = neodoc.run(`inlinejs

Usage:
  inlinejs [options] <entry_file>

Options:
  -o --out FILE         Output file. Print to stdout if omitted.
  -d --max-depth COUNT  Max depth of the dependency tree. [default: 10]
  -n --dry-run          Print the file name instead of writing to disk.
  -h --help             Show this.
  -v --version          Show version.`, {
		laxPlacement: true
	});

init(args)
  .catch(err => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });

function init({
  "--out": out,
  "--dry-run": dryRun,
  "--max-depth": maxDepth,
  "<entry_file>": file,
  _outputFile = null,
  _log = console.error, // eslint-disable-line no-console
  _write = process.stdout.write.bind(process.stdout)
}) {
  const fse = require("fs-extra");
  const path = require("path");
  const {findConfig} = require("config-locator");
  const {createDefaultInliner, buildDependency} = require(".");
  if (!_outputFile) {
    _outputFile = fse.outputFile;
  }
  
  _log("inline-js started\n");
  return findConfig(file, {config: ".inline.js"})
    .then(result => {
      const options = {maxDepth};
      if (result) {
        _log(`Use config file: ${result.filename}`);
        options.config = result.config;
      }
      return createDefaultInliner(options).inline({name: "text", args: [file]});
    })
    .then(({content, children}) => {
      _log(`Result inline tree:`);
      _log(buildDependency(path.resolve(file), children));
      
      if (dryRun) {
        _log(`[dry] Output to ${out || "stdout"}`);
      } else if (out) {
        return _outputFile(out, content);
      } else {
        _write(content);
      }
    });
}
