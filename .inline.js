const IS_FILE = new Set(["file", "text", "raw"]);

function readFile(
	from, resource,
	isBinary = require('is-binary-path')(resource.args)
) {
	var path = require("pathlib"),
		fs = require("fs"),
		src = getDir(from) || ".";
	resource.args = path(src).resolve(resource.args).path;
	if (isBinary) {
		return fs.readFileSync(resource.args);
	}
	return fs.readFileSync(resource.args, "utf8");
}

function readCmd(from, resource) {
	const cwd = getDir(from) || ".";
	const {execSync} = require("child_process");
	return execSync(resource.args, {cwd});
}

function getDir(resource) {
	if (resource && IS_FILE.has(resource.name)) {
		return require("path").dirname(resource.args);
	}
}

module.exports = {
	resources: [{
		name: "file",
		read({from, resource}) {
			return readFile(from, resource);
		}
	}, {
		name: "raw",
		read({from, resource}) {
			return readFile(from, resource, true);
		}
	}, {
		name: "text",
		read({from, resource}) {
			return readFile(from, resource, false);
		}
	}, {
		name: "cmd",
		read({from, resource}) {
			return readCmd(from, resource);
		}
	}],
	transforms: [{
		name: "string",
		transform(file, content, encoding = "utf8") {
			if (Buffer.isBuffer(content)) {
				content = content.toString(encoding);
			}
			return content;
		}
	}, {
		name: "cssmin",
		transform(file, content) {
			return (new (require("clean-css"))).minify(content).styles;
		}
	}, {
		name: "docstring",
		transform(file, content) {
			return content.match(/`((\\`|[^`])+)`/)[1];
		}
	}, {
		name: "stringify",
		transform(file, content) {
			return JSON.stringify(content);
		}
	}, {
		name: "dataurl",
		transform(
			file,
			content,
			type = require("mime").getType(file) || "text/plain",
			charset = ""
		) {
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
		transform(file, content, code) {
			var vm = require("vm");
			return vm.runInNewContext(code, {$0: content});
		}
	}, {
		name: "markdown",
		transform(file, content, type) {
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
		transform(file, content, ...props) {
			var json = JSON.parse(content);
			while (props.length) {
				json = json[props.shift()];
			}
			return json;
		}
	}, {
		name: "trim",
		transform(file, content) {
			return content.trim();
		}
	}]
};