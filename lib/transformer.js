const vm = require("vm");
const asyncro = require("asyncro");
const mime = require("mime");
const CleanCSS = require("clean-css");

const resource = require("./resource");

const transformers = new Map;
const cleanCss = new CleanCSS;

const DEFAULT_TRANSFORMS = [{
	name: "string",
	transform(source, content, encoding = "utf8") {
		if (Buffer.isBuffer(content)) {
			content = content.toString(encoding);
		}
		return content;
	}
}, {
	name: "cssmin",
	transform(source, content) {
		return cleanCss.minify(content).styles;
	}
}, {
	name: "docstring",
	transform(source, content) {
		return content.match(/`((\\`|[^`])+)`/)[1];
	}
}, {
	name: "stringify",
	transform(source, content) {
		return JSON.stringify(content);
	}
}, {
	name: "dataurl",
	transform(source, content, type = getMimeType(source), charset = "") {
		if (!Buffer.isBuffer(content) || type.startsWith("text")) {
			if (!charset) charset = "utf8";
			if (!Buffer.isBuffer(content)) {
				content = Buffer.from(content, charset);
			}
		}
		if (charset) {
			charset = `;charset=${charset}`;
		}
		return `data:${type}${charset};base64,${content.toString("base64")}`;
	}
}, {
	name: "eval",
	transform(source, content, code) {
		return vm.runInNewContext(code, {$0: content});
	}
}, {
	name: "markdown",
	transform(source, content, type) {
		if (type == "codeblock") {
			return "```\n" + content + "\n```";
		}
		if (type == "code") {
			return "`" + content + "`";
		}
		if (type == "quote") {
			return content.split("\n").map(l => "> " + l).join("\n");
		}
	}
}, {
	name: "parse",
	transform(source, content, ...props) {
		var json = JSON.parse(content);
		while (props.length) {
			json = json[props.shift()];
		}
		return json;
	}
}, {
	name: "trim",
	transform(source, content) {
		return content.trim();
	}
}];

DEFAULT_TRANSFORMS.forEach(add);

function getMimeType(source) {
	return resource.PATH_LIKE.has(source.name) &&
		mime.getType(source.args[0]) ||
		"text/plain";
}

function add(transformer) {
	transformers.set(transformer.name, transformer);
}

// async
function transform(source, content, transforms) {
	return asyncro.reduce(
		transforms,
		(content, transform) => {
			const transformer = transformers.get(transform.name);
			return transformer.transform(source, content, ...transform.args);
		},
		content
	);
}

module.exports = {add, transform};
