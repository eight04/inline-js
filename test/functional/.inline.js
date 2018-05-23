const fs = require("fs");

module.exports = {
  shortcuts: [{
    name: "my-shortcut",
    expand: "foo.txt|my-transform"
  }],
  transforms: [{
    name: "my-transform",
    transform(ctx, content) {
      return `Hello ${content}`;
    }
  }],
  resources: [{
    name: "my-resource",
    read(source, target) {
      if (target.args[0] === "bar.txt") {
        return fs.readFileSync(`${__dirname}/bar.txt`, "utf8");
      }
      throw new Error("Unknown file");
    }
  }]
};
