function createLogger() {
	var readline = require("readline");
	return {
		log(data = "", end = "\n") {
			process.stdout.write(data + end);
		},
		clear() {
			readline.clearLine(process.stdout, -1);
			readline.cursorTo(process.stdout, 0, null);
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

function* inlines(content) {
	var vm = require("vm"),
		re = /\$inline\([\s\S]+?\)/gi,
		match;
		
	function sandBox() {
		return {
			$inline: (...args) => args
		};
	}
	
	while ((match = re.exec(content))) {
		var [resource, ...args] = vm.runInNewContext(match[0], sandBox()),
			transforms;
		if (typeof resource == "string") {
			[resource, transforms] = parseResource(resource);
		}
		transforms.push(...args);
		transforms = normalizeTransforms(transforms);
		yield {
			start: match.index,
			match: match[0],
			end: re.lastIndex,
			resource, transforms
		};
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

function inline({resource, from, transformer, transforms, resourceCenter}) {
	var content = resourceCenter.read({from, resource}),
		text = [],
		i = 0;
		
	for (var result of inlines(content)) {
		Object.assign(result, {
			from: resource,
			transformer,
			resourceCenter
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

function loadConfig({transformer, resourceCenter}) {
	var config = require("./.inline.js");
	
	transformer.load(config);
	resourceCenter.load(config);
	
	var configPath = moduleRoot().extend(".inline.js").path;
	
	try {
		config = require(configPath);
	} catch (err) {
		config = null;
	}

	if (config) {
		transformer.load(config);
		resourceCenter.load(config);
	}
}

function init({
	args: {
		"--out": out,
		"--dry-run": dry,
		"<entry_file>": file,
	},
	logger = createLogger(),
	transformer = createTransformer(),
	resourceCenter = createResourceCenter()
}) {
	
	loadConfig({transformer, resourceCenter});
	
	var path = require("pathlib"),
		fs = require("fs-extra"),
		resource = ["file", path.resolve(file)],
		content = inline({resource, resourceCenter, transformer});
	
	if (out) {
		if (!dry) {
			fs.outputFileSync(out, content);
		}
	} else {
		logger.log(content, "");
	}
}

module.exports = {
	init, inlines, parseResource
};
