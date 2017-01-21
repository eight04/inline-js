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

require("./index").init({args});
