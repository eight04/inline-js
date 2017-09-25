function createLogger() {
	var readline = require("readline"),
		logStream = process.stdout;
	return {
		print(data = "", end = "\n") {
			process.stdout.write(data + end);
		},
		log(data = "", end = "\n") {
			logStream.write(data + end);
		},
		clear() {
			readline.clearLine(process.stdout, -1);
			readline.cursorTo(process.stdout, 0, null);
		},
		startDebug() {
			logStream = process.stderr;
		}
	};
}

function createTransformer() {
	var map = new Map, self, haye = require("haye");
	return self = {
		add({name, transform, pre}) {
			if (pre) {
				pre = haye.fromPipe(pre).toArray();
			}
			map.set(name, {transform, pre});
		},
		transform({resource, transforms = [], content}) {
			for (var {name, args} of transforms) {
				var {transform, pre} = map.get(name);
				if (pre) content = self.transform({resource, transforms: pre, content});
				if (!Array.isArray(args)) {
					if (args == null) {
						args = [];
					} else {
						args = [args];
					}
				}
				content = transform(resource.args, content, ...args);
			}

			return content;
		},
		load: function({transforms = []}) {
			transforms.forEach(t => self.add(t));
		}
	};
}

function getLineRange(text, pos) {
	// FIXME: this might fail if \r\n messed up
	var i, result = {};
	i = text.lastIndexOf("\n", pos);
	result.start = i + 1;
	if (text[i - 1] == "\r") {
		result.beforeStart = i - 1;
	} else {
		result.beforeStart = i;
	}
	i = text.indexOf("\n", pos);
	if (text[i - 1] == "\r") {
		result.end = i - 1;
	} else {
		result.end = i;
	}
	result.afterEnd = i + 1;
	return result;
}

function parseArguments(text) {
	var haye = require("haye"),
		result = haye.fromPipe(text).toArray(),
		resource = result[0],
		transforms = result.slice(1);
		
	if (resource.args == null) {
		resource.args = resource.name;
		resource.name = "file";
	}
	
	return {resource, transforms};
}

function parseRegex(text) {
	var flags = text.match(/[a-z]*$/)[0];
	return new RegExp(text.slice(1, -(flags.length + 1)), flags);
}

