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
		return unescapeBackTick(content.match(/`((\\`|[^`])+)`/)[1]);
	}
}, {
	name: "stringify",
	transform(source, content) {
		return JSON.stringify(content);
	}
}, {
	name: "dataurl",
	transform(source, content, type = getMimeType(source), charset = "") {
    if (!Buffer.isBuffer(content)) {
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

function unescapeBackTick(s) {
  s = s.replace(/\\`|\\"|"/g, m => {
    if (m == "\\`") {
      return "`";
    }
    if (m == '"') {
      return '\\"';
    }
    return m;
  });
  return JSON.parse(`"${s}"`);
}

module.exports = {DEFAULT_TRANSFORMS};
