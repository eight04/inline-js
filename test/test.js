/* eslint-env mocha */
const fs = require("fs");
const assert = require("assert");
const sinon = require("sinon");

describe("transforms", () => {
  const {DEFAULT_TRANSFORMS} = require("../lib/default-transforms");
  const {createTransformer} = require("inline-js-core/lib/transformer");
  const transformer = createTransformer();
  DEFAULT_TRANSFORMS.forEach(transformer.add);
	
  function prepare(baseOptions) {
    return options => {
      const {
        name,
        content,
        args = [],
        expect,
        source,
        error,
        ctx = {inlineTarget: source}
      } = Object.assign({}, baseOptions, options);
      return transformer.transform(ctx, content, [{name, args}])
        .then(
          result => assert.equal(result, expect),
          err => {
            if (!error) {
              throw err;
            }
          }
        );
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
  
  it("docstring", () => {
    const test = prepare({
      name: "docstring",
      content: "`test escaped?\\`\"\\\" new line? \\n`",
      expect: "test escaped?`\"\" new line? \n"
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
  
  describe("indent", () => {
    const ctx = {
      sourceContent: "  $inline('foo|indent')",
      inlineDirective: {
        start: 2,
        end: 23
      }
    };
    const test = prepare({
      name: "indent",
      content: "foo\nbar",
      ctx,
      expect: "foo\n  bar"
    });
    
    it("basic", () => test());
    
    it("no indent", () => test({
      ctx: Object.assign({}, ctx, {sourceContent: "__$inline('foo|indent')"}),
      expect: "foo\nbar"
    }));
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
  
  it("string", () => {
    const test = prepare({
      name: "string",
      content: Buffer.from("我")
    });
    return Promise.all([
      test({expect: "我"}),
      test({args: ["binary"], expect: 'æ'}),
      test({content: "test", expect: "test"})
    ]);
  });
  
  it("stringify", () => {
    const test = prepare({
      name: "stringify",
      content: "some text",
      expect: '"some text"'
    });
    return test();
  });
  
  it("trim", () => {
    const test = prepare({
      name: "trim",
      content: " foo  ",
      expect: "foo"
    });
    return test();
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
      }),
      test({args: ["unknown"], error: true})
    ]);
	});
	
	it("dataurl", () => {
    const fs = require("fs");
    const test = prepare({name: "dataurl"});
    return Promise.all([
      test({
        source: {name: "file", args: ["test"]},
        content: fs.readFileSync(`${__dirname}/base64/test`),
        expect: fs.readFileSync(`${__dirname}/base64/test-base64.txt`, "utf8")
      }),
      test({
        source: {name: "raw", args: ["test"]},
        args: ["text/plain", "big5"],
        content: fs.readFileSync(`${__dirname}/base64/test-big5`),
        expect: fs.readFileSync(`${__dirname}/base64/test-big5-base64.txt`, "utf8")
      }),
      test({
        source: {name: "file", args: ["test.css"]},
        content: fs.readFileSync(`${__dirname}/base64/test.css`, "utf8"),
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
  const path = require("path");
  const {DEFAULT_RESOURCES} = require("../lib/default-resources");
  const {createResourceLoader} = require("inline-js-core/lib/resource");
  const resource = createResourceLoader();
  DEFAULT_RESOURCES.forEach(resource.add);
  
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
	
	it("cmd", t => {
    t.timeout(5000);
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
  
  it("resolve two paths", () => {
    const source = {name: "text", args: ["foo/bar.txt"]};
    const target = {name: "file", args: ["baz/bak.txt"]};
    resource.resolve(source, target);
    assert.equal(target.args[0], path.resolve("foo/baz/bak.txt"));
  });
});

describe("conf", () => {
  const path = require("path");
  const {findConfig, createConfigLocator} = require("../lib/conf");
  
  function test(file, expectedConfPath) {
    return findConfig(file)
      .then(result => {
        if (expectedConfPath) {
          assert.equal(result.confPath, path.resolve(expectedConfPath));
        } else {
          assert(!result);
        }
      });
  }
  
  it("find in current path", () => {
    return test(`${__dirname}/conf/test`, `${__dirname}/conf/.inline.js`);
  });
  
  it("find in ancestor", () => {
    return test(`${__dirname}/conf/b/test`, `${__dirname}/conf/.inline.js`);
  });
  
  it("don't go up through package root", () => {
    return test(`${__dirname}/conf/a/test`, null);
  });
  
  it("stop at root", () => {
    return test("/", null);
  });
  
  it("cache", () => {
    const {tryRequire, tryAccess} = require("../lib/conf");
    const _tryRequire = sinon.spy(tryRequire);
    const _tryAccess = sinon.spy(tryAccess);
    const conf = createConfigLocator({_tryRequire, _tryAccess});
    return Promise.all([
      conf.findConfig(`${__dirname}/conf/test`),
      conf.findConfig(`${__dirname}/conf/b/test`)
    ])
      .then(([conf1, conf2]) => {
        assert.equal(conf1, conf2);
        assert(_tryRequire.calledTwice);
        assert(_tryAccess.calledTwice);
      });
  });
});

describe("functional", () => {
  const {init} = require("..");
  
  for (const dir of fs.readdirSync(`${__dirname}/functional`)) {
    it(dir, () => {
      let content;
      return init({
        "<entry_file>": `${__dirname}/functional/${dir}/entry.txt`,
        _write: _content => {
          content = _content;
        }
      })
        .then(() => {
          assert.equal(content, fs.readFileSync(`${__dirname}/functional/${dir}/expect.txt`, "utf8"));
        });
    });
  }
  
  it("output file", () => {
    let filename, content;
    return init({
      "<entry_file>": `${__dirname}/functional/full-config/entry.txt`,
      "--out": "foo.txt",
      _outputFile: (_filename, _content) => {
        filename = _filename;
        content = _content;
      }
    })
      .then(() => {
        assert.equal(filename, "foo.txt");
        assert.equal(content, "  Hello I am bar");
      });
  });
  
  it("dry + out", () => {
    const _outputFile = sinon.spy();
    return init({
      "<entry_file>": `${__dirname}/functional/full-config/entry.txt`,
      "--out": "foo.txt",
      "--dry-run": true,
      _outputFile
    })
      .then(() => {
        assert(!_outputFile.called);
      });
  });
  
  it("dry + stdout", () => {
    const _write = sinon.spy();
    return init({
      "<entry_file>": `${__dirname}/functional/full-config/entry.txt`,
      "--dry-run": true,
      _write
    })
      .then(() => {
        assert(!_write.called);
      });
  });
});
