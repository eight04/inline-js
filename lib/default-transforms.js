const vm = require("vm");
const mime = require("mime");
const CleanCSS = require("clean-css");

const cleanCss = new CleanCSS;

const {PATH_LIKE} = require("./default-resources");

const DEFAULT_TRANSFORMS = [{
	name: "string",
	transform(ctx, content, encoding = "utf8") {
		if (Buffer.isBuffer(content)) {
			content = content.toString(encoding);
		}
		return content;
	}
}, {
	name: "cssmin",
	transform(ctx, content) {
		return cleanCss.minify(content).styles;
	}
}, {
	name: "docstring",
	transform(ctx, content) {
		return unescapeBackTick(content.match(/`((\\`|[^`])+)`/)[1]);
	}
}, {
  name: "indent",
  transform(ctx, content) {
    const lineStart = ctx.sourceContent.lastIndexOf("\n", ctx.inlineDirective.start - 1) + 1;
    const rx = /\s*/y;
    rx.lastIndex = lineStart;
    const indent = rx.exec(ctx.sourceContent)[0];
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
	return target && PATH_LIKE.has(target.name) &&
		mime.getType(target.args[0]) ||
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
