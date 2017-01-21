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
	var map = new Map, self;
	return self = {
		add({name, transform, pre}) {
			pre = normalizeTransforms(pre);
			map.set(name, {transform, pre});
		},
		transform: function transformer({resource, transforms = [], content}) {
			for (var [name, ...args] of transforms) {
				var {transform, pre} = map.get(name);
				if (pre) content = transformer({resource, transforms: pre, content});
				content = transform(content, ...args);
			}

			return content;
		},
		load: function({transforms = []}) {
			transforms.forEach(t => self.add(t));
		}
	};
}

function normalizeTransforms(arr) {
	if (!arr) return;
	var out = [];
	if (typeof arr == "string") arr = [arr];
	while (arr.length) {
		var t = arr.shift();
		if (Array.isArray(t)) {
			out.push(t);
		} else if (typeof t == "string") {
			out.push([t]);
		} else {
			out[out.length - 1].push(t);
		}
	}
	return out;
}

function parseResource(text) {
	// FIXME: use a text parser
	var tokens = text.split("|");

	tokens = tokens.map(token => {
		var o = [], i;
		if ((i = token.indexOf(":")) < 0) {
			o.push(null, ...token.split(","));
			if (o.length == 2) {
				o.shift();
			}
		} else {
			o.push(token.slice(0, i), ...token.slice(i + 1).split(","));
		}
		return o;
	});

	if (tokens[0].length == 1) {
		tokens[0].unshift("file");
	}

	return [tokens[0], tokens.slice(1)];
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

function sandBox() {
	var o = {};
	o.$inline = (...args) => args;
	o.$inline.start = (...args) => args;
	o.$inline.line = (...args) => args;
	return o;
}

function* inlines(content) {
	var vm = require("vm"),
		re = /\$inline((\.(start|line))?\([\s\S]+?\)|\.end)/gi,
		match;

	var defferedStart = null,
		lr, result;

	while ((match = re.exec(content))) {
		if (defferedStart) {
			if (match[0] != "$inline.end") {
				throw new Error(`Failed to match $inline.start at ${defferedStart.start}, missing $inline.end`);
			}
			lr = getLineRange(content, match.index);
			defferedStart.end = lr.beforeStart;
			if (defferedStart.start > defferedStart.end) {
				throw new Error(`$inline.start and $inline.end must not present at the same line`);
			}
			yield defferedStart;
			defferedStart = null;
			continue;
		}

		var [resource, ...args] = vm.runInNewContext(match[0], sandBox()),
			transforms;
		if (typeof resource == "string") {
			[resource, transforms] = parseResource(resource);
		}
		transforms.push(...args);
		transforms = normalizeTransforms(transforms);

		result = {
			type: match[0].match(/^[^(]+/)[0],
			start: match.index,
			end: re.lastIndex,
			resource, transforms
		};

		if (result.type == "$inline.start") {
			lr = getLineRange(content, match.index);
			result.start = lr.afterEnd;
			defferedStart = result;
			continue;
		}

		if (result.type == "$inline.line") {
			lr = getLineRange(content, match.index);
			result.start = lr.start;
			result.end = lr.end;
		}

		yield result;
	}

	if (defferedStart) {
		throw new Error(`Failed to match $inline.start at ${defferedStart.start}, missing $inline.end`);
	}
}

function createResourceCenter() {
	var map = new Map, self;
	return self = {
		read({from, resource}) {
			return map.get(resource[0])({from, resource});
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
	resourceCenter, depth = 0, maxDepth = 10, dependency = {}
}) {
	if (depth > maxDepth) {
		throw new Error(`Max recursion depth ${maxDepth} exceeded, if you are not making an infinite loop please increase --max-depth limit`);
	}

	var content = resourceCenter.read({from, resource}),
		text = [],
		i = 0;

	dependency = dependency[resource[1]] = {};

	for (var result of inlines(content)) {
		Object.assign(result, {
			from: resource,
			transformer,
			resourceCenter,
			depth: depth + 1,
			maxDepth,
			dependency
		});
		text.push(content.slice(i, result.start), inline(result));
		i = result.end;
	}

	text.push(content.slice(i));

	content = text.join("");

	content = transformer.transform({resource, transforms, content});

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

function loadConfig({transformer, resourceCenter, logger}) {
	var config = require("./.inline.js");

	transformer.load(config);
	resourceCenter.load(config);

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
	}
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
	resourceCenter = createResourceCenter()
}) {
	if (!dry && !out) {
		logger.startDebug();
	}

	logger.log("inline-js started\n");

	loadConfig({transformer, resourceCenter, logger});

	var path = require("pathlib"),
		fs = require("fs-extra"),
		treeify = require("treeify"),
		resource = ["file", path.resolve(file)],
		dependency = {},
		content = inline({
			resource, resourceCenter, transformer, maxDepth, dependency
		});

	var [root] = Object.keys(dependency);
	logger.log(`Result inline tree:`);
	logger.log(root);
	logger.log(treeify.asTree(dependency[root]));

	if (dry) {
		logger.log(`[dry] Output to ${out ? path.resolve(out) : "stdout"}`);
	} else if (out) {
		fs.outputFileSync(out, content);
	} else {
		logger.print(content, "");
	}
}

module.exports = {
	init, inlines, parseResource, inline
};
