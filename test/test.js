/* eslint-env mocha */
const assert = require("power-assert");

describe("parsePipes", () => {
  const {parsePipes} = require("../lib/parser");
  
  it("basic", () => {
    const result = parsePipes("test:123");
    assert.deepEqual(result, [{name: "test", args: ["123"]}]);
  });
  
  it("no value", () => {
    const result = parsePipes("a");
    assert.deepEqual(result, [{name: "a", args: []}]);
  });
  
  it("multiple values", () => {
    const result = parsePipes("a:b,c");
    assert.deepEqual(result, [{name: "a", args: ["b", "c"]}]);
  });
  
  it("escape characters", () => {
    const result = parsePipes("a\\:b:a\\,b");
    assert.deepEqual(result, [{name: "a:b", args: ["a,b"]}]);
  });
});

describe("parseDirective", () => {
  const {parseDirective} = require("../lib/parser");
  
	it("shortcut", () => {
		const result = parseDirective("$inline.shortcut('a', 'b')");
    assert(result.type === "$inline.shortcut");
    assert.deepEqual(result.params, ["a", "b"]);
	});
});

describe("shortcut", () => {
  const {parsePipes} = require("../lib/parser");
  
  function prepare(name, expand) {
    delete require.cache[require.resolve("../lib/shortcut")];
    const shortcut = require("../lib/shortcut");
    shortcut.addGlobal({name, expand});
    return exp => {
      const pipes = parsePipes(exp);
      return shortcut.expand(null, pipes);
    };
  }
	
	it("basic", () => {
		const expand = prepare("test", "a.txt|tr:$1");
		assert(expand("test:abc") === "a.txt|tr:abc");
	});
	
	it("multiple arguments", () => {
		const expand = prepare("test", "a.txt|tr:$1|tr2:$2");
		assert(expand("test:abc,123") === "a.txt|tr:abc|tr2:123");
	});
	
	it("$&", () => {
		const expand = prepare("test", "a.txt|tr:$&");
		assert(expand("test:abc,123") === "a.txt|tr:abc,123");
	});
	
	it("additional pipes", () => {
		const expand = prepare("test", "a.txt|tr");
		assert(expand("test|tr2|tr3") === "a.txt|tr|tr2|tr3");
	});
  
  it("use function", () => {
    const expand = prepare("test", (source, a, b) => `a.txt|${a}|${b}`);
    assert(expand("test:123,456") === "a.txt|123|456");
  });
});

describe("parseText", () => {
	const {parseText} = require("../lib/parser");
  
	it("$inline", () => {
    const [result] = parseText("$inline('path/to/file')");
    assert(result.type === "$inline");
    assert.deepEqual(result.params, ["path/to/file"]);
	});
	
	it("start and end", () => {
		const [left, result, right] = parseText("$inline.start('./a.txt')\ntest\n$inline.end");
    assert(left.type === "text");
    assert(left.value === "$inline.start('./a.txt')\n");
    
    assert(result.type === "$inline.start");
    assert.deepEqual(result.params, ["./a.txt"]);
    
    assert(right.type === "text");
    assert(right.value === "\n$inline.end");
	});
	
	it("line", () => {
		const [left, result, right] = parseText("test\ntest$inline.line('path/to/file')test\ntest");
    assert(left.type === "text");
    assert(left.value === "test\n");
    
    assert(result.type === "$inline.line");
    assert.deepEqual(result.params, ["path/to/file"]);
    
    assert(right.type === "text");
    assert(right.value === "\ntest");
	});
	
	it("shortcut", () => {
    const content = "$inline.shortcut('test', 'file|t1:$2,$1')";
		const [result, text] = parseText(content);
    assert(result.type === "$inline.shortcut");
    assert.deepEqual(result.params, ["test", "file|t1:$2,$1"]);
    
    assert(text.type === "text");
    assert(text.value === content);
	});
});

describe("inline", () => {
  const {inline} = require("..");
  
  function mustFailed() {
    throw new Error("Must failed");
  }
  
	it("maxDepth", () => {
    const target = {
      name: "text",
      args: [`${__dirname}/recursive/test`]
    };
    return inline({target, maxDepth: 10})
      .then(mustFailed)
      .catch(err => {
        assert(err.message.includes("Max recursion depth 10"));
      });
	});
	
	it("shortcut", () => {
    const target = {
      name: "text",
      args: [`${__dirname}/shortcut/test`]
    };
    return inline({target})
      .then(content => {
        assert(/\nOK$/.test(content));
      });
	});
});

