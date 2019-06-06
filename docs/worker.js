(function () {



var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance$1 = global$1.performance || {};
var performanceNow =
  performance$1.now        ||
  performance$1.mozNow     ||
  performance$1.msNow      ||
  performance$1.oNow       ||
  performance$1.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance$1)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) ; else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

const files = new Map;

function readFileSync(file) {
  file = posix.resolve(file);
  if (!files.has(file)) {
    throw new Error(`file not found: ${file}`);
  }
  return files.get(file);
}

function readFile(file) {
  try {
    return Promise.resolve(readFileSync(file));
  } catch (err) {
    return Promise.reject(err);
  }
}

function unlinkSync(file) {
  file = posix.resolve(file);
  files.delete(file);
}

function writeFileSync(file, data) {
  file = posix.resolve(file);
  files.set(file, data);
}

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @return {Buffer} Buffer instance from Data URI
 * @api public
 */

function dataUriToBuffer(uri) {
  if (!/^data\:/i.test(uri)) {
    throw new TypeError(
      '`uri` does not appear to be a Data URI (must begin with "data:")'
    );
  }

  // strip newlines
  uri = uri.replace(/\r?\n/g, '');

  // split the URI up into the "metadata" and the "data" portions
  var firstComma = uri.indexOf(',');
  if (-1 === firstComma || firstComma <= 4) {
    throw new TypeError('malformed data: URI');
  }

  // remove the "data:" scheme and parse the metadata
  var meta = uri.substring(5, firstComma).split(';');

  var type = meta[0] || 'text/plain';
  var typeFull = type;
  var base64 = false;
  var charset = '';
  for (var i = 1; i < meta.length; i++) {
    if ('base64' == meta[i]) {
      base64 = true;
    } else {
      typeFull += ';' + meta[i];
      if (0 == meta[i].indexOf('charset=')) {
        charset = meta[i].substring(8);
      }
    }
  }
  // defaults to US-ASCII only if type is not provided
  if (!meta[0] && !charset.length) {
    typeFull += ';charset=US-ASCII';
    charset = 'US-ASCII';
  }

  // get the encoded data portion and decode URI-encoded chars
  var data = unescape(uri.substring(firstComma + 1));

  var encoding = base64 ? 'base64' : 'ascii';
  var buffer = new Buffer(data, encoding);

  // set `.type` and `.typeFull` properties to MIME type
  buffer.type = type;
  buffer.typeFull = typeFull;

  // set the `.charset` property
  buffer.charset = charset;

  return buffer;
}

//     treeify.js
//     Luke Plaster <notatestuser@gmail.com>
//     https://github.com/notatestuser/treeify.js

