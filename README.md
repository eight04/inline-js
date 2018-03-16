inline-js
=========

[![Build Status](https://travis-ci.org/eight04/inline-js.svg?branch=dev-async)](https://travis-ci.org/eight04/inline-js)
[![Coverage Status](https://coveralls.io/repos/github/eight04/inline-js/badge.svg?branch=dev-async)](https://coveralls.io/github/eight04/inline-js?branch=dev-async)

A static assets inliner, like PHP's `include`, with transformer!

Installation
------------
```
npm install -g inline-js
```

Quick start
-----------
You have two files, `a.txt` and `b.txt`.
<!-- $inline.skipStart("toUsage") -->
```js
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

An $inline directive is composed by:

1. A `$inline` function.
2. A resource definition which includes a resource and optional transformers.

`$inline` function
------------------

### Replace the directive with the content

* `$inline(resource)`: The `$inline()` function will be replaced with the content of the file.

  ```js
  const a = "$inline(resource)";
  ```
  Which would be converted to:
  ```js
  const a = "the content of the resource";
  ```

* `$inline.line(resource)`: Entire line will be replaced.

  ```js
  /* $inline.line(resource) */
  ```
  Which would be converted to:
  ```js
  the content of the resource
  ```
  
### Replace the text wrapped by a pair of directives

* `$inline.start(resource)` and `$inline.end`: Mark multiple lines which would be replaced by the content. *There must be at leat one line between two directives, or there is no space to insert the content.*

  ```js
  /* $inline.start(resource) */
  Multiple
  lines
  /* $inline.end */
  ```
  Which would be converted to:
  ```js
  /* $inline.start(resource) */
  the content of the resource
  /* $inline.end */
  ```
  
* `$inline.open(resource, skipChars)` and `$inline.close(skipChars)`: Replace the text between two functions. `skipChars` is a number which indicates how many characters should be skipped.

  ```html
  <!--$inline.open(resource, 3)-->Some text<!--$inline.close(4)-->
  ```
  Which would be converted to:
  ```html
  <!--$inline.open(resource, 3)-->the content of the resource<!--$inline.close(4)-->
  ```
    
### Define shortcuts

Shortcut is composed by a name and a expanding pattern. You can use `$1`, `$2`, ...`$9`, or `$&` to referece the parameters.

```js
// $inline.shortcut("pkg", "../package.json|parse:$1")
var version = $inline("pkg:version"),
  author = $inline("pkg:author");
```
Which would be processed as:
```js
// $inline.shortcut("pkg", "../package.json|parse:$1")
var version = $inline("../package.json|parse:version"),
  author = $inline("../package.json|parse:author");
```
  
### Ignore `$inline` directives

Sometimes we want to disable inline-js on some directives, we can wrap the content in `$inline.skipStart` and `$inline.skipEnd`.

```js
$inline('path/to/file') // OK
$inline.skipStart
$inline('path/to/file') // won't be processed
$inline.skipEnd
$inline('path/to/file') // OK
```

Additional identifier is required if the content contains `$inline.skipEnd`.

```js
$inline.skipStart("skipThisSection")
$inline.skipEnd // won't be processed
$inline('path/to/file') // won't be processed
$inline.skipEnd("skipThisSection")
```

Resource
--------

Resource is a JavaScript string so some characters (`'`, `"`) needs to be escaped. It uses [pipe expression](https://www.npmjs.com/package/haye#pipe-expression). If written in regular expression:

```
(resourceType:)? resourceParam (| transform (: param (,param)* )? )*
```

* If `resourceType` is missing, it defaults to `"file"`.
* Reserved keywords (`,` and `|`) in params need to be escaped with `\`.

Examples:

```js
$inline("path/to/file")
$inline("path/to/file|transform1|transform2")
$inline("path/to/file|transform1:param1,param2|transform2")
```

Different resource type
-----------------------

inline-js can read content from different resources, which result in different type of the content (`string` or `Buffer`). The type of the content may also affect how transformers work (e.g. `dataurl` transformer).

* `file`: Default type. It reads the content from a file path, which may be relative to the file which requires the resource.

  The result could be a utf8 string or a `Buffer`, depending on the extension of the file. (See [is-binary-path](https://www.npmjs.com/package/is-binary-path))
  
* `text`: Like `file`, but the result is always a utf8 string.
* `raw`: Like `file`, but the result is always a `Buffer`.
* `cmd`: Execute a command and read the stdout as a utf8 string. You may pass the second argument which represent the encoding (default: `"utf8"`). Passing `"buffer"` to get raw `Buffer` object.

  ```js
  Current date: $inline("cmd:date /t")
  ```
  
File-like resources would be cached after loaded, so inlining the same file with the same resource type multiple times would only read once.

Command resources are also cached, but it depends on cwd. For example:

* The command `cat myfile` is executed once, with `cwd = "."`.

  ```js
  // entry.txt
  $inline("a.txt")
  $inline("b.txt")
  
  // a.txt
  $inline("cmd:cat myfile")

  // b.txt
  $inline("cmd:cat myfile")
  ```
  
* The command is executed twice. The first with `cwd = "."` and the second with `cwd = "./dir"`.

  ```js
  // entry.txt
  $inline("a.txt")
  $inline("dir/b.txt")
  
  // a.txt
  $inline("cmd:cat myfile")

  // dir/b.txt
  $inline("cmd:cat myfile")
  ```

CLI
----
<!-- $inline.skipEnd("toUsage") -->
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
<!-- $inline.skipStart("toEnd") -->

Builtin transformers
--------------------

### cssmin
Minify css content.

### dataurl
Convert the content into data URL.

The transformer would determine the mimetype from filename:
```js
// data:text/css;charset=utf8;base64,...
$inline("mystyle.css|dataurl")

// data:image/png;base64,...
$inline("myimage.png|dataurl")
```
Or you can pass the mimetype manually:
```js
$inline("somefile.txt|dataurl:text/css")
```
Specify charset (default to `utf8` for text file):
```js
$inline("somefile.txt|dataurl:text/css,utf8")
```

### docstring
Extract docstring (i.e. the first template literal) from the content.

### eval
Eval JavaScript expression. You can access the content with `$0`.
```js
var version = $inline("./package.json|eval:JSON.parse($0).version|stringify");
```

### markdown
Wrap content with markdown codeblock, code, or quote.
````js
// a.txt
some text

// $inline("a.txt|markdown:codeblock")
```
some text
```

// $inline("a.txt|markdown:code")
`some text`

// $inline("a.txt|markdown:quote")
> sometext
````

### parse
`JSON.parse` the content. You can access property by specify property name.
```js
var version = $inline("./package.json|parse:version"),
  nestedProp = $inline("./package.json|parse:nested,prop");
```

### string

If the content is a buffer, convert it into a utf8 string. Otherwise do nothing.

### stringify
`JSON.stringify` the content. Useful to include text content into JavaScript code:
```js
var myCssString = $inline("./style.css|cssmin|stringify");
```

### trim
`String.prototype.trim` the content.

Use `.inline.js`
----------------
You can add your resource, transformer, and shortcut with this file.

Create a `.inline.js` file in your package root:

```js
module.exports = {
  resources: [{
    name: "myresource",
    read: function (source, target) {
      // fetch the source
      return fetchResource(target.args[0]);
    }
  }, ...],
  shortcuts: [{
    name: "myshortcut",
    expand: "pattern-to-expand",
    // or use a function
    expand: function (target, arg1, arg2, ...) {
      // create expand pattern
      return pattern;
    }
  }, ...],
  transforms: [{
    name: "mytransform",
    transform: function (target, content, arg1, arg2, ...) {
      // do something to the content
      return content;
    }
  }, ...]
};
```

`resource.read` and `transformer.transform` may return a promise.

Changelog
---------

* 0.6.1 (Mar 16, 2018)

  - Fix: throw when cmd resource return non-zero exit code.

* 0.6.0 (Dec 26, 2017)

  - Completely rewritten in async manner.
  - **Change: the first argument of the transformer is changed to a resource object.**
  - **Change: resources are read in parallel.**
  - **Change: resources are cached after loaded.**
  - Add: `resources` in `.inline.js`.
  - Add: `cmd` resource.
  - Add: `transformer.transform` and `resource.read` may return a promise.

* 0.5.0 (Sep 26, 2017)

  - **Change: now the file would be read as binary accroding to its extension.**
  - Add: ability to read/write binary file.
  - Add: source type `text`, `raw`.

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
