/* eslint no-console: 0 */
var {describe, it} = require("mocha"),
	chai = require("chai"),
	{assert} = chai,
	proxyquire = require("proxyquire"),
	sinon = require("sinon"),
	conf = require("../.inline.js");
	
chai.use(require("chai-subset"));
	
var content = "";

var fs = {
	readFileSync: sinon.spy(() => content)
};

var fsExtra = {
	outputFileSync: sinon.spy()
};

var {
	inlines, parseResource, inline
} = proxyquire("../index", {fs, "fs-extra": fsExtra});

describe("parseResource", () => {
	it("file path", () => {
		var [resource] = parseResource("./a.txt");
		assert.deepEqual(resource, ["file", "./a.txt"]);
	});
	it("file path + transforms", () => {
		var [resource, transforms] = parseResource("./a.txt|A|B");
		assert.deepEqual(resource, ["file", "./a.txt"]);
		assert.deepEqual(transforms, [["A"], ["B"]]);
	});
	it("transforms + param", () => {
		var [, transforms] = parseResource("./a.txt|A:p1|B:p2,p3");
		assert.deepEqual(transforms, [["A", "p1"], ["B", "p2", "p3"]]);
	});
});

describe("inlines", () => {
	
	it("$inline", () => {
		var [parsed] = [...inlines("$inline('path/to/file')")];
		assert.containSubset(parsed, {
			type: "$inline",
			start: 0,
			end: 23
		});
	});
	
	it(".start .end", () => {
		var [parsed] = [...inlines("$inline.start('./a.txt')\ntest\n$inline.end")];
		assert.containSubset(parsed, {
			type: "$inline.start",
			start: 25,
			end: 29
		});
	});
	
	it(".line", () => {
		var [parsed] = [...inlines("test\ntest$inline.line('path/to/file')test\ntest")];
		assert.containSubset(parsed, {
			type: "$inline.line",
			start: 5,
			end: 41
		});
	});

});

describe("inline", () => {
	it("maxDepth", () => {
		var resourceCenter = {
			read: sinon.spy(() => {
				assert.isBelow(resourceCenter.read.callCount, 20);
				return "$inline('./self')";
			})
		};
		assert.throws(() => {
			inline({resourceCenter, resource: ["file", "./self"], maxDepth: 10, depth: 0});
		}, "Max recursion depth 10");
	});
});

describe("transforms", () => {
	var tr = {};
	conf.transforms.forEach(tf => tr[tf.name] = tf.transform);
	
	it("eval", () => {
		assert.equal(
			tr.eval('{"hello": 123}', "JSON.parse($0).hello"),
			123
		);
	});
	
	it("parse", () => {
		var content = '{"version": "1.2.3","nested": {"prop": 123}}';
		assert.equal(tr.parse(content, "version"), "1.2.3");
		assert.equal(tr.parse(content, "nested", "prop"), 123);
	});
	
	it("markdown", () => {
		var content = "some text";
		assert.equal(tr.markdown(content, "codeblock"), "```\nsome text\n```");
		assert.equal(tr.markdown(content, "code"), "`some text`");
		assert.equal(tr.markdown(content, "quote"), "> some text");
	});
});