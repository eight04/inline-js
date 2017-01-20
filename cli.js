#!/usr/bin/env node

var neodoc = require("neodoc"),
	args = neodoc.run(`inlinejs

Usage:
  inlinejs [options] <entry_file>

Options:
  -o --out FILE  Output file. Print to stdout if omitted.
  -n --dry-run   Print the file name instead of writing. (not implement yet)
  -h --help      Show this.
  -v --version   Show version.`, {
		laxPlacement: true
	});

require("./index").init({args});
