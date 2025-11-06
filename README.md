inline-js
=========

[![Build Status](https://travis-ci.com/eight04/inline-js.svg?branch=master)](https://travis-ci.com/eight04/inline-js)
[![Coverage Status](https://coveralls.io/repos/github/eight04/inline-js/badge.svg?branch=master)](https://coveralls.io/github/eight04/inline-js?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=inline-js)](https://packagephobia.now.sh/result?p=inline-js)

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
*a.txt*
```js
$inline("./b.txt");
```

*b.txt*
```
Hello world!
```
Run `inlinejs` command:
```console
$ inlinejs a.txt
```
Result:
```
Hello world!
```

Try it online
-------------

https://eight04.github.io/inline-js/

Syntax
------

An $inline directive is composed by:

1. A `$inline` function.
2. A resource definition, including a resource and optional transformers.

### $inline

```js
$inline(resource)
```

The `$inline()` directive will be replaced with the content of the file.

```js
const a = "$inline(resource)";
```
Which would be converted to:
```js
const a = "the content of the resource";
```
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiY29uc3QgYSA9IFwiJGlubGluZSgnZm9vLnR4dCcpXCI7In0seyJuYW1lIjoiZm9vLnR4dCIsInR5cGUiOiJ0ZXh0IiwiZGF0YSI6IlRoZSBjb250ZW50IG9mIGZvby50eHQifV0=)
  
If you want to expand the replace range, pass offsets to the function:

```js
const a = /* $inline(resource, 3, 3) */;
```
Which would be converted to:
```js
const a = the content of the resource;
```
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiY29uc3QgYSA9IC8qICRpbmxpbmUoXCJmb28udHh0XCIsIDMsIDMpICovOyJ9LHsibmFtZSI6ImZvby50eHQiLCJ0eXBlIjoidGV4dCIsImRhdGEiOiJUaGUgY29udGVudCBvZiBmb28udHh0In1d)

### $inline.line

```js
$inline.line(resource)
```

The entire line, excluding indent, will be replaced.

```js
function test() {
  /* $inline.line(resource) */
}
```
Which would be converted to:
```js
function test() {
  the content of the resource
}
```
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiZnVuY3Rpb24gdGVzdCgpIHtcbiAgLyogJGlubGluZS5saW5lKFwiZm9vLnR4dFwiKSAqL1xufVxuIn0seyJuYW1lIjoiZm9vLnR4dCIsInR5cGUiOiJ0ZXh0IiwiZGF0YSI6IlRoZSBjb250ZW50IG9mIGZvby50eHQifV0=)
  
### $inline.start + $inline.end

```js
$inline.start(resource)
...
...
...
$inline.end
```

Mark multiple lines which would be replaced by the content. *There must be at leat one line between two directives, or there is no space to insert the content.*

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
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiLyogJGlubGluZS5zdGFydChcImZvby50eHRcIikgKi9cbk11bHRpcGxlXG5saW5lc1xuLyogJGlubGluZS5lbmQgKi8ifSx7Im5hbWUiOiJmb28udHh0IiwidHlwZSI6InRleHQiLCJkYXRhIjoiVGhlIGNvbnRlbnQgb2YgZm9vLnR4dCJ9XQ==)

### $inline.open + $inline.close

```js
$inline.open(resource, skipChars) ... $inline.close(skipChars)
```

Replace the text between two directives. `skipChars` is a number indicating how many characters should be skipped.

```html
<!--$inline.open(resource, 3)-->Some text<!--$inline.close(4)-->
```
Which would be converted to:
```html
<!--$inline.open(resource, 3)-->the content of the resource<!--$inline.close(4)-->
```
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiPCEtLSRpbmxpbmUub3BlbihcImZvby50eHRcIiwgMyktLT5Tb21lIHRleHQ8IS0tJGlubGluZS5jbG9zZSg0KS0tPiJ9LHsibmFtZSI6ImZvby50eHQiLCJ0eXBlIjoidGV4dCIsImRhdGEiOiJUaGUgY29udGVudCBvZiBmb28udHh0In1d)
    
### $inline.shortcut

```js
$inline.shortcut(shortcutName, expansion)
```

A shortcut is composed by a name and an expand pattern. You can use `$1`, `$2`, ...`$9`, or `$&` to referece the parameters.

