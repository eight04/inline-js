inline-js
=========

A static assets inliner, like PHP's `include`, with transformer!

Installation
------------
```
npm install -g inline-js
```

Quick start
-----------
You have two files, `a.txt` and `b.txt`.
```
// a.txt
$inline("./a.txt");

// b.txt
Hello world!
```
Run inline-js:
```
inlinejs a.txt
```
Result:
```
Hello inline!
```

Syntax
------
### Inline a file
The `$inline()` statement will be replaced with the content of the file.
```
$inline("path/to/file")
```
### Use the transformer
```
$inline("path/to/file|transform1|transform2")
```
### Pass arguments to the transformer
```
$inline("path/to/file|transform1:arg|transform2:arg1,arg2")
```
### Replace current line
Entire line will be replaced. (not implement yet)
```
// this line will be replaced $inline.line("path/to/file") with the content of the file
```
### Use .start and .end
The lines between .start and .end will be replaced. (not implement yet)
```
// $inline.start("path/to/file") This line preserve
These lines
will
be
replaced
// $inline.end but not this line
```

CLI
----

```
inlinejs

Usage:
  inlinejs [options] <entry_file>

Options:
  -o --out FILE  Output file. Print to stdout if omitted.
  -n --dry-run   Print the file name instead of writing. (not implement yet)
  -h --help      Show this.
  -v --version   Show version.
```

Builtin transformers
--------------------

### cssmin
Minify css content.

### dataurl
Convert the content into dataurl. *Currently* our file reader only read file as utf8 encoded text, but it might be able to detect binary file in future release.

### eval
Eval the content as JavaScript code. The result will be saved in `$` variable. Use this transformer to extract JSON data.
```
var version = $inline("./package.json|eval:$.version|stringify");
```

### stringify
`JSON.stringify` the content. Useful to include text content into .js:
```
var myCssString = $inline("./style.css|cssmin|stringify");
```

### trim
`String.trim` the content.

Write your own transformer
--------------------------
Create a `.inline.js` file:
```
module.exports = {
	transformers: [{
		name: "mytransform",
		transform: (content, arg1, arg2, ...args) {
			// do something to the content
			return content;
		}
	}, ...]
};
```

Changelog
---------

* 0.1.0 (Jan 19, 2017)

    - First release.
