#!/usr/bin/env node

const neodoc = require("neodoc");
const args = neodoc.run(`inlinejs

Usage:
  inlinejs [options] <entry_file>

Options:
  -o --out FILE         Output file. Print to stdout if omitted.
  -w                    Write output to the same file as the input file.
  -d --max-depth COUNT  Max depth of the dependency tree. [default: 10]
  -n --dry-run          Print the file name instead of writing to disk.
  -h --help             Show this.
  -v --version          Show version.`, {
  laxPlacement: true
});

require(".").init(args)
  .catch(err => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