```js
// $inline.shortcut("pkg", "../package.json|parse:$&")
const version = $inline("pkg:version");
const author = $inline("pkg:author");
const other = $inline("pkg:other,property");
```
Which would be processed as:
```js
// $inline.shortcut("pkg", "../package.json|parse:$&")
const version = $inline("../package.json|parse:version");
const author = $inline("../package.json|parse:author");
const other = $inline("../package.json|parse:other,property");
```
[REPL](https://eight04.github.io/inline-js/#!W3sibmFtZSI6ImVudHJ5IiwidHlwZSI6InRleHQiLCJkYXRhIjoiLy8gJGlubGluZS5zaG9ydGN1dChcInBrZ1wiLCBcInBhY2thZ2UuanNvbnxwYXJzZTokJnxzdHJpbmdpZnlcIilcbmNvbnN0IHZlcnNpb24gPSAkaW5saW5lKFwicGtnOnZlcnNpb25cIik7XG5jb25zdCBhdXRob3IgPSAkaW5saW5lKFwicGtnOmF1dGhvclwiKTtcbmNvbnN0IG90aGVyID0gJGlubGluZShcInBrZzpvdGhlcixwcm9wZXJ0eVwiKTtcbiJ9LHsibmFtZSI6InBhY2thZ2UuanNvbiIsInR5cGUiOiJ0ZXh0IiwiZGF0YSI6IntcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xLjBcIixcbiAgXCJhdXRob3JcIjogXCJlaWdodDA0XCIsXG4gIFwib3RoZXJcIjoge1xuICAgIFwicHJvcGVydHlcIjogXCJmb29cIlxuICB9XG59In1d)
  
### $inline.skipStart + $inline.skipEnd

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

If `$inline.skipEnd` isn't presented, it would ignore the entire file.

Resource
--------

Resource is a JavaScript string so some characters (`'`, `"`) needs to be escaped. It uses pipe expression. If written in regular expression:

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

inline-js can read content from different resources, which results in different types of the content (`string` or `Buffer`). The type of the content may also affect how transformers work (e.g. `dataurl` transformer).

* `file`: Default type. It reads the content from a file path, which may be relative to the file which requires the resource.

  The result could be a utf8 string or a `Buffer`, depending on the extension of the file (see [is-binary-path](https://www.npmjs.com/package/is-binary-path)).
  
* `text`: Like `file`, but the result is always a utf8 string.
* `raw`: Like `file`, but the result is always a `Buffer`.
* `cmd`: Execute a command and read the stdout as a utf8 string. You may pass the second argument which represent the encoding (default: `"utf8"`). Passing `"buffer"` to get raw `Buffer` object.

  ```js
  Current date: $inline("cmd:date /t")
  ```
  
File-like resources would be cached after loaded, so inlining the same file with the same resource type multiple times would only read once.

Command resources are also cached, but it depends on cwd. For example:

* In this example, the command `cat myfile` is executed once, with `cwd = "."`.

  *entry.txt*
  ```js
  $inline("a.txt")
  $inline("b.txt")
  ```
  *a.txt*
  ```js
  $inline("cmd:cat myfile")
  ```  
  *b.txt*
  ```js
  $inline("cmd:cat myfile")
  ```
  
* In this example, the command is executed twice. The first with `cwd = "."` and the second with `cwd = "./dir"`.

  *entry.txt*
  ```js
  $inline("a.txt")
  $inline("dir/b.txt")
  ```
  *a.txt*
  ```js
  $inline("cmd:cat myfile")
  ```
  *dir/b.txt*
  ```js
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

Transformer
-----------

[The list of builtin transformers](https://github.com/eight04/inline-js-default-transforms#transforms)

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

* 0.9.0 (Nov 6, 2025)

  - Bump dependencies.

* 0.8.0 (Jul 2, 2018)

  - **Change: config locator and builtin transformers/resources had been split out.** This repository now only contains the CLI.
  - Add: github page, inline-js REPL.

* 0.7.0 (May 23, 2018)

  - The core inliner logic had been splitted out as [inline-js-core](https://github.com/eight04/inline-js-core). This repository now only contains:
  
    - Config locator.
    - Builtin resource loader.
    - Builtin transformers.
    
  - More tests.
  - Add: `indent` transformer. It would indent inlined file according to the indent of the current line.
  - Add: config locator has a cache now.
  - Add: `$inline()` now accepts up to 3 arguments.
  - Fix: Escaped characters are correctly handled in `docstring` transformer.
  - **Change: In `dataurl` transformer, `charset` is set to `utf8` if the content is a string. It makes sense since we actually always use `utf8` encoding to convert string to Buffer.**
  - **Change: The first argument of `transform()` function is changed to a `transformContext` object. To access the resource, visit `transformContext.inlineTarget`.**
  - **Change: `$inline.line()` now preserves indent. It doesn't replace the entire line anymore.**

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
