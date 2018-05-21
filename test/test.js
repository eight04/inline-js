/* eslint-env mocha */
const assert = require("power-assert");

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
      }),
      test({
        args: ["exit 1"]
      })
        .then(() => {
          throw new Error("Must fail");
        })
        .catch(err => assert(err.message.includes("Non-zero exit code")))
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