// do the universal module definition dance
let _module_exports_;
(function (root, factory) {

  if (typeof _module_exports_ === 'object') {
    _module_exports_ = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.treeify = factory();
  }

}(self, function() {

  function makePrefix(key, last) {
    var str = (last ? '└' : '├');
    if (key) {
      str += '─ ';
    } else {
      str += '──┐';
    }
    return str;
  }

  function filterKeys(obj, hideFunctions) {
    var keys = [];
    for (var branch in obj) {
      // always exclude anything in the object's prototype
      if (!obj.hasOwnProperty(branch)) {
        continue;
      }
      // ... and hide any keys mapped to functions if we've been told to
      if (hideFunctions && ((typeof obj[branch])==="function")) {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  }

  function growBranch(key, root, last, lastStates, showValues, hideFunctions, callback) {
    var line = '', index = 0, lastKey, circular, lastStatesCopy = lastStates.slice(0);

    if (lastStatesCopy.push([ root, last ]) && lastStates.length > 0) {
      // based on the "was last element" states of whatever we're nested within,
      // we need to append either blankness or a branch to our line
      lastStates.forEach(function(lastState, idx) {
        if (idx > 0) {
          line += (lastState[1] ? ' ' : '│') + '  ';
        }
        if ( ! circular && lastState[0] === root) {
          circular = true;
        }
      });

      // the prefix varies based on whether the key contains something to show and
      // whether we're dealing with the last element in this collection
      line += makePrefix(key, last) + key;

      // append values and the circular reference indicator
      showValues && (typeof root !== 'object' || root instanceof Date) && (line += ': ' + root);
      circular && (line += ' (circular ref.)');

      callback(line);
    }

    // can we descend into the next item?
    if ( ! circular && typeof root === 'object') {
      var keys = filterKeys(root, hideFunctions);
      keys.forEach(function(branch){
        // the last key is always printed with a different prefix, so we'll need to know if we have it
        lastKey = ++index === keys.length;

        // hold your breath for recursive action
        growBranch(branch, root[branch], lastKey, lastStatesCopy, showValues, hideFunctions, callback);
      });
    }
  }
  // --------------------

  var Treeify = {};

  // Treeify.asLines
  // --------------------
  // Outputs the tree line-by-line, calling the lineCallback when each one is available.

  Treeify.asLines = function(obj, showValues, hideFunctions, lineCallback) {
    /* hideFunctions and lineCallback are curried, which means we don't break apps using the older form */
    var hideFunctionsArg = typeof hideFunctions !== 'function' ? hideFunctions : false;
    growBranch('.', obj, false, [], showValues, hideFunctionsArg, lineCallback || hideFunctions);
  };

  // Treeify.asTree
  // --------------------
  // Outputs the entire tree, returning it as a string with line breaks.

  Treeify.asTree = function(obj, showValues, hideFunctions) {
    var tree = '';
    growBranch('.', obj, false, [], showValues, hideFunctions, function(line) {
      tree += line + '\n';
    });
    return tree;
  };

  // --------------------

  return Treeify;

}));

// Copyright 2014, 2015, 2016, 2017, 2018 Simon Lydell
// License: MIT. (See LICENSE.)

const _module_exports_$1 = {};
Object.defineProperty(_module_exports_$1, "__esModule", {
  value: true
});

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
_module_exports_$1.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyus]{1,6}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;

_module_exports_$1.matchToToken = function(match) {
  var token = {type: "invalid", value: match[0], closed: undefined};
       if (match[ 1]) token.type = "string" , token.closed = !!(match[3] || match[4]);
  else if (match[ 5]) token.type = "comment";
  else if (match[ 6]) token.type = "comment", token.closed = !!match[7];
  else if (match[ 8]) token.type = "regex";
  else if (match[ 9]) token.type = "number";
  else if (match[10]) token.type = "name";
  else if (match[11]) token.type = "punctuator";
  else if (match[12]) token.type = "whitespace";
  return token
};

const {default: jsTokens, matchToToken} = _module_exports_$1;

class ParseError extends Error {
  constructor(message, pos) {
    super(message);
    this.pos = pos;
  }
}

const RX_WHITESPACE = /\s*/y;

function getWhitespace(text, pos) {
  RX_WHITESPACE.lastIndex = pos;
  return RX_WHITESPACE.exec(text)[0];
}

function getLineRange(text, pos, excludeIndent) {
  // FIXME: should we handle \r?
  let start, end;
  start = text.lastIndexOf("\n", pos - 1) + 1;
  end = text.indexOf("\n", pos);
  if (end < 0) {
    end = text.length;
  }
  if (excludeIndent) {
    const indent = getWhitespace(text, start);
    start += indent.length;
  }
  return {start, end};
}

function parseString(text) {
  if (text[0] == "'" || text[0] == "`") {
    text = '"' + text.slice(1, -1).replace(/([^\\]|$)"/g, '$1\\"') + '"';
  }
  return JSON.parse(text);
}

function parseDirective(text, pos = 0, flags = {}) {
  var match, token, info = {
    type: "$inline",
    start: null,
    end: null,
    params: []
  };
    
  jsTokens.lastIndex = pos;
  jsTokens.exec(text);  // skip $inline
  match = jsTokens.exec(text);
  if (match[0] == ".") {
    match = jsTokens.exec(text);
    token = matchToToken(match);
    if (token.type != "name") {
      throw new ParseError(`Expecting $inline method but got "${token.value}"`, match.index);
    } else {
      info.type += "." + token.value;
    }
    match = jsTokens.exec(text);
    if (!match) {
      info.end = text.length;
      return info;
    }
  }
  if (match[0] != "(") {
    info.end = jsTokens.lastIndex;
    return info;
  }
  flags.needValue = true;
  while ((match = jsTokens.exec(text))) {
    token = matchToToken(match);
    if (token.type == "whitespace" || token.type == "comment") {
      continue;
    }
    if (token.value == ")") {
      info.end = jsTokens.lastIndex;
      break;
    }
    if (flags.needValue == (token.type == "punctuator")) {
      throw new ParseError("Missing value", match.index);
    } else {
      flags.needValue = !flags.needValue;
      if (token.type == "punctuator") continue;
    }
    if (token.type == "number") {
      token.value = +token.value;
    } else if (token.type == "string") {
      if (!token.closed) {
        throw new ParseError("Unclosed string", match.index);
      }
      token.value = parseString(token.value);
    } else {
      throw new ParseError("Value must be number or string", match.index);
    }
    info.params.push(token.value);
  }
  if (!info.end) {
    throw new ParseError("Missing right parenthesis", text.length);
  }
  return info;
}

function parseText(content) {
  const output = [];
  let lastIndex = 0;
  var re = /\$inline[.(]/gi,
    match, type, params, 
    flags = {};
    
  function addDirective(directive) {
    if (lastIndex !== directive.start) {
      output.push({
        type: "text",
        value: content.slice(lastIndex, directive.start)
      });
    }
    output.push(directive);
    lastIndex = directive.end;
  }

  while ((match = re.exec(content))) {
    try {
      ({type, params, end: re.lastIndex} = parseDirective(content, match.index, flags));
    } catch (err) {
      if (flags.skip || flags.start || flags.open) {
        continue;
      }
      throw err;
    }
    
    if (flags.skip) {
      if (type == "$inline.skipEnd" && (flags.skip === params[0] || flags.skip === true)) {
        flags.skip = false;
      }
      continue;
    }
    
    if (flags.start) {
      if (type != "$inline.end") {
        continue;
      }
      flags.start.end = getLineRange(content, match.index).start - 1;
      if (flags.start.start > flags.start.end) {
        throw new ParseError(`There must be at leat one line between $inline.start and $inline.end`, flags.start.start);
      }
      addDirective(flags.start);
      flags.start = null;
      continue;
    }
    
    if (flags.open) {
      if (type != "$inline.close") {
        continue;
      }
      var offset = params && params[0] || 0;
      flags.open.end = match.index - offset;
      addDirective(flags.open);
      flags.open = null;
      continue;
    }
    
    if (type == "$inline.skipStart") {
      flags.skip = params[0] || true;
      continue;
    }
    
    if (type == "$inline.start") {
      flags.start = {
        type, params,
        start: getLineRange(content, match.index).end + 1
      };
      continue;
    }

    if (type == "$inline.open") {
      flags.open = {
        type, params,
        start: re.lastIndex + (params[1] || 0)
      };
      continue;
    }

    if (type == "$inline") {
      addDirective({
        type, params,
        start: match.index - (params[1] || 0),
        end: re.lastIndex + (params[2] || 0)
      });
      continue;
    }
    
    if (type == "$inline.line") {
      var {start, end} = getLineRange(content, match.index, true);
      addDirective({
        type, params,
        start, end
      });
      continue;
    }
    
    if (type == "$inline.shortcut") {
      output.push({
        type, params
      });
      continue;
    }
    
    throw new ParseError(`${type} is not a valid $inline statement`, match.index);
  }
  
  if (lastIndex !== content.length) {
    output.push({
      type: "text",
      value: content.slice(lastIndex)
    });
  }

  if (flags.start) {
    throw new ParseError("Missing $inline.end", flags.start.start);
  }
  
  if (flags.open) {
    throw new ParseError("Missing $inline.close", flags.open.start);
  }
  
  return output;
}

function parsePipes(text) {
  const nameRe = /\s*((?:\\:|\\\||[^:|])+?)\s*([:|]|$)/y;
  const valueRe = /\s*((?:\\\||\\,|[^|,])+?)\s*([,|]|$)/y;
  const output = [];
  while (nameRe.lastIndex < text.length) {
    const match = text.match(nameRe);
    const pipe = {
      name: unescapePipeName(match[1]),
      args: []
    };
    output.push(pipe);
    if (match[2] === "|") {
      continue;
    }
    valueRe.lastIndex = nameRe.lastIndex;
    while (valueRe.lastIndex < text.length) {
      const match = text.match(valueRe);
      pipe.args.push(unescapePipeValue(match[1]));
      if (match[2] === "|") {
        break;
      }
    }
    nameRe.lastIndex = valueRe.lastIndex;
  }
  return output;
}

function unescapePipeName(text) {
  return text.replace(/\\([:|])/g, "$1");
}

function unescapePipeValue(text) {
  return text.replace(/\\([,|])/g, "$1");
}

function escapePipeName(text) {
  return text.replace(/[:|]/g, "\\$&");
}

function escapePipeValue(text) {
  return text.replace(/[,|]/g, "\\$&");
}

function pipesToString(pipes) {
  return pipes.map(pipe => {
    const name = escapePipeName(pipe.name);
    if (!pipe.args.length) {
      return name;
    }
    const args = pipe.args.map(String).map(escapePipeValue);
    return `${name}:${args.join(",")}`;
  }).join("|");
}

function createShortcutExpander(parent) {
  const shortcuts = new Map;
  const self = {add, remove, clone, has, expand, lookup};
  return self;
  
  function add(shortcut) {
    if (typeof shortcut.expand !== "function" && typeof shortcut.expand !== "string") {
      throw new Error("shortcut.expand must be a string or a function");
    }
    shortcuts.set(shortcut.name, shortcut);
  }
  
  function remove(name) {
    shortcuts.delete(name);
  }
  
  function clone() {
    return createShortcutExpander(self);
  }
  
  function has(name) {
    return shortcuts.has(name) || parent && parent.has(name);
  }
  
  function lookup(name) {
    return shortcuts.get(name) || parent && parent.lookup(name);
  }
  
  function expand(target, pipes) {
    const [shortcut, ...transforms] = pipes;
    const expander = lookup(shortcut.name);
    let expanded;
    if (typeof expander.expand == "string") {
      expanded = expander.expand.replace(/\$(\d+|&)/g, (match, n) => {
        if (n == "&") {
          return shortcut.args.map(escapePipeValue).join(",");
        }
        return shortcut.args[n - 1];
      });
    } else {
      expanded = expander.expand(target, ...shortcut.args);
    }
    if (!transforms.length) {
      return expanded;
    }
    return `${expanded}|${pipesToString(transforms)}`;
  }
}

function createResourceLoader() {
  const resources = new Map;
  const cache = new Map;

  return {
    cache,
    add,
    remove,
    read,
    resolve
  };
  
  function add(reader) {
    resources.set(reader.name, reader);
  }
  
  function remove(name) {
    resources.delete(name);
  }
  
  function read(source, target) {
    const reader = resources.get(target.name);
    const hash = reader.hash && reader.hash(source, target);
    let result;
    if (hash && cache.has(hash)) {
      result = cache.get(hash);
    } else {
      result = reader.read(source, target);
      if (hash) {
        cache.set(hash, result);
      }
    }
    return Promise.resolve(result);
  }
  
  function resolve(source, target) {
    const reader = resources.get(target.name);
    if (!reader) {
      throw new Error(`Unknown resource name: ${target.name}`);
    }
    if (reader.resolve) {
      reader.resolve(source, target);
    }
  }
}

function createTransformer() {
  const transformer = new Map;
  return {add, remove, transform};
  
  function add(transform) {
    transformer.set(transform.name, transform);
  }
  
  function remove(name) {
    transformer.delete(name);
  }
  
  function transform(context, content, transforms) {
    return transforms.reduce((pending, transform) => {
      return pending.then(content => {
        const t = transformer.get(transform.name);
        if (!t) {
          throw new Error(`Unknown transformer ${transform.name}`);
        }
        return t.transform(
          context,
          content,
          ...transform.args
        );
      });
    }, Promise.resolve(content));
  }
}

function createInliner({
  maxDepth = 10,
  resource = createResourceLoader(),
  transformer = createTransformer(),
  globalShortcuts = createShortcutExpander()
} = {}) {
  return {
    inline,
    resource,
    transformer,
    globalShortcuts,
    useConfig
  };
  
  function useConfig(conf) {
    if (!conf) {
      return;
    }
    if (conf.resources) {
      conf.resources.forEach(resource.add);
    }
    if (conf.transforms) {
      conf.transforms.forEach(transformer.add);
    }
    if (conf.shortcuts) {
      conf.shortcuts.forEach(globalShortcuts.add);
    }
  }
  
  async function inline({source, target, depth = 0, content}) {
    if (depth > maxDepth) {
      throw new Error(`Max recursion depth ${maxDepth} exceeded.`);
    }
    
    // debugger;
    resource.resolve(source, target);
    const shortcuts = globalShortcuts.clone();
    if (!content) {
      content = await resource.read(source, target);
    }
    if (typeof content !== 'string') {
      return {
        content,
        target,
        children: []
      };
    }
    const parseResults = await Promise.all(parseText(content).map(inlineParseResult));
    return {
      target,
      content: joinContent(parseResults),
      children: parseResults.filter(r => r.target)
    };
      
    function inlineParseResult(result) {
      if (result.type === "text") {
        return {
          content: result.value
        };
      }
      if (result.type == "$inline.shortcut") {
        shortcuts.add({
          name: result.params[0],
          expand: result.params[1]
        });
        return {
          content: ""
        };
      }
      return inlineDirective(result);
    }
      
    function inlineDirective(directive) {
      let pipes = parsePipes(directive.params[0]);
      if (shortcuts.has(pipes[0].name)) {
        pipes = parsePipes(shortcuts.expand(target, pipes));
      }
      const inlineTarget = {
        name: pipes[0].args.length ? pipes[0].name : "file",
        args: pipes[0].args.length ? pipes[0].args : [pipes[0].name]
      };
      const transforms = pipes.slice(1);
      const transformContext = {
        source: target,
        sourceContent: content,
        inlineDirective: directive,
        inlineTarget
      };
      return inline({
        source: target,
        target: inlineTarget,
        depth: depth + 1
      })
        .then(inlineResult =>
          transformer.transform(
            transformContext,
            inlineResult.content,
            transforms
          )
            .then(content => {
              // use transformed content
              inlineResult.content = content;
              return inlineResult;
            })
        );
    }
  }

  function joinContent(resultArr) {
    if (resultArr.some(r => isBuffer(r.content))) {
      return Buffer.concat(resultArr.map(r =>
        isBuffer(r.content) ? r.content : Buffer.from(r.content, "binary")
      ));
    }
    return resultArr.map(r => r.content).join("");
  }
}

const _export_promisify_ = fn => fn;

var binaryExtensions = [
	"3ds",
	"3g2",
	"3gp",
	"7z",
	"a",
	"aac",
	"adp",
	"ai",
	"aif",
	"aiff",
	"alz",
	"ape",
	"apk",
	"ar",
	"arj",
	"asf",
	"au",
	"avi",
	"bak",
	"bh",
	"bin",
	"bk",
	"bmp",
	"btif",
	"bz2",
	"bzip2",
	"cab",
	"caf",
	"cgm",
	"class",
	"cmx",
	"cpio",
	"cr2",
	"csv",
	"cur",
	"dat",
	"dcm",
	"deb",
	"dex",
	"djvu",
	"dll",
	"dmg",
	"dng",
	"doc",
	"docm",
	"docx",
	"dot",
	"dotm",
	"dra",
	"DS_Store",
	"dsk",
	"dts",
	"dtshd",
	"dvb",
	"dwg",
	"dxf",
	"ecelp4800",
	"ecelp7470",
	"ecelp9600",
	"egg",
	"eol",
	"eot",
	"epub",
	"exe",
	"f4v",
	"fbs",
	"fh",
	"fla",
	"flac",
	"fli",
	"flv",
	"fpx",
	"fst",
	"fvt",
	"g3",
	"gif",
	"graffle",
	"gz",
	"gzip",
	"h261",
	"h263",
	"h264",
	"icns",
	"ico",
	"ief",
	"img",
	"ipa",
	"iso",
	"jar",
	"jpeg",
	"jpg",
	"jpgv",
	"jpm",
	"jxr",
	"key",
	"ktx",
	"lha",
	"lvp",
	"lz",
	"lzh",
	"lzma",
	"lzo",
	"m3u",
	"m4a",
	"m4v",
	"mar",
	"mdi",
	"mht",
	"mid",
	"midi",
	"mj2",
	"mka",
	"mkv",
	"mmr",
	"mng",
	"mobi",
	"mov",
	"movie",
	"mp3",
	"mp4",
	"mp4a",
	"mpeg",
	"mpg",
	"mpga",
	"mxu",
	"nef",
	"npx",
	"numbers",
	"o",
	"oga",
	"ogg",
	"ogv",
	"otf",
	"pages",
	"pbm",
	"pcx",
	"pdf",
	"pea",
	"pgm",
	"pic",
	"png",
	"pnm",
	"pot",
	"potm",
	"potx",
	"ppa",
	"ppam",
	"ppm",
	"pps",
	"ppsm",
	"ppsx",
	"ppt",
	"pptm",
	"pptx",
	"psd",
	"pya",
	"pyc",
	"pyo",
	"pyv",
	"qt",
	"rar",
	"ras",
	"raw",
	"rgb",
	"rip",
	"rlc",
	"rmf",
	"rmvb",
	"rtf",
	"rz",
	"s3m",
	"s7z",
	"scpt",
	"sgi",
	"shar",
	"sil",
	"sketch",
	"slk",
	"smv",
	"so",
	"sub",
	"swf",
	"tar",
	"tbz",
	"tbz2",
	"tga",
	"tgz",
	"thmx",
	"tif",
	"tiff",
	"tlz",
	"ttc",
	"ttf",
	"txz",
	"udf",
	"uvh",
	"uvi",
	"uvm",
	"uvp",
	"uvs",
	"uvu",
	"viv",
	"vob",
	"war",
	"wav",
	"wax",
	"wbmp",
	"wdp",
	"weba",
	"webm",
	"webp",
	"whl",
	"wim",
	"wm",
	"wma",
	"wmv",
	"wmx",
	"woff",
	"woff2",
	"wvx",
	"xbm",
	"xif",
	"xla",
	"xlam",
	"xls",
	"xlsb",
	"xlsm",
	"xlsx",
	"xlt",
	"xltm",
	"xltx",
	"xm",
	"xmind",
	"xpi",
	"xpm",
	"xwd",
	"xz",
	"z",
	"zip",
	"zipx"
];

const exts = new Set(binaryExtensions);

var isBinaryPath = filepath => exts.has(posix.extname(filepath).slice(1).toLowerCase());

const fsReadFile = _export_promisify_(readFile);

const PATH_LIKE = new Set(["file", "text", "raw"]);

const RESOURCES = [{
	name: "file",
	read: readFile$1,
  hash: getFileSign,
  resolve
}, {
	name: "text",
	read: (...args) => readFile$1(...args, false),
  hash: getFileSign,
  resolve
}, {
	name: "raw",
	read: (...args) => readFile$1(...args, true),
  hash: getFileSign,
  resolve
}, {
	name: "cmd",
	read: readCmd,
  hash: getCmdSign
}];

function getFileSign(source, target) {
  return JSON.stringify(target);
}

function getCmdSign(source, target) {
  return JSON.stringify([target, getDir(source)]);
}

function readFile$1(source, target, isBinary = isBinaryPath(target.args[0])) {
	return fsReadFile(
		posix.resolve(getDir(source), target.args[0]),
		isBinary ? null : "utf8"
	);
}

function readCmd(source, target) {
	return new Promise((resolve, reject) => {
		const options = {
			cwd: getDir(source),
      stdio: [0, "pipe", 2],
      shell: true
		};
    const output = [];
		const cp = childProcess.spawn(target.args[0], options);
    cp.on("error", reject);
    cp.stdout.pipe(process.stderr);
    cp.stdout.on("data", chunk => output.push(chunk));
    cp.on("close", exitCode => {
      if (exitCode) {
        reject(new Error(`Non-zero exit code: ${exitCode}`));
        return;
      }
      let data = Buffer.concat(output);
      if (target.args[1] !== "buffer") {
        data = data.toString(target.args[1]);
      }
      resolve(data);
    });
	});
}

function getDir(source) {
	return posix.resolve(isPath(source) ? posix.dirname(source.args[0]) : ".");
}

function resolve(source, target) {
  target.args[0] = posix.resolve(getDir(source), target.args[0]);
}

function isPath(source) {
  return source && PATH_LIKE.has(source.name);
}

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }
}

/**
 * Define mimetype -> xtension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type];
    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var _require__$types$standard_ = {
	"application/andrew-inset": [
	"ez"
],
	"application/applixware": [
	"aw"
],
	"application/atom+xml": [
	"atom"
],
	"application/atomcat+xml": [
	"atomcat"
],
	"application/atomsvc+xml": [
	"atomsvc"
],
	"application/bdoc": [
	"bdoc"
],
	"application/ccxml+xml": [
	"ccxml"
],
	"application/cdmi-capability": [
	"cdmia"
],
	"application/cdmi-container": [
	"cdmic"
],
	"application/cdmi-domain": [
	"cdmid"
],
	"application/cdmi-object": [
	"cdmio"
],
	"application/cdmi-queue": [
	"cdmiq"
],
	"application/cu-seeme": [
	"cu"
],
	"application/dash+xml": [
	"mpd"
],
	"application/davmount+xml": [
	"davmount"
],
	"application/docbook+xml": [
	"dbk"
],
	"application/dssc+der": [
	"dssc"
],
	"application/dssc+xml": [
	"xdssc"
],
	"application/ecmascript": [
	"ecma"
],
	"application/emma+xml": [
	"emma"
],
	"application/epub+zip": [
	"epub"
],
	"application/exi": [
	"exi"
],
	"application/font-tdpfr": [
	"pfr"
],
	"application/font-woff": [
	"woff"
],
	"application/geo+json": [
	"geojson"
],
	"application/gml+xml": [
	"gml"
],
	"application/gpx+xml": [
	"gpx"
],
	"application/gxf": [
	"gxf"
],
	"application/gzip": [
	"gz"
],
	"application/hjson": [
	"hjson"
],
	"application/hyperstudio": [
	"stk"
],
	"application/inkml+xml": [
	"ink",
	"inkml"
],
	"application/ipfix": [
	"ipfix"
],
	"application/java-archive": [
	"jar",
	"war",
	"ear"
],
	"application/java-serialized-object": [
	"ser"
],
	"application/java-vm": [
	"class"
],
	"application/javascript": [
	"js",
	"mjs"
],
	"application/json": [
	"json",
	"map"
],
	"application/json5": [
	"json5"
],
	"application/jsonml+json": [
	"jsonml"
],
	"application/ld+json": [
	"jsonld"
],
	"application/lost+xml": [
	"lostxml"
],
	"application/mac-binhex40": [
	"hqx"
],
	"application/mac-compactpro": [
	"cpt"
],
	"application/mads+xml": [
	"mads"
],
	"application/manifest+json": [
	"webmanifest"
],
	"application/marc": [
	"mrc"
],
	"application/marcxml+xml": [
	"mrcx"
],
	"application/mathematica": [
	"ma",
	"nb",
	"mb"
],
	"application/mathml+xml": [
	"mathml"
],
	"application/mbox": [
	"mbox"
],
	"application/mediaservercontrol+xml": [
	"mscml"
],
	"application/metalink+xml": [
	"metalink"
],
	"application/metalink4+xml": [
	"meta4"
],
	"application/mets+xml": [
	"mets"
],
	"application/mods+xml": [
	"mods"
],
	"application/mp21": [
	"m21",
	"mp21"
],
	"application/mp4": [
	"mp4s",
	"m4p"
],
	"application/msword": [
	"doc",
	"dot"
],
	"application/mxf": [
	"mxf"
],
	"application/octet-stream": [
	"bin",
	"dms",
	"lrf",
	"mar",
	"so",
	"dist",
	"distz",
	"pkg",
	"bpk",
	"dump",
	"elc",
	"deploy",
	"exe",
	"dll",
	"deb",
	"dmg",
	"iso",
	"img",
	"msi",
	"msp",
	"msm",
	"buffer"
],
	"application/oda": [
	"oda"
],
	"application/oebps-package+xml": [
	"opf"
],
	"application/ogg": [
	"ogx"
],
	"application/omdoc+xml": [
	"omdoc"
],
	"application/onenote": [
	"onetoc",
	"onetoc2",
	"onetmp",
	"onepkg"
],
	"application/oxps": [
	"oxps"
],
	"application/patch-ops-error+xml": [
	"xer"
],
	"application/pdf": [
	"pdf"
],
	"application/pgp-encrypted": [
	"pgp"
],
	"application/pgp-signature": [
	"asc",
	"sig"
],
	"application/pics-rules": [
	"prf"
],
	"application/pkcs10": [
	"p10"
],
	"application/pkcs7-mime": [
	"p7m",
	"p7c"
],
	"application/pkcs7-signature": [
	"p7s"
],
	"application/pkcs8": [
	"p8"
],
	"application/pkix-attr-cert": [
	"ac"
],
	"application/pkix-cert": [
	"cer"
],
	"application/pkix-crl": [
	"crl"
],
	"application/pkix-pkipath": [
	"pkipath"
],
	"application/pkixcmp": [
	"pki"
],
	"application/pls+xml": [
	"pls"
],
	"application/postscript": [
	"ai",
	"eps",
	"ps"
],
	"application/pskc+xml": [
	"pskcxml"
],
	"application/raml+yaml": [
	"raml"
],
	"application/rdf+xml": [
	"rdf"
],
	"application/reginfo+xml": [
	"rif"
],
	"application/relax-ng-compact-syntax": [
	"rnc"
],
	"application/resource-lists+xml": [
	"rl"
],
	"application/resource-lists-diff+xml": [
	"rld"
],
	"application/rls-services+xml": [
	"rs"
],
	"application/rpki-ghostbusters": [
	"gbr"
],
	"application/rpki-manifest": [
	"mft"
],
	"application/rpki-roa": [
	"roa"
],
	"application/rsd+xml": [
	"rsd"
],
	"application/rss+xml": [
	"rss"
],
	"application/rtf": [
	"rtf"
],
	"application/sbml+xml": [
	"sbml"
],
	"application/scvp-cv-request": [
	"scq"
],
	"application/scvp-cv-response": [
	"scs"
],
	"application/scvp-vp-request": [
	"spq"
],
	"application/scvp-vp-response": [
	"spp"
],
	"application/sdp": [
	"sdp"
],
	"application/set-payment-initiation": [
	"setpay"
],
	"application/set-registration-initiation": [
	"setreg"
],
	"application/shf+xml": [
	"shf"
],
	"application/smil+xml": [
	"smi",
	"smil"
],
	"application/sparql-query": [
	"rq"
],
	"application/sparql-results+xml": [
	"srx"
],
	"application/srgs": [
	"gram"
],
	"application/srgs+xml": [
	"grxml"
],
	"application/sru+xml": [
	"sru"
],
	"application/ssdl+xml": [
	"ssdl"
],
	"application/ssml+xml": [
	"ssml"
],
	"application/tei+xml": [
	"tei",
	"teicorpus"
],
	"application/thraud+xml": [
	"tfi"
],
	"application/timestamped-data": [
	"tsd"
],
	"application/voicexml+xml": [
	"vxml"
],
	"application/wasm": [
	"wasm"
],
	"application/widget": [
	"wgt"
],
	"application/winhlp": [
	"hlp"
],
	"application/wsdl+xml": [
	"wsdl"
],
	"application/wspolicy+xml": [
	"wspolicy"
],
	"application/xaml+xml": [
	"xaml"
],
	"application/xcap-diff+xml": [
	"xdf"
],
	"application/xenc+xml": [
	"xenc"
],
	"application/xhtml+xml": [
	"xhtml",
	"xht"
],
	"application/xml": [
	"xml",
	"xsl",
	"xsd",
	"rng"
],
	"application/xml-dtd": [
	"dtd"
],
	"application/xop+xml": [
	"xop"
],
	"application/xproc+xml": [
	"xpl"
],
	"application/xslt+xml": [
	"xslt"
],
	"application/xspf+xml": [
	"xspf"
],
	"application/xv+xml": [
	"mxml",
	"xhvml",
	"xvml",
	"xvm"
],
	"application/yang": [
	"yang"
],
	"application/yin+xml": [
	"yin"
],
	"application/zip": [
	"zip"
],
	"audio/3gpp": [
	"*3gpp"
],
	"audio/adpcm": [
	"adp"
],
	"audio/basic": [
	"au",
	"snd"
],
	"audio/midi": [
	"mid",
	"midi",
	"kar",
	"rmi"
],
	"audio/mp3": [
	"*mp3"
],
	"audio/mp4": [
	"m4a",
	"mp4a"
],
	"audio/mpeg": [
	"mpga",
	"mp2",
	"mp2a",
	"mp3",
	"m2a",
	"m3a"
],
	"audio/ogg": [
	"oga",
	"ogg",
	"spx"
],
	"audio/s3m": [
	"s3m"
],
	"audio/silk": [
	"sil"
],
	"audio/wav": [
	"wav"
],
	"audio/wave": [
	"*wav"
],
	"audio/webm": [
	"weba"
],
	"audio/xm": [
	"xm"
],
	"font/collection": [
	"ttc"
],
	"font/otf": [
	"otf"
],
	"font/ttf": [
	"ttf"
],
	"font/woff": [
	"*woff"
],
	"font/woff2": [
	"woff2"
],
	"image/apng": [
	"apng"
],
	"image/bmp": [
	"bmp"
],
	"image/cgm": [
	"cgm"
],
	"image/g3fax": [
	"g3"
],
	"image/gif": [
	"gif"
],
	"image/ief": [
	"ief"
],
	"image/jp2": [
	"jp2",
	"jpg2"
],
	"image/jpeg": [
	"jpeg",
	"jpg",
	"jpe"
],
	"image/jpm": [
	"jpm"
],
	"image/jpx": [
	"jpx",
	"jpf"
],
	"image/ktx": [
	"ktx"
],
	"image/png": [
	"png"
],
	"image/sgi": [
	"sgi"
],
	"image/svg+xml": [
	"svg",
	"svgz"
],
	"image/tiff": [
	"tiff",
	"tif"
],
	"image/webp": [
	"webp"
],
	"message/disposition-notification": [
	"disposition-notification"
],
	"message/global": [
	"u8msg"
],
	"message/global-delivery-status": [
	"u8dsn"
],
	"message/global-disposition-notification": [
	"u8mdn"
],
	"message/global-headers": [
	"u8hdr"
],
	"message/rfc822": [
	"eml",
	"mime"
],
	"model/gltf+json": [
	"gltf"
],
	"model/gltf-binary": [
	"glb"
],
	"model/iges": [
	"igs",
	"iges"
],
	"model/mesh": [
	"msh",
	"mesh",
	"silo"
],
	"model/vrml": [
	"wrl",
	"vrml"
],
	"model/x3d+binary": [
	"x3db",
	"x3dbz"
],
	"model/x3d+vrml": [
	"x3dv",
	"x3dvz"
],
	"model/x3d+xml": [
	"x3d",
	"x3dz"
],
	"text/cache-manifest": [
	"appcache",
	"manifest"
],
	"text/calendar": [
	"ics",
	"ifb"
],
	"text/coffeescript": [
	"coffee",
	"litcoffee"
],
	"text/css": [
	"css"
],
	"text/csv": [
	"csv"
],
	"text/html": [
	"html",
	"htm",
	"shtml"
],
	"text/jade": [
	"jade"
],
	"text/jsx": [
	"jsx"
],
	"text/less": [
	"less"
],
	"text/markdown": [
	"markdown",
	"md"
],
	"text/mathml": [
	"mml"
],
	"text/n3": [
	"n3"
],
	"text/plain": [
	"txt",
	"text",
	"conf",
	"def",
	"list",
	"log",
	"in",
	"ini"
],
	"text/richtext": [
	"rtx"
],
	"text/rtf": [
	"*rtf"
],
	"text/sgml": [
	"sgml",
	"sgm"
],
	"text/shex": [
	"shex"
],
	"text/slim": [
	"slim",
	"slm"
],
	"text/stylus": [
	"stylus",
	"styl"
],
	"text/tab-separated-values": [
	"tsv"
],
	"text/troff": [
	"t",
	"tr",
	"roff",
	"man",
	"me",
	"ms"
],
	"text/turtle": [
	"ttl"
],
	"text/uri-list": [
	"uri",
	"uris",
	"urls"
],
	"text/vcard": [
	"vcard"
],
	"text/vtt": [
	"vtt"
],
	"text/xml": [
	"*xml"
],
	"text/yaml": [
	"yaml",
	"yml"
],
	"video/3gpp": [
	"3gp",
	"3gpp"
],
	"video/3gpp2": [
	"3g2"
],
	"video/h261": [
	"h261"
],
	"video/h263": [
	"h263"
],
	"video/h264": [
	"h264"
],
	"video/jpeg": [
	"jpgv"
],
	"video/jpm": [
	"*jpm",
	"jpgm"
],
	"video/mj2": [
	"mj2",
	"mjp2"
],
	"video/mp2t": [
	"ts"
],
	"video/mp4": [
	"mp4",
	"mp4v",
	"mpg4"
],
	"video/mpeg": [
	"mpeg",
	"mpg",
	"mpe",
	"m1v",
	"m2v"
],
	"video/ogg": [
	"ogv"
],
	"video/quicktime": [
	"qt",
	"mov"
],
	"video/webm": [
	"webm"
]
};

var _require__$types$other_ = {
	"application/prs.cww": [
	"cww"
],
	"application/vnd.3gpp.pic-bw-large": [
	"plb"
],
	"application/vnd.3gpp.pic-bw-small": [
	"psb"
],
	"application/vnd.3gpp.pic-bw-var": [
	"pvb"
],
	"application/vnd.3gpp2.tcap": [
	"tcap"
],
	"application/vnd.3m.post-it-notes": [
	"pwn"
],
	"application/vnd.accpac.simply.aso": [
	"aso"
],
	"application/vnd.accpac.simply.imp": [
	"imp"
],
	"application/vnd.acucobol": [
	"acu"
],
	"application/vnd.acucorp": [
	"atc",
	"acutc"
],
	"application/vnd.adobe.air-application-installer-package+zip": [
	"air"
],
	"application/vnd.adobe.formscentral.fcdt": [
	"fcdt"
],
	"application/vnd.adobe.fxp": [
	"fxp",
	"fxpl"
],
	"application/vnd.adobe.xdp+xml": [
	"xdp"
],
	"application/vnd.adobe.xfdf": [
	"xfdf"
],
	"application/vnd.ahead.space": [
	"ahead"
],
	"application/vnd.airzip.filesecure.azf": [
	"azf"
],
	"application/vnd.airzip.filesecure.azs": [
	"azs"
],
	"application/vnd.amazon.ebook": [
	"azw"
],
	"application/vnd.americandynamics.acc": [
	"acc"
],
	"application/vnd.amiga.ami": [
	"ami"
],
	"application/vnd.android.package-archive": [
	"apk"
],
	"application/vnd.anser-web-certificate-issue-initiation": [
	"cii"
],
	"application/vnd.anser-web-funds-transfer-initiation": [
	"fti"
],
	"application/vnd.antix.game-component": [
	"atx"
],
	"application/vnd.apple.installer+xml": [
	"mpkg"
],
	"application/vnd.apple.mpegurl": [
	"m3u8"
],
	"application/vnd.apple.pkpass": [
	"pkpass"
],
	"application/vnd.aristanetworks.swi": [
	"swi"
],
	"application/vnd.astraea-software.iota": [
	"iota"
],
	"application/vnd.audiograph": [
	"aep"
],
	"application/vnd.blueice.multipass": [
	"mpm"
],
	"application/vnd.bmi": [
	"bmi"
],
	"application/vnd.businessobjects": [
	"rep"
],
	"application/vnd.chemdraw+xml": [
	"cdxml"
],
	"application/vnd.chipnuts.karaoke-mmd": [
	"mmd"
],
	"application/vnd.cinderella": [
	"cdy"
],
	"application/vnd.claymore": [
	"cla"
],
	"application/vnd.cloanto.rp9": [
	"rp9"
],
	"application/vnd.clonk.c4group": [
	"c4g",
	"c4d",
	"c4f",
	"c4p",
	"c4u"
],
	"application/vnd.cluetrust.cartomobile-config": [
	"c11amc"
],
	"application/vnd.cluetrust.cartomobile-config-pkg": [
	"c11amz"
],
	"application/vnd.commonspace": [
	"csp"
],
	"application/vnd.contact.cmsg": [
	"cdbcmsg"
],
	"application/vnd.cosmocaller": [
	"cmc"
],
	"application/vnd.crick.clicker": [
	"clkx"
],
	"application/vnd.crick.clicker.keyboard": [
	"clkk"
],
	"application/vnd.crick.clicker.palette": [
	"clkp"
],
	"application/vnd.crick.clicker.template": [
	"clkt"
],
	"application/vnd.crick.clicker.wordbank": [
	"clkw"
],
	"application/vnd.criticaltools.wbs+xml": [
	"wbs"
],
	"application/vnd.ctc-posml": [
	"pml"
],
	"application/vnd.cups-ppd": [
	"ppd"
],
	"application/vnd.curl.car": [
	"car"
],
	"application/vnd.curl.pcurl": [
	"pcurl"
],
	"application/vnd.dart": [
	"dart"
],
	"application/vnd.data-vision.rdz": [
	"rdz"
],
	"application/vnd.dece.data": [
	"uvf",
	"uvvf",
	"uvd",
	"uvvd"
],
	"application/vnd.dece.ttml+xml": [
	"uvt",
	"uvvt"
],
	"application/vnd.dece.unspecified": [
	"uvx",
	"uvvx"
],
	"application/vnd.dece.zip": [
	"uvz",
	"uvvz"
],
	"application/vnd.denovo.fcselayout-link": [
	"fe_launch"
],
	"application/vnd.dna": [
	"dna"
],
	"application/vnd.dolby.mlp": [
	"mlp"
],
	"application/vnd.dpgraph": [
	"dpg"
],
	"application/vnd.dreamfactory": [
	"dfac"
],
	"application/vnd.ds-keypoint": [
	"kpxx"
],
	"application/vnd.dvb.ait": [
	"ait"
],
	"application/vnd.dvb.service": [
	"svc"
],
	"application/vnd.dynageo": [
	"geo"
],
	"application/vnd.ecowin.chart": [
	"mag"
],
	"application/vnd.enliven": [
	"nml"
],
	"application/vnd.epson.esf": [
	"esf"
],
	"application/vnd.epson.msf": [
	"msf"
],
	"application/vnd.epson.quickanime": [
	"qam"
],
	"application/vnd.epson.salt": [
	"slt"
],
	"application/vnd.epson.ssf": [
	"ssf"
],
	"application/vnd.eszigno3+xml": [
	"es3",
	"et3"
],
	"application/vnd.ezpix-album": [
	"ez2"
],
	"application/vnd.ezpix-package": [
	"ez3"
],
	"application/vnd.fdf": [
	"fdf"
],
	"application/vnd.fdsn.mseed": [
	"mseed"
],
	"application/vnd.fdsn.seed": [
	"seed",
	"dataless"
],
	"application/vnd.flographit": [
	"gph"
],
	"application/vnd.fluxtime.clip": [
	"ftc"
],
	"application/vnd.framemaker": [
	"fm",
	"frame",
	"maker",
	"book"
],
	"application/vnd.frogans.fnc": [
	"fnc"
],
	"application/vnd.frogans.ltf": [
	"ltf"
],
	"application/vnd.fsc.weblaunch": [
	"fsc"
],
	"application/vnd.fujitsu.oasys": [
	"oas"
],
	"application/vnd.fujitsu.oasys2": [
	"oa2"
],
	"application/vnd.fujitsu.oasys3": [
	"oa3"
],
	"application/vnd.fujitsu.oasysgp": [
	"fg5"
],
	"application/vnd.fujitsu.oasysprs": [
	"bh2"
],
	"application/vnd.fujixerox.ddd": [
	"ddd"
],
	"application/vnd.fujixerox.docuworks": [
	"xdw"
],
	"application/vnd.fujixerox.docuworks.binder": [
	"xbd"
],
	"application/vnd.fuzzysheet": [
	"fzs"
],
	"application/vnd.genomatix.tuxedo": [
	"txd"
],
	"application/vnd.geogebra.file": [
	"ggb"
],
	"application/vnd.geogebra.tool": [
	"ggt"
],
	"application/vnd.geometry-explorer": [
	"gex",
	"gre"
],
	"application/vnd.geonext": [
	"gxt"
],
	"application/vnd.geoplan": [
	"g2w"
],
	"application/vnd.geospace": [
	"g3w"
],
	"application/vnd.gmx": [
	"gmx"
],
	"application/vnd.google-apps.document": [
	"gdoc"
],
	"application/vnd.google-apps.presentation": [
	"gslides"
],
	"application/vnd.google-apps.spreadsheet": [
	"gsheet"
],
	"application/vnd.google-earth.kml+xml": [
	"kml"
],
	"application/vnd.google-earth.kmz": [
	"kmz"
],
	"application/vnd.grafeq": [
	"gqf",
	"gqs"
],
	"application/vnd.groove-account": [
	"gac"
],
	"application/vnd.groove-help": [
	"ghf"
],
	"application/vnd.groove-identity-message": [
	"gim"
],
	"application/vnd.groove-injector": [
	"grv"
],
	"application/vnd.groove-tool-message": [
	"gtm"
],
	"application/vnd.groove-tool-template": [
	"tpl"
],
	"application/vnd.groove-vcard": [
	"vcg"
],
	"application/vnd.hal+xml": [
	"hal"
],
	"application/vnd.handheld-entertainment+xml": [
	"zmm"
],
	"application/vnd.hbci": [
	"hbci"
],
	"application/vnd.hhe.lesson-player": [
	"les"
],
	"application/vnd.hp-hpgl": [
	"hpgl"
],
	"application/vnd.hp-hpid": [
	"hpid"
],
	"application/vnd.hp-hps": [
	"hps"
],
	"application/vnd.hp-jlyt": [
	"jlt"
],
	"application/vnd.hp-pcl": [
	"pcl"
],
	"application/vnd.hp-pclxl": [
	"pclxl"
],
	"application/vnd.hydrostatix.sof-data": [
	"sfd-hdstx"
],
	"application/vnd.ibm.minipay": [
	"mpy"
],
	"application/vnd.ibm.modcap": [
	"afp",
	"listafp",
	"list3820"
],
	"application/vnd.ibm.rights-management": [
	"irm"
],
	"application/vnd.ibm.secure-container": [
	"sc"
],
	"application/vnd.iccprofile": [
	"icc",
	"icm"
],
	"application/vnd.igloader": [
	"igl"
],
	"application/vnd.immervision-ivp": [
	"ivp"
],
	"application/vnd.immervision-ivu": [
	"ivu"
],
	"application/vnd.insors.igm": [
	"igm"
],
	"application/vnd.intercon.formnet": [
	"xpw",
	"xpx"
],
	"application/vnd.intergeo": [
	"i2g"
],
	"application/vnd.intu.qbo": [
	"qbo"
],
	"application/vnd.intu.qfx": [
	"qfx"
],
	"application/vnd.ipunplugged.rcprofile": [
	"rcprofile"
],
	"application/vnd.irepository.package+xml": [
	"irp"
],
	"application/vnd.is-xpr": [
	"xpr"
],
	"application/vnd.isac.fcs": [
	"fcs"
],
	"application/vnd.jam": [
	"jam"
],
	"application/vnd.jcp.javame.midlet-rms": [
	"rms"
],
	"application/vnd.jisp": [
	"jisp"
],
	"application/vnd.joost.joda-archive": [
	"joda"
],
	"application/vnd.kahootz": [
	"ktz",
	"ktr"
],
	"application/vnd.kde.karbon": [
	"karbon"
],
	"application/vnd.kde.kchart": [
	"chrt"
],
	"application/vnd.kde.kformula": [
	"kfo"
],
	"application/vnd.kde.kivio": [
	"flw"
],
	"application/vnd.kde.kontour": [
	"kon"
],
	"application/vnd.kde.kpresenter": [
	"kpr",
	"kpt"
],
	"application/vnd.kde.kspread": [
	"ksp"
],
	"application/vnd.kde.kword": [
	"kwd",
	"kwt"
],
	"application/vnd.kenameaapp": [
	"htke"
],
	"application/vnd.kidspiration": [
	"kia"
],
	"application/vnd.kinar": [
	"kne",
	"knp"
],
	"application/vnd.koan": [
	"skp",
	"skd",
	"skt",
	"skm"
],
	"application/vnd.kodak-descriptor": [
	"sse"
],
	"application/vnd.las.las+xml": [
	"lasxml"
],
	"application/vnd.llamagraphics.life-balance.desktop": [
	"lbd"
],
	"application/vnd.llamagraphics.life-balance.exchange+xml": [
	"lbe"
],
	"application/vnd.lotus-1-2-3": [
	"123"
],
	"application/vnd.lotus-approach": [
	"apr"
],
	"application/vnd.lotus-freelance": [
	"pre"
],
	"application/vnd.lotus-notes": [
	"nsf"
],
	"application/vnd.lotus-organizer": [
	"org"
],
	"application/vnd.lotus-screencam": [
	"scm"
],
	"application/vnd.lotus-wordpro": [
	"lwp"
],
	"application/vnd.macports.portpkg": [
	"portpkg"
],
	"application/vnd.mcd": [
	"mcd"
],
	"application/vnd.medcalcdata": [
	"mc1"
],
	"application/vnd.mediastation.cdkey": [
	"cdkey"
],
	"application/vnd.mfer": [
	"mwf"
],
	"application/vnd.mfmp": [
	"mfm"
],
	"application/vnd.micrografx.flo": [
	"flo"
],
	"application/vnd.micrografx.igx": [
	"igx"
],
	"application/vnd.mif": [
	"mif"
],
	"application/vnd.mobius.daf": [
	"daf"
],
	"application/vnd.mobius.dis": [
	"dis"
],
	"application/vnd.mobius.mbk": [
	"mbk"
],
	"application/vnd.mobius.mqy": [
	"mqy"
],
	"application/vnd.mobius.msl": [
	"msl"
],
	"application/vnd.mobius.plc": [
	"plc"
],
	"application/vnd.mobius.txf": [
	"txf"
],
	"application/vnd.mophun.application": [
	"mpn"
],
	"application/vnd.mophun.certificate": [
	"mpc"
],
	"application/vnd.mozilla.xul+xml": [
	"xul"
],
	"application/vnd.ms-artgalry": [
	"cil"
],
	"application/vnd.ms-cab-compressed": [
	"cab"
],
	"application/vnd.ms-excel": [
	"xls",
	"xlm",
	"xla",
	"xlc",
	"xlt",
	"xlw"
],
	"application/vnd.ms-excel.addin.macroenabled.12": [
	"xlam"
],
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": [
	"xlsb"
],
	"application/vnd.ms-excel.sheet.macroenabled.12": [
	"xlsm"
],
	"application/vnd.ms-excel.template.macroenabled.12": [
	"xltm"
],
	"application/vnd.ms-fontobject": [
	"eot"
],
	"application/vnd.ms-htmlhelp": [
	"chm"
],
	"application/vnd.ms-ims": [
	"ims"
],
	"application/vnd.ms-lrm": [
	"lrm"
],
	"application/vnd.ms-officetheme": [
	"thmx"
],
	"application/vnd.ms-outlook": [
	"msg"
],
	"application/vnd.ms-pki.seccat": [
	"cat"
],
	"application/vnd.ms-pki.stl": [
	"stl"
],
	"application/vnd.ms-powerpoint": [
	"ppt",
	"pps",
	"pot"
],
	"application/vnd.ms-powerpoint.addin.macroenabled.12": [
	"ppam"
],
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": [
	"pptm"
],
	"application/vnd.ms-powerpoint.slide.macroenabled.12": [
	"sldm"
],
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": [
	"ppsm"
],
	"application/vnd.ms-powerpoint.template.macroenabled.12": [
	"potm"
],
	"application/vnd.ms-project": [
	"mpp",
	"mpt"
],
	"application/vnd.ms-word.document.macroenabled.12": [
	"docm"
],
	"application/vnd.ms-word.template.macroenabled.12": [
	"dotm"
],
	"application/vnd.ms-works": [
	"wps",
	"wks",
	"wcm",
	"wdb"
],
	"application/vnd.ms-wpl": [
	"wpl"
],
	"application/vnd.ms-xpsdocument": [
	"xps"
],
	"application/vnd.mseq": [
	"mseq"
],
	"application/vnd.musician": [
	"mus"
],
	"application/vnd.muvee.style": [
	"msty"
],
	"application/vnd.mynfc": [
	"taglet"
],
	"application/vnd.neurolanguage.nlu": [
	"nlu"
],
	"application/vnd.nitf": [
	"ntf",
	"nitf"
],
	"application/vnd.noblenet-directory": [
	"nnd"
],
	"application/vnd.noblenet-sealer": [
	"nns"
],
	"application/vnd.noblenet-web": [
	"nnw"
],
	"application/vnd.nokia.n-gage.data": [
	"ngdat"
],
	"application/vnd.nokia.n-gage.symbian.install": [
	"n-gage"
],
	"application/vnd.nokia.radio-preset": [
	"rpst"
],
	"application/vnd.nokia.radio-presets": [
	"rpss"
],
	"application/vnd.novadigm.edm": [
	"edm"
],
	"application/vnd.novadigm.edx": [
	"edx"
],
	"application/vnd.novadigm.ext": [
	"ext"
],
	"application/vnd.oasis.opendocument.chart": [
	"odc"
],
	"application/vnd.oasis.opendocument.chart-template": [
	"otc"
],
	"application/vnd.oasis.opendocument.database": [
	"odb"
],
	"application/vnd.oasis.opendocument.formula": [
	"odf"
],
	"application/vnd.oasis.opendocument.formula-template": [
	"odft"
],
	"application/vnd.oasis.opendocument.graphics": [
	"odg"
],
	"application/vnd.oasis.opendocument.graphics-template": [
	"otg"
],
	"application/vnd.oasis.opendocument.image": [
	"odi"
],
	"application/vnd.oasis.opendocument.image-template": [
	"oti"
],
	"application/vnd.oasis.opendocument.presentation": [
	"odp"
],
	"application/vnd.oasis.opendocument.presentation-template": [
	"otp"
],
	"application/vnd.oasis.opendocument.spreadsheet": [
	"ods"
],
	"application/vnd.oasis.opendocument.spreadsheet-template": [
	"ots"
],
	"application/vnd.oasis.opendocument.text": [
	"odt"
],
	"application/vnd.oasis.opendocument.text-master": [
	"odm"
],
	"application/vnd.oasis.opendocument.text-template": [
	"ott"
],
	"application/vnd.oasis.opendocument.text-web": [
	"oth"
],
	"application/vnd.olpc-sugar": [
	"xo"
],
	"application/vnd.oma.dd2+xml": [
	"dd2"
],
	"application/vnd.openofficeorg.extension": [
	"oxt"
],
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": [
	"pptx"
],
	"application/vnd.openxmlformats-officedocument.presentationml.slide": [
	"sldx"
],
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": [
	"ppsx"
],
	"application/vnd.openxmlformats-officedocument.presentationml.template": [
	"potx"
],
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
	"xlsx"
],
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": [
	"xltx"
],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
	"docx"
],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": [
	"dotx"
],
	"application/vnd.osgeo.mapguide.package": [
	"mgp"
],
	"application/vnd.osgi.dp": [
	"dp"
],
	"application/vnd.osgi.subsystem": [
	"esa"
],
	"application/vnd.palm": [
	"pdb",
	"pqa",
	"oprc"
],
	"application/vnd.pawaafile": [
	"paw"
],
	"application/vnd.pg.format": [
	"str"
],
	"application/vnd.pg.osasli": [
	"ei6"
],
	"application/vnd.picsel": [
	"efif"
],
	"application/vnd.pmi.widget": [
	"wg"
],
	"application/vnd.pocketlearn": [
	"plf"
],
	"application/vnd.powerbuilder6": [
	"pbd"
],
	"application/vnd.previewsystems.box": [
	"box"
],
	"application/vnd.proteus.magazine": [
	"mgz"
],
	"application/vnd.publishare-delta-tree": [
	"qps"
],
	"application/vnd.pvi.ptid1": [
	"ptid"
],
	"application/vnd.quark.quarkxpress": [
	"qxd",
	"qxt",
	"qwd",
	"qwt",
	"qxl",
	"qxb"
],
	"application/vnd.realvnc.bed": [
	"bed"
],
	"application/vnd.recordare.musicxml": [
	"mxl"
],
	"application/vnd.recordare.musicxml+xml": [
	"musicxml"
],
	"application/vnd.rig.cryptonote": [
	"cryptonote"
],
	"application/vnd.rim.cod": [
	"cod"
],
	"application/vnd.rn-realmedia": [
	"rm"
],
	"application/vnd.rn-realmedia-vbr": [
	"rmvb"
],
	"application/vnd.route66.link66+xml": [
	"link66"
],
	"application/vnd.sailingtracker.track": [
	"st"
],
	"application/vnd.seemail": [
	"see"
],
	"application/vnd.sema": [
	"sema"
],
	"application/vnd.semd": [
	"semd"
],
	"application/vnd.semf": [
	"semf"
],
	"application/vnd.shana.informed.formdata": [
	"ifm"
],
	"application/vnd.shana.informed.formtemplate": [
	"itp"
],
	"application/vnd.shana.informed.interchange": [
	"iif"
],
	"application/vnd.shana.informed.package": [
	"ipk"
],
	"application/vnd.simtech-mindmapper": [
	"twd",
	"twds"
],
	"application/vnd.smaf": [
	"mmf"
],
	"application/vnd.smart.teacher": [
	"teacher"
],
	"application/vnd.solent.sdkm+xml": [
	"sdkm",
	"sdkd"
],
	"application/vnd.spotfire.dxp": [
	"dxp"
],
	"application/vnd.spotfire.sfs": [
	"sfs"
],
	"application/vnd.stardivision.calc": [
	"sdc"
],
	"application/vnd.stardivision.draw": [
	"sda"
],
	"application/vnd.stardivision.impress": [
	"sdd"
],
	"application/vnd.stardivision.math": [
	"smf"
],
	"application/vnd.stardivision.writer": [
	"sdw",
	"vor"
],
	"application/vnd.stardivision.writer-global": [
	"sgl"
],
	"application/vnd.stepmania.package": [
	"smzip"
],
	"application/vnd.stepmania.stepchart": [
	"sm"
],
	"application/vnd.sun.wadl+xml": [
	"wadl"
],
	"application/vnd.sun.xml.calc": [
	"sxc"
],
	"application/vnd.sun.xml.calc.template": [
	"stc"
],
	"application/vnd.sun.xml.draw": [
	"sxd"
],
	"application/vnd.sun.xml.draw.template": [
	"std"
],
	"application/vnd.sun.xml.impress": [
	"sxi"
],
	"application/vnd.sun.xml.impress.template": [
	"sti"
],
	"application/vnd.sun.xml.math": [
	"sxm"
],
	"application/vnd.sun.xml.writer": [
	"sxw"
],
	"application/vnd.sun.xml.writer.global": [
	"sxg"
],
	"application/vnd.sun.xml.writer.template": [
	"stw"
],
	"application/vnd.sus-calendar": [
	"sus",
	"susp"
],
	"application/vnd.svd": [
	"svd"
],
	"application/vnd.symbian.install": [
	"sis",
	"sisx"
],
	"application/vnd.syncml+xml": [
	"xsm"
],
	"application/vnd.syncml.dm+wbxml": [
	"bdm"
],
	"application/vnd.syncml.dm+xml": [
	"xdm"
],
	"application/vnd.tao.intent-module-archive": [
	"tao"
],
	"application/vnd.tcpdump.pcap": [
	"pcap",
	"cap",
	"dmp"
],
	"application/vnd.tmobile-livetv": [
	"tmo"
],
	"application/vnd.trid.tpt": [
	"tpt"
],
	"application/vnd.triscape.mxs": [
	"mxs"
],
	"application/vnd.trueapp": [
	"tra"
],
	"application/vnd.ufdl": [
	"ufd",
	"ufdl"
],
	"application/vnd.uiq.theme": [
	"utz"
],
	"application/vnd.umajin": [
	"umj"
],
	"application/vnd.unity": [
	"unityweb"
],
	"application/vnd.uoml+xml": [
	"uoml"
],
	"application/vnd.vcx": [
	"vcx"
],
	"application/vnd.visio": [
	"vsd",
	"vst",
	"vss",
	"vsw"
],
	"application/vnd.visionary": [
	"vis"
],
	"application/vnd.vsf": [
	"vsf"
],
	"application/vnd.wap.wbxml": [
	"wbxml"
],
	"application/vnd.wap.wmlc": [
	"wmlc"
],
	"application/vnd.wap.wmlscriptc": [
	"wmlsc"
],
	"application/vnd.webturbo": [
	"wtb"
],
	"application/vnd.wolfram.player": [
	"nbp"
],
	"application/vnd.wordperfect": [
	"wpd"
],
	"application/vnd.wqd": [
	"wqd"
],
	"application/vnd.wt.stf": [
	"stf"
],
	"application/vnd.xara": [
	"xar"
],
	"application/vnd.xfdl": [
	"xfdl"
],
	"application/vnd.yamaha.hv-dic": [
	"hvd"
],
	"application/vnd.yamaha.hv-script": [
	"hvs"
],
	"application/vnd.yamaha.hv-voice": [
	"hvp"
],
	"application/vnd.yamaha.openscoreformat": [
	"osf"
],
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": [
	"osfpvg"
],
	"application/vnd.yamaha.smaf-audio": [
	"saf"
],
	"application/vnd.yamaha.smaf-phrase": [
	"spf"
],
	"application/vnd.yellowriver-custom-menu": [
	"cmp"
],
	"application/vnd.zul": [
	"zir",
	"zirz"
],
	"application/vnd.zzazz.deck+xml": [
	"zaz"
],
	"application/x-7z-compressed": [
	"7z"
],
	"application/x-abiword": [
	"abw"
],
	"application/x-ace-compressed": [
	"ace"
],
	"application/x-apple-diskimage": [
	"*dmg"
],
	"application/x-arj": [
	"arj"
],
	"application/x-authorware-bin": [
	"aab",
	"x32",
	"u32",
	"vox"
],
	"application/x-authorware-map": [
	"aam"
],
	"application/x-authorware-seg": [
	"aas"
],
	"application/x-bcpio": [
	"bcpio"
],
	"application/x-bdoc": [
	"*bdoc"
],
	"application/x-bittorrent": [
	"torrent"
],
	"application/x-blorb": [
	"blb",
	"blorb"
],
	"application/x-bzip": [
	"bz"
],
	"application/x-bzip2": [
	"bz2",
	"boz"
],
	"application/x-cbr": [
	"cbr",
	"cba",
	"cbt",
	"cbz",
	"cb7"
],
	"application/x-cdlink": [
	"vcd"
],
	"application/x-cfs-compressed": [
	"cfs"
],
	"application/x-chat": [
	"chat"
],
	"application/x-chess-pgn": [
	"pgn"
],
	"application/x-chrome-extension": [
	"crx"
],
	"application/x-cocoa": [
	"cco"
],
	"application/x-conference": [
	"nsc"
],
	"application/x-cpio": [
	"cpio"
],
	"application/x-csh": [
	"csh"
],
	"application/x-debian-package": [
	"*deb",
	"udeb"
],
	"application/x-dgc-compressed": [
	"dgc"
],
	"application/x-director": [
	"dir",
	"dcr",
	"dxr",
	"cst",
	"cct",
	"cxt",
	"w3d",
	"fgd",
	"swa"
],
	"application/x-doom": [
	"wad"
],
	"application/x-dtbncx+xml": [
	"ncx"
],
	"application/x-dtbook+xml": [
	"dtb"
],
	"application/x-dtbresource+xml": [
	"res"
],
	"application/x-dvi": [
	"dvi"
],
	"application/x-envoy": [
	"evy"
],
	"application/x-eva": [
	"eva"
],
	"application/x-font-bdf": [
	"bdf"
],
	"application/x-font-ghostscript": [
	"gsf"
],
	"application/x-font-linux-psf": [
	"psf"
],
	"application/x-font-pcf": [
	"pcf"
],
	"application/x-font-snf": [
	"snf"
],
	"application/x-font-type1": [
	"pfa",
	"pfb",
	"pfm",
	"afm"
],
	"application/x-freearc": [
	"arc"
],
	"application/x-futuresplash": [
	"spl"
],
	"application/x-gca-compressed": [
	"gca"
],
	"application/x-glulx": [
	"ulx"
],
	"application/x-gnumeric": [
	"gnumeric"
],
	"application/x-gramps-xml": [
	"gramps"
],
	"application/x-gtar": [
	"gtar"
],
	"application/x-hdf": [
	"hdf"
],
	"application/x-httpd-php": [
	"php"
],
	"application/x-install-instructions": [
	"install"
],
	"application/x-iso9660-image": [
	"*iso"
],
	"application/x-java-archive-diff": [
	"jardiff"
],
	"application/x-java-jnlp-file": [
	"jnlp"
],
	"application/x-latex": [
	"latex"
],
	"application/x-lua-bytecode": [
	"luac"
],
	"application/x-lzh-compressed": [
	"lzh",
	"lha"
],
	"application/x-makeself": [
	"run"
],
	"application/x-mie": [
	"mie"
],
	"application/x-mobipocket-ebook": [
	"prc",
	"mobi"
],
	"application/x-ms-application": [
	"application"
],
	"application/x-ms-shortcut": [
	"lnk"
],
	"application/x-ms-wmd": [
	"wmd"
],
	"application/x-ms-wmz": [
	"wmz"
],
	"application/x-ms-xbap": [
	"xbap"
],
	"application/x-msaccess": [
	"mdb"
],
	"application/x-msbinder": [
	"obd"
],
	"application/x-mscardfile": [
	"crd"
],
	"application/x-msclip": [
	"clp"
],
	"application/x-msdos-program": [
	"*exe"
],
	"application/x-msdownload": [
	"*exe",
	"*dll",
	"com",
	"bat",
	"*msi"
],
	"application/x-msmediaview": [
	"mvb",
	"m13",
	"m14"
],
	"application/x-msmetafile": [
	"wmf",
	"*wmz",
	"emf",
	"emz"
],
	"application/x-msmoney": [
	"mny"
],
	"application/x-mspublisher": [
	"pub"
],
	"application/x-msschedule": [
	"scd"
],
	"application/x-msterminal": [
	"trm"
],
	"application/x-mswrite": [
	"wri"
],
	"application/x-netcdf": [
	"nc",
	"cdf"
],
	"application/x-ns-proxy-autoconfig": [
	"pac"
],
	"application/x-nzb": [
	"nzb"
],
	"application/x-perl": [
	"pl",
	"pm"
],
	"application/x-pilot": [
	"*prc",
	"*pdb"
],
	"application/x-pkcs12": [
	"p12",
	"pfx"
],
	"application/x-pkcs7-certificates": [
	"p7b",
	"spc"
],
	"application/x-pkcs7-certreqresp": [
	"p7r"
],
	"application/x-rar-compressed": [
	"rar"
],
	"application/x-redhat-package-manager": [
	"rpm"
],
	"application/x-research-info-systems": [
	"ris"
],
	"application/x-sea": [
	"sea"
],
	"application/x-sh": [
	"sh"
],
	"application/x-shar": [
	"shar"
],
	"application/x-shockwave-flash": [
	"swf"
],
	"application/x-silverlight-app": [
	"xap"
],
	"application/x-sql": [
	"sql"
],
	"application/x-stuffit": [
	"sit"
],
	"application/x-stuffitx": [
	"sitx"
],
	"application/x-subrip": [
	"srt"
],
	"application/x-sv4cpio": [
	"sv4cpio"
],
	"application/x-sv4crc": [
	"sv4crc"
],
	"application/x-t3vm-image": [
	"t3"
],
	"application/x-tads": [
	"gam"
],
	"application/x-tar": [
	"tar"
],
	"application/x-tcl": [
	"tcl",
	"tk"
],
	"application/x-tex": [
	"tex"
],
	"application/x-tex-tfm": [
	"tfm"
],
	"application/x-texinfo": [
	"texinfo",
	"texi"
],
	"application/x-tgif": [
	"obj"
],
	"application/x-ustar": [
	"ustar"
],
	"application/x-virtualbox-hdd": [
	"hdd"
],
	"application/x-virtualbox-ova": [
	"ova"
],
	"application/x-virtualbox-ovf": [
	"ovf"
],
	"application/x-virtualbox-vbox": [
	"vbox"
],
	"application/x-virtualbox-vbox-extpack": [
	"vbox-extpack"
],
	"application/x-virtualbox-vdi": [
	"vdi"
],
	"application/x-virtualbox-vhd": [
	"vhd"
],
	"application/x-virtualbox-vmdk": [
	"vmdk"
],
	"application/x-wais-source": [
	"src"
],
	"application/x-web-app-manifest+json": [
	"webapp"
],
	"application/x-x509-ca-cert": [
	"der",
	"crt",
	"pem"
],
	"application/x-xfig": [
	"fig"
],
	"application/x-xliff+xml": [
	"xlf"
],
	"application/x-xpinstall": [
	"xpi"
],
	"application/x-xz": [
	"xz"
],
	"application/x-zmachine": [
	"z1",
	"z2",
	"z3",
	"z4",
	"z5",
	"z6",
	"z7",
	"z8"
],
	"audio/vnd.dece.audio": [
	"uva",
	"uvva"
],
	"audio/vnd.digital-winds": [
	"eol"
],
	"audio/vnd.dra": [
	"dra"
],
	"audio/vnd.dts": [
	"dts"
],
	"audio/vnd.dts.hd": [
	"dtshd"
],
	"audio/vnd.lucent.voice": [
	"lvp"
],
	"audio/vnd.ms-playready.media.pya": [
	"pya"
],
	"audio/vnd.nuera.ecelp4800": [
	"ecelp4800"
],
	"audio/vnd.nuera.ecelp7470": [
	"ecelp7470"
],
	"audio/vnd.nuera.ecelp9600": [
	"ecelp9600"
],
	"audio/vnd.rip": [
	"rip"
],
	"audio/x-aac": [
	"aac"
],
	"audio/x-aiff": [
	"aif",
	"aiff",
	"aifc"
],
	"audio/x-caf": [
	"caf"
],
	"audio/x-flac": [
	"flac"
],
	"audio/x-m4a": [
	"*m4a"
],
	"audio/x-matroska": [
	"mka"
],
	"audio/x-mpegurl": [
	"m3u"
],
	"audio/x-ms-wax": [
	"wax"
],
	"audio/x-ms-wma": [
	"wma"
],
	"audio/x-pn-realaudio": [
	"ram",
	"ra"
],
	"audio/x-pn-realaudio-plugin": [
	"rmp"
],
	"audio/x-realaudio": [
	"*ra"
],
	"audio/x-wav": [
	"*wav"
],
	"chemical/x-cdx": [
	"cdx"
],
	"chemical/x-cif": [
	"cif"
],
	"chemical/x-cmdf": [
	"cmdf"
],
	"chemical/x-cml": [
	"cml"
],
	"chemical/x-csml": [
	"csml"
],
	"chemical/x-xyz": [
	"xyz"
],
	"image/prs.btif": [
	"btif"
],
	"image/vnd.adobe.photoshop": [
	"psd"
],
	"image/vnd.dece.graphic": [
	"uvi",
	"uvvi",
	"uvg",
	"uvvg"
],
	"image/vnd.djvu": [
	"djvu",
	"djv"
],
	"image/vnd.dvb.subtitle": [
	"*sub"
],
	"image/vnd.dwg": [
	"dwg"
],
	"image/vnd.dxf": [
	"dxf"
],
	"image/vnd.fastbidsheet": [
	"fbs"
],
	"image/vnd.fpx": [
	"fpx"
],
	"image/vnd.fst": [
	"fst"
],
	"image/vnd.fujixerox.edmics-mmr": [
	"mmr"
],
	"image/vnd.fujixerox.edmics-rlc": [
	"rlc"
],
	"image/vnd.ms-modi": [
	"mdi"
],
	"image/vnd.ms-photo": [
	"wdp"
],
	"image/vnd.net-fpx": [
	"npx"
],
	"image/vnd.wap.wbmp": [
	"wbmp"
],
	"image/vnd.xiff": [
	"xif"
],
	"image/x-3ds": [
	"3ds"
],
	"image/x-cmu-raster": [
	"ras"
],
	"image/x-cmx": [
	"cmx"
],
	"image/x-freehand": [
	"fh",
	"fhc",
	"fh4",
	"fh5",
	"fh7"
],
	"image/x-icon": [
	"ico"
],
	"image/x-jng": [
	"jng"
],
	"image/x-mrsid-image": [
	"sid"
],
	"image/x-ms-bmp": [
	"*bmp"
],
	"image/x-pcx": [
	"pcx"
],
	"image/x-pict": [
	"pic",
	"pct"
],
	"image/x-portable-anymap": [
	"pnm"
],
	"image/x-portable-bitmap": [
	"pbm"
],
	"image/x-portable-graymap": [
	"pgm"
],
	"image/x-portable-pixmap": [
	"ppm"
],
	"image/x-rgb": [
	"rgb"
],
	"image/x-tga": [
	"tga"
],
	"image/x-xbitmap": [
	"xbm"
],
	"image/x-xpixmap": [
	"xpm"
],
	"image/x-xwindowdump": [
	"xwd"
],
	"message/vnd.wfa.wsc": [
	"wsc"
],
	"model/vnd.collada+xml": [
	"dae"
],
	"model/vnd.dwf": [
	"dwf"
],
	"model/vnd.gdl": [
	"gdl"
],
	"model/vnd.gtw": [
	"gtw"
],
	"model/vnd.mts": [
	"mts"
],
	"model/vnd.vtu": [
	"vtu"
],
	"text/prs.lines.tag": [
	"dsc"
],
	"text/vnd.curl": [
	"curl"
],
	"text/vnd.curl.dcurl": [
	"dcurl"
],
	"text/vnd.curl.mcurl": [
	"mcurl"
],
	"text/vnd.curl.scurl": [
	"scurl"
],
	"text/vnd.dvb.subtitle": [
	"sub"
],
	"text/vnd.fly": [
	"fly"
],
	"text/vnd.fmi.flexstor": [
	"flx"
],
	"text/vnd.graphviz": [
	"gv"
],
	"text/vnd.in3d.3dml": [
	"3dml"
],
	"text/vnd.in3d.spot": [
	"spot"
],
	"text/vnd.sun.j2me.app-descriptor": [
	"jad"
],
	"text/vnd.wap.wml": [
	"wml"
],
	"text/vnd.wap.wmlscript": [
	"wmls"
],
	"text/x-asm": [
	"s",
	"asm"
],
	"text/x-c": [
	"c",
	"cc",
	"cxx",
	"cpp",
	"h",
	"hh",
	"dic"
],
	"text/x-component": [
	"htc"
],
	"text/x-fortran": [
	"f",
	"for",
	"f77",
	"f90"
],
	"text/x-handlebars-template": [
	"hbs"
],
	"text/x-java-source": [
	"java"
],
	"text/x-lua": [
	"lua"
],
	"text/x-markdown": [
	"mkd"
],
	"text/x-nfo": [
	"nfo"
],
	"text/x-opml": [
	"opml"
],
	"text/x-org": [
	"*org"
],
	"text/x-pascal": [
	"p",
	"pas"
],
	"text/x-processing": [
	"pde"
],
	"text/x-sass": [
	"sass"
],
	"text/x-scss": [
	"scss"
],
	"text/x-setext": [
	"etx"
],
	"text/x-sfv": [
	"sfv"
],
	"text/x-suse-ymp": [
	"ymp"
],
	"text/x-uuencode": [
	"uu"
],
	"text/x-vcalendar": [
	"vcs"
],
	"text/x-vcard": [
	"vcf"
],
	"video/vnd.dece.hd": [
	"uvh",
	"uvvh"
],
	"video/vnd.dece.mobile": [
	"uvm",
	"uvvm"
],
	"video/vnd.dece.pd": [
	"uvp",
	"uvvp"
],
	"video/vnd.dece.sd": [
	"uvs",
	"uvvs"
],
	"video/vnd.dece.video": [
	"uvv",
	"uvvv"
],
	"video/vnd.dvb.file": [
	"dvb"
],
	"video/vnd.fvt": [
	"fvt"
],
	"video/vnd.mpegurl": [
	"mxu",
	"m4u"
],
	"video/vnd.ms-playready.media.pyv": [
	"pyv"
],
	"video/vnd.uvvu.mp4": [
	"uvu",
	"uvvu"
],
	"video/vnd.vivo": [
	"viv"
],
	"video/x-f4v": [
	"f4v"
],
	"video/x-fli": [
	"fli"
],
	"video/x-flv": [
	"flv"
],
	"video/x-m4v": [
	"m4v"
],
	"video/x-matroska": [
	"mkv",
	"mk3d",
	"mks"
],
	"video/x-mng": [
	"mng"
],
	"video/x-ms-asf": [
	"asf",
	"asx"
],
	"video/x-ms-vob": [
	"vob"
],
	"video/x-ms-wm": [
	"wm"
],
	"video/x-ms-wmv": [
	"wmv"
],
	"video/x-ms-wmx": [
	"wmx"
],
	"video/x-ms-wvx": [
	"wvx"
],
	"video/x-msvideo": [
	"avi"
],
	"video/x-sgi-movie": [
	"movie"
],
	"video/x-smv": [
	"smv"
],
	"x-conference/x-cooltalk": [
	"ice"
]
};

var mime = new Mime(_require__$types$standard_, _require__$types$other_);

class CleanCSS {
  constructor() {
    throw new Error("Not supported");
  }
}

const CLEAN_CSS_OPTIONS = {};

const TRANSFORMS = [{
	name: "string",
	transform(ctx, content, encoding = "utf8") {
		if (isBuffer(content)) {
			content = content.toString(encoding);
		}
		return content;
	}
}, {
	name: "cssmin",
	transform(ctx, content) {
		return new CleanCSS(CLEAN_CSS_OPTIONS).minify(content).styles;
	}
}, {
	name: "docstring",
	transform(ctx, content) {
		return unescapeBackTick(content.match(/`((\\`|[^`])+)`/)[1]);
	}
}, {
  name: "indent",
  transform(ctx, content) {
    const lineStart = getLineRange(ctx.sourceContent, ctx.inlineDirective.start).start;
    const indent = getWhitespace(ctx.sourceContent, lineStart);
    if (!indent) {
      return content;
    }
    const [firstLine, ...lines] = content.split("\n");
    return [firstLine, ...lines.map(l => indent + l)].join("\n");
  }
}, {
	name: "stringify",
	transform(ctx, content) {
		return JSON.stringify(content);
	}
}, {
	name: "dataurl",
	transform(ctx, content, type = getMimeType(ctx.inlineTarget), charset = "") {
    if (!isBuffer(content)) {
      // if content is text, we must convert it into buffer with utf8 encoding
      // (node.js only supports utf8)
      content = Buffer.from(content, "utf8");
      charset = "utf8";
    } else if (type.startsWith("text") && !charset) {
      // if content is already a buffer but the type is text/* and charset is
      // missing, default to utf-8
      charset = "utf8";
    }
		if (charset) {
			type += `;charset=${charset}`;
		}
		return `data:${type};base64,${content.toString("base64")}`;
	}
}, {
	name: "eval",
	transform(ctx, content, code) {
		return vm.runInNewContext(code, {$0: content});
	}
}, {
	name: "markdown",
	transform(ctx, content, type) {
		if (type == "codeblock") {
			return "```\n" + content + "\n```";
		}
		if (type == "code") {
			return "`" + content + "`";
		}
		if (type == "quote") {
			return content.split("\n").map(l => "> " + l).join("\n");
		}
    throw new Error(`Unknown markdown type: ${type}`);
	}
}, {
	name: "parse",
	transform(ctx, content, ...props) {
		var json = JSON.parse(content);
		while (props.length) {
			json = json[props.shift()];
		}
		return json;
	}
}, {
	name: "trim",
	transform(ctx, content) {
		return content.trim();
	}
}];

function getMimeType(target) {
	return target && mime.getType(target.args[0]) ||
		"text/plain";
}

function unescapeBackTick(s) {
  s = s.replace(/\\`|\\"|"|\n|\r/g, m => {
    if (m == "\\`") {
      return "`";
    }
    if (m == '"') {
      return '\\"';
    }
    if (m == "\r") {
      return "";
    }
    if (m == "\n") {
      return "\\n";
    }
    return m;
  });
  return JSON.parse(`"${s}"`);
}

function createTree(children) {
  return children.reduce((o, curr) => {
    const name = (PATH_LIKE.has(curr.target.name) ? "" : curr.target.name + ":") +
      curr.target.args[0];
    o[name] = createTree(curr.children);
    return o;
  }, {});
}

function createDefaultInliner(options) {
  const inliner = createInliner(options);
  
  RESOURCES.forEach(inliner.resource.add);
  TRANSFORMS.forEach(inliner.transformer.add);
  
  if (options && options.config) {
    const conf = options.config;
    if (conf.resources) {
      conf.resources.forEach(inliner.resource.add);
    }
    if (conf.transforms) {
      conf.transforms.forEach(inliner.transformer.add);
    }
    if (conf.shortcuts) {
      conf.shortcuts.forEach(inliner.globalShortcuts.add);
    }
  }
  
  return inliner;
}

function buildDependency(root, children) {
  return `${root}\n${_module_exports_.asTree(createTree(children))}`;
}

/* eslint-env browser */

async function withFiles(files, onReady) {
  try {
    files.forEach(file => {
      if (file.type === "text") {
        writeFileSync(file.name, file.data, {flag: "wx"});
      } else {
        writeFileSync(file.name, dataUriToBuffer(file.data), {flag: "wx"});
      }
    });
    return await onReady();
  } finally {
    files.forEach(file => {
      try {
        unlinkSync(file.name);
      } catch (err) {
        // pass
      }
    });
  }
}

self.addEventListener("message", e => {
  const ts = performance.now();
  Promise.resolve()
    .then(() => withFiles(
      e.data.files,
      () => {
        const inliner = createDefaultInliner();
        return inliner.inline({
          target: {
            name: "text",
            args: [e.data.files[0].name]
          }
        });
      }
    ))
    .then(({content, children}) => ({
      requestId: e.data.requestId,
      error: false,
      data: {
        content,
        dependency: buildDependency(e.data.files[0].name, children),
        timeout: performance.now() - ts
      }
    }))
    .catch(err => {
      console.error(err); // eslint-disable-line
      return {
        requestId: e.data.requestId,
        error: true,
        data: err.message
      };
    })
    .then(message => self.postMessage(message));
});
})();