describe("transforms", () => {
  const transformer = require("../lib/transformer");
	
  function prepare(baseOptions) {
    return options => {
      const {name, content, args = [], expect, source} = Object.assign(
        {}, baseOptions, options);
      return transformer.transform(source, content, [{name, args}])
        .then(result => assert(result === expect));
    };
  }
	
	it("cssmin", () => {
    const test = prepare({
      name: "cssmin",
      content: 'body {\n  color: #000000;\n}\n',
      expect: "body{color:#000}"
    });
    return test();
	});
	
	it("eval", () => {
    const test = prepare({
      name: "eval",
      content: "123",
      args: ["Number($0) + 321"],
      expect: 444
    });
    return test();
  });
	
	it("parse", () => {
    const test = prepare({
      name: "parse",
      content: '{"version": "1.2.3","nested": {"prop": 123}}'
    });
    return Promise.all([
      test({args: ["version"], expect: "1.2.3"}),
      test({args: ["nested", "prop"], expect: 123})
    ]);
	});
	
	it("markdown", () => {
    const test = prepare({
      name: "markdown",
      content: "some text"
    });
    return Promise.all([
      test({args: ["codeblock"], expect: "```\nsome text\n```"}),
      test({args: ["code"], expect: "`some text`"}),
      test({args: ["quote"], expect: "> some text"}),
      test({
        args: ["quote"],
        content: "some text\nsome text",
        expect: "> some text\n> some text"
      })
    ]);
	});
	
	it("dataurl", () => {
    const fs = require("fs");
    const test = prepare({name: "dataurl"});
    return Promise.all([
      test({
        source: {name: "file", args: ["test.css"]},
        content: fs.readFileSync(`${__dirname}/base64/test.css`),
        expect: fs.readFileSync(`${__dirname}/base64/test.css-base64.txt`, "utf8")
      }),
      test({
        source: {name: "file", args: ["test.png"]},
        content: fs.readFileSync(`${__dirname}/base64/test.png`),
        expect: fs.readFileSync(`${__dirname}/base64/test.png-base64.txt`, "utf8")
      })
    ]);
	});
  
  it("handle promise", () => {
    transformer.add({
      name: "testPromise",
      transform() {
        return new Promise(resolve => {
          setTimeout(() => resolve("OK"), 100);
        });
      }
    });
    
    const test = prepare({name: "testPromise", expect: "OK"});
    return test();
  });
});

describe("resource", () => {
  const resource = require("../lib/resource");
  
  function prepare(baseOptions) {
    return options => {
      const {name, args, expect, expectType} = Object.assign(
        {}, baseOptions, options);
      return resource.read(null, {name, args})
        .then(content => {
          if (expectType) {
            if (expectType === "buffer") {
              assert(Buffer.isBuffer(content));
            } else {
              assert(typeof content === expectType);
            }
          }
          if (expect) {
            if (Buffer.isBuffer(content)) {
              assert(content.compare(expect) === 0);
            } else {
              assert(content === expect);
            }
          }
        });
    };
  }
  
	const F = `${__dirname}/base64/test`;
	
	it("file", () => {
    const test = prepare({name: "file"});
    return Promise.all([
      test({args: [F], expectType: "string"}),
      test({args: [F + ".css"], expectType: "string"}),
      test({args: [F + ".png"], expectType: "buffer"})
    ]);
	});
	
	it("raw", () => {
    const test = prepare({name: "raw"});
    return Promise.all([
      test({args: [F], expectType: "buffer"}),
      test({args: [F + ".css"], expectType: "buffer"}),
      test({args: [F + ".png"], expectType: "buffer"})
    ]);
	});
	
	it("text", () => {
    const test = prepare({name: "text"});
    return Promise.all([
      test({args: [F], expectType: "string"}),
      test({args: [F + ".css"], expectType: "string"}),
      test({args: [F + ".png"], expectType: "string"})
    ]);
	});
	
	it("cmd", () => {
    const command = 'node -e "console.log(1 + 1)"';
    const test = prepare({name: "cmd"});
		return Promise.all([
      test({
        args: [command],
        expectType: "string",
        expect: "2\n"
      }),
      test({
        args: [command, "buffer"],
        expectType: "buffer",
        expect: Buffer.from("2\n")
      })
    ]);
	});
});

describe("conf", () => {
  const MODS = ["shortcut", "resource", "transformer", "conf"];
  
  function test(file, expectConfigured) {
    MODS.forEach(name => {
      delete require.cache[require.resolve(`../lib/${name}`)];
    });
    const [shortcut, resource, transformer, conf] = MODS.map(name => {
      return require(`../lib/${name}`);
    });
    
    conf.findAndLoad(file);
    
    assert(shortcut.has(null, "shortcutConfigured") === expectConfigured);
    assert(resource.has("resourceConfigured") === expectConfigured);
    assert(transformer.has("transformConfigured") === expectConfigured);
    
    if (expectConfigured) {
      return Promise.all([
        Promise.resolve(shortcut.expand(null, [{name: "shortcutConfigured", args: []}]))
          .then(result => {
            assert(result === "shortcutOK");
          }),
        resource.read(null, {name: "resourceConfigured", args: []})
          .then(content => {
            assert(content === "resourceOK");
          }),
        transformer.transform(null, "", [{name: "transformConfigured", args: []}])
          .then(content => {
            assert(content === "transformOK");
          })
      ]);
    }
  }
  
  it("find in current path", () => {
    return test(`${__dirname}/conf/test`, true);
  });
  
  it("find in ancestor", () => {
    return test(`${__dirname}/conf/b/test`, true);
  });
  
  it("don't go up through package root", () => {
    return test(`${__dirname}/conf/a/test`, false);
  });
});
