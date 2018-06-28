/* eslint-env mocha */
const fs = require("fs");
const assert = require("assert");
const sinon = require("sinon");

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
