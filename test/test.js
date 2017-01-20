/* eslint no-console: 0 */
var {describe, it} = require("mocha"),
	chai = require("chai"),
	{assert} = chai,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");
	
chai.use(require("chai-subset"));
	
var content = "";

var fs = {
	readFileSync: sinon.spy(() => content)
};

var fsExtra = {
	outputFileSync: sinon.spy()
};

var {
	inlines, parseResource
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
	
	it("resource", () => {
		var [{resource}] = [...inlines("$inline('./a.txt')")];
		assert.deepEqual(["file", "./a.txt"], resource);
	});
	
	it("transform", () => {
		var [{transforms}] = [...inlines("$inline('./a.txt|t1|t2')")];
		assert.deepEqual([["t1"], ["t2"]], transforms);
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
