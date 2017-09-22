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
$inline("./b.txt");

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
### Use .shortcut
Use .shortcut to deal with repeated patterns. Shortcut is composed by a name and a expanding pattern. You can use $1...$9 to referece the params.
```
// $inline.shortcut("pkg", "../package.json|parse:$1")
var version = $inline("pkg:version"),
	author = $inline("pkg:author");
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
  -n --dry-run          Print the file name instead of writing to disk.
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
Convert the content into dataurl.

The transformer would determine the mimetype from filename:
```
$inline("mystyle.css|dataurl")
->
data:text/css;charset=utf8;base64,...
```
Or you can pass the mimetype manually:
```
$inline("somefile.txt|dataurl:text/css")
```
Specify charset (default to `utf8`):
```
$inline("somefile.txt|dataurl:text/css,utf8")
```

### docstring
Extract docstring (i.e. the first template literal) from the js file.

### eval
Eval JavaScript expression. You can access the content with `$0`.
```
var version = $inline("./package.json|eval:JSON.parse($0).version|stringify");
```

### markdown
Wrap content with markdown codeblock, code, or quote.
<pre><code>// a.txt
some text

// $inline("a.txt|markdown:codeblock")
```
some text
```

// $inline("a.txt|markdown:code")
`some text`

// $inline("a.txt|markdown:quote")
> sometext</code></pre>

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

Use `.inline.js`
----------------
You can create your transformer and shortcut with this file.

Create a `.inline.js` file in your package root:
```
module.exports = {
	shortcuts: [{
		name: "myshortcut",
		expand: "pattern-to-expand",
		// or use a function
		expand: function (file, arg1, arg2, ...args) {
			// create expand pattern
			return pattern;
		}
	}, ...],
	transforms: [{
		name: "mytransform",
		transform: function (file, content, arg1, arg2, ...args) {
			// do something to the content
			return content;
		}
	}, ...]
};
```

Changelog
---------

* 0.4.0 (Sep 22, 2017)

	- Fix: dataurl is unable to handle binary file.
	- **Change: now transformer would recieve a `file` argument.**
	- Add: make `dataurl` determine mimetype by filename.

* 0.3.1 (Sep 19, 2017)

	- Fix crlf error. [#3](https://github.com/eight04/inline-js/issues/3)

* 0.3.0 (Feb 4, 2017)

	- Add $inline.shortcut.

* 0.2.0 (Jan 21, 2017)

	- Add $inline.open, close, skipStart, skipEnd, start, end, line.
	- Add transformer docstring, markdown, parse.
	- Change eval transformer.
	- Improve logging.
	- Add --max-depth option.
	- Other bugfixes.

* 0.1.0 (Jan 21, 2017)

    - First release.