function parseString(text) {
	if (text[0] == "'") {
		text = '"' + text.slice(1, -1).replace(/([^\\]|$)"/g, '$1\\"') + '"';
	}
	return JSON.parse(text);
}

function parseInline(text, pos = 0, flags = {}) {
	var {default: jsTokens, matchToToken} = require("js-tokens"),
		match, token, info = {type: "$inline"};
		
	jsTokens.lastIndex = pos;
	jsTokens.exec(text);	// skip $inline
	match = jsTokens.exec(text);
	if (match[0] == ".") {
		token = matchToToken(jsTokens.exec(text));
		if (token.type != "name") {
			throw new Error;
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
	info.params = [];
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
			throw new Error(`Failed to parse $inline statement at ${match.index}`);
		} else {
			flags.needValue = !flags.needValue;
			if (token.type == "punctuator") continue;
		}
		if (token.type == "regex") {
			token.value = parseRegex(token.value);
		} else if (token.type == "number") {
			token.value = +token.value;
		} else if (token.type == "string") {
			if (!token.closed) token.value += token.value[0];
			token.value = parseString(token.value);
		}
		info.params.push(token.value);
	}
	if (!info.end) {
		throw new Error("Missing right parenthesis");
	}
	return info;
}

function* inlines(content) {
	var re = /\$inline[.(]/gi,
		match, type, params, 
		flags = {};

	while ((match = re.exec(content))) {
		({type, params, end: re.lastIndex} = parseInline(content, match.index, flags));
		
		if (flags.skip) {
			if (type == "$inline.skipEnd") {
				flags.skip = false;
			}
			continue;
		}
		
		if (flags.start) {
			if (type != "$inline.end") {
				continue;
			}
			flags.start.end = getLineRange(content, match.index).beforeStart;
			if (flags.start.start > flags.start.end) {
				throw new Error(`$inline.start and $inline.end must not present at the same line`);
			}
			yield flags.start;
			flags.start = null;
			continue;
		}
		
		if (flags.open) {
			if (type != "$inline.close") {
				continue;
			}
			var offset = params && params[0] || 0;
			flags.open.end = match.index - offset;
			yield flags.open;
			flags.open = null;
			continue;
		}
		
		if (type == "$inline.skipStart") {
			flags.skip = true;
			continue;
		}
		
		if (type == "$inline.start") {
			flags.start = {
				type, params,
				start: getLineRange(content, match.index).afterEnd
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
			yield {
				type, params,
				start: match.index,
				end: re.lastIndex
			};
			continue;
		}
		
		if (type == "$inline.line") {
			var {start, end} = getLineRange(content, match.index);
			yield {
				type, params,
				start, end
			};
			continue;
		}
		
		if (type == "$inline.shortcut") {
			yield {
				type, params
			};
			continue;
		}
		
		throw new Error(`${type} is not a valid $inline statement`);
	}

	if (flags.start) {
		throw new Error(`Failed to match $inline.start at ${flags.start.start}, missing $inline.end`);
	}
	
	if (flags.open) {
		throw new Error(`Failed to match $inline.open at ${flags.open.start}, missing $inline.close`);
	}
}

function createResourceCenter() {
	var map = new Map, self;
	return self = {
		read({from, resource}) {
			return map.get(resource.name)({from, resource});
		},
		add({name, read}) {
			map.set(name, read);
		},
		load({resources = []}) {
			resources.forEach(r => self.add(r));
		}
	};
}

function inline({
	resource, from, transformer = createTransformer(), transforms,
	resourceCenter, depth = 0, maxDepth = 10, dependency = {}, shortcuts = createShortcuts(), state
}) {
	if (depth > maxDepth) {
		throw new Error(`Max recursion depth ${maxDepth} exceeded, if you are not making an infinite loop please increase --max-depth limit`);
	}

	dependency = dependency[resource.args] = {};

	var content = resourceCenter.read({from, resource});
	
	if (typeof content === 'string') {
		var text = [],
			i = 0;

		for (var result of inlines(content)) {
			if (result.type == "$inline.shortcut") {
				shortcuts.add(resource.args, ...result.params);
				continue;
			}
			var args = shortcuts.expand(resource.args, result.params[0]);
			Object.assign(
				result,
				parseArguments(args),
				{
					from: resource,
					transformer,
					resourceCenter,
					shortcuts,
					depth: depth + 1,
					maxDepth,
					dependency,
					state
				}
			);
			text.push(content.slice(i, result.start), inline(result));
			i = result.end;
		}
		
		shortcuts.remove(resource.args);

		text.push(content.slice(i));

		content = text.join("");
	}
	
	content = transformer.transform({resource, transforms, content});
	
	if (Buffer.isBuffer(content)) {
		content = content.toString("binary");
		state.isBinary = true;
	}

	return content;
}

function moduleRoot() {
	var path = require("pathlib"),
		fs = require("fs"),
		pkg = path("./folder/package.json").resolve();

	do {
		pkg = pkg.move("..");
		try {
			fs.accessSync(pkg.path);
		} catch (err) {
			continue;
		}
		return pkg.dir();
	} while (!pkg.dir().isRoot());
}

function loadConfig({transformer, resourceCenter, logger, shortcuts}) {
	var config = require("./.inline.js");

	transformer.load(config);
	resourceCenter.load(config);
	shortcuts.load(config);

	var mr = moduleRoot();

	if (!mr) return;

	var configPath = mr.extend(".inline.js").path;

	try {
		config = require(configPath);
	} catch (err) {
		config = null;
	}

	if (config) {
		logger.log(`Load ${configPath}\n`);
		transformer.load(config);
		resourceCenter.load(config);
		shortcuts.load(config);
	}
}

function createShortcuts() {
	var global = new Map,
		local = new Map,
		self;
	function getExpandor(file, name) {
		if (local.has(file) && local.get(file).has(name)) {
			return local.get(file).get(name);
		}
		if (global.has(name)) {
			return global.get(name);
		}
		return null;
	}
	return self = {
		add(file, name, expand) {
			if (!local.has(file)) {
				local.set(file, new Map);
			}
			local.get(file).set(name, expand);
		},
		addGlobal({name, expand}) {
			global.set(name, expand);
		},
		expand(file, args) {
			var haye = require("haye"),
				[shortcut, ...pipes] = haye.fromPipe(args).toArray(),
				expandor = getExpandor(file, shortcut.name);
			if (!expandor) {
				return args;
			}
			if (!Array.isArray(shortcut.args)) {
				shortcut.args = [shortcut.args];
			}
			var expanded;
			if (typeof expandor == "function") {
				expanded = expandor(file, ...shortcut.args);
			} else if (typeof expandor == "string") {
				expanded = expandor.replace(/\$(\d+|&)/g, (match, n) => {
					if (n == "&") {
						return shortcut.args.join(",");
					}
					return shortcut.args[n - 1];
				});
			} else {
				throw new Error(`expandor must be a string or function: ${expandor}`);
			}
			pipes = pipes.map(({name, args}) => {
				if (!args) {
					return name;
				}
				name += ":";
				if (!Array.isArray(args)) {
					args = [args];
				}
				name += args.join(",");
				return name;
			});
			
			return [expanded].concat(pipes).join("|");
		},
		remove(file) {
			local.delete(file);
		},
		load({shortcuts = []}) {
			shortcuts.forEach(self.addGlobal);
		}
	};
}

function init({
	args: {
		"--out": out,
		"--dry-run": dry,
		"--max-depth": maxDepth,
		"<entry_file>": file,
	},
	logger = createLogger(),
	transformer = createTransformer(),
	resourceCenter = createResourceCenter(),
	shortcuts = createShortcuts(),
	state = {}
}) {
	if (!dry && !out) {
		logger.startDebug();
	}

	logger.log("inline-js started\n");

	loadConfig({transformer, resourceCenter, logger, shortcuts});

	var path = require("pathlib"),
		fs = require("fs-extra"),
		treeify = require("treeify"),
		resource = {
			name: "file",
			args: path.resolve(file)
		},
		dependency = {},
		content = inline({
			resource, resourceCenter, transformer, maxDepth, dependency, shortcuts, state
		});

	var [root] = Object.keys(dependency);
	logger.log(`Result inline tree:`);
	logger.log(root);
	logger.log(treeify.asTree(dependency[root]));

	if (dry) {
		logger.log(`[dry] Output to ${out ? path.resolve(out) : "stdout"}`);
	} else if (out) {
		fs.outputFileSync(out, content);
	} else if (state.isBinary) {
		process.stdout.write(Buffer.from(content, "binary"));
	} else {
		logger.print(content, "");
	}
}

module.exports = {
	init, inlines, inline, parseInline, createShortcuts,
};
