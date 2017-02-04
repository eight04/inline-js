module.exports = {
	resources: [{
		name: "file",
		read({from, resource}) {
			var path = require("pathlib"),
				fs = require("fs"),
				src = ".";
				
			if (from && from.name == "file") {
				src = path(from.args).dir();
			}
			resource.args = path(src).resolve(resource.args).path;
			return fs.readFileSync(resource.args, "utf8");
		}
	}],
	transforms: [{
		name: "string",
		transform(content, encoding = "utf8") {
			if (Buffer.isBuffer(content)) {
				content = content.toString(encoding);
			}
			return content;
		}
	}, {
		name: "cssmin",
		transform(content) {
			return (new (require("clean-css"))).minify(content).styles;
		}
	}, {
		name: "docstring",
		transform(content) {
			return content.match(/`((\\`|[^`])+)`/)[1];
		}
	}, {
		name: "stringify",
		transform(content) {
			return JSON.stringify(content);
		}
	}, {
		name: "dataurl",
		transform(content, type = "text/plain", charset = "") {
			if (!Buffer.isBuffer(content)) {
				if (!charset) charset = "utf8";
				content = Buffer.from(content, charset);
			}
			if (charset) {
				charset = `;charset=${charset}`;
			}
			return `data:${type}${charset};base64,${content.toString("base64")}`;
		}
	}, {
		name: "eval",
		transform(content, code) {
			var vm = require("vm");
			return vm.runInNewContext(code, {$0: content});
		}
	}, {
		name: "markdown",
		transform(content, type) {
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
		transform(content, ...props) {
			var json = JSON.parse(content);
			while (props.length) {
				json = json[props.shift()];
			}
			return json;
		}
	}, {
		name: "trim",
		transform(content) {
			return content.trim();
		}
	}]
};