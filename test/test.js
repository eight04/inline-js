/* eslint no-console: 0 */
var {describe, it} = require("mocha"),
	{assert} = require("chai"),
	proxyquire = require("proxyquire"),
	sinon = require("sinon");
	
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

});
