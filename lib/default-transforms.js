const vm = require("vm");
const mime = require("mime");
const CleanCSS = require("clean-css");

const cleanCss = new CleanCSS;

const {PATH_LIKE} = require("./default-resources");

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
    throw new Error(`Unknown markdown type: ${type}`);
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

function getMimeType(source) {
	return source && PATH_LIKE.has(source.name) &&
		mime.getType(source.args[0]) ||
		"text/plain";
}

module.exports = {DEFAULT_TRANSFORMS};
