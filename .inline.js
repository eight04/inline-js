module.exports = {
	resources: [{
		name: "file",
		read({from, resource}) {
			var path = require("pathlib"),
				fs = require("fs"),
				src = ".";
				
			if (from && from[0] == "file") {
				src = path(from[1]).dir();
			}
			resource[1] = path(src).resolve(resource[1]).path;
			return fs.readFileSync(resource[1], "utf8");
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
		transform(content, getter) {
			var vm = require("vm"),
				code = `$=(${content}),${getter}`;
			return vm.runInNewContext(code);
		}
	}, {
		name: "trim",
		transform(content) {
			return content.trim();
		}
	}]
};