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
<!-- $inline.skipStart -->
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
Hello world!
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
Entire line will be replaced.
```
// this line will be replaced $inline.line("path/to/file") with the content of the file
```
### Use .start and .end
The lines between .start and .end will be replaced.
```
// $inline.start("path/to/file") This line preserve
These lines
will
be
replaced
// $inline.end but not this line
```
### Use .skipStart and .skipEnd
Skip the content beween .skipStart and .skipEnd.
```
// $inline.skipStart
$inline('path/to/file') this line won't be inlined
// $inline.skipeEnd
```
### Use .open and .close
The content between .open and .close will be replaced. The additional argument is how many characters to skip.
```
<!--$inline.open("path/to/file", 3)-->Replace me<!--$inline.close(4)-->
```

CLI
----
<!-- $inline.skipEnd -->
<!-- $inline.start("./cli.js|docstring|markdown:codeblock") -->
```
inlinejs

Usage:
  inlinejs [options] <entry_file>

Options:
  -o --out FILE         Output file. Print to stdout if omitted.
  -d --max-depth COUNT  Max depth of the dependency tree. [default: 10]

  -n --dry-run          Print the file name instead of writing. (not implement
                        yet)

  -h --help             Show this.
  -v --version          Show version.
```
<!-- $inline.end -->
<!-- $inline.skipStart -->

Builtin transformers
--------------------

### cssmin
Minify css content.

### dataurl
Convert the content into dataurl. *Currently* our file reader only read file as utf8 encoded text, but it might be able to detect binary file in future release.

### docstring
Extract docstring (i.e. the first template literal) from the js file.

### eval
Eval JavaScript expression. You can access the content with `$0`.
```
var version = $inline("./package.json|eval:JSON.parse($0).version|stringify");
```

### parse
`JSON.parse` the content. You can access property by specify property name.
```
var version = $inline("./package.json|parse:version"),
	nestedProp = $inline("./package.json|parse:nested,prop");
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
Create a `.inline.js` file in your package root:
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

* 0.1.0 (Jan 21, 2017)

    - First release.
