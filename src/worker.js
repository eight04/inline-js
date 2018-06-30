/* eslint-env browser */
const {writeFileSync, unlinkSync} = require("fs");
const dataUriToBuffer = require("data-uri-to-buffer");
const {createDefaultInliner, buildDependency} = require("..");

async function withFiles(files, onReady) {
  try {
    files.forEach(file => {
      if (file.type === "text") {
        writeFileSync(file.name, file.data, {flag: "wx"});
      } else {
        writeFileSync(file.name, dataUriToBuffer(file.data), {flag: "wx"});
      }
    });
    return await onReady();
  } finally {
    files.forEach(file => {
      try {
        unlinkSync(file.name);
      } catch (err) {
        // pass
      }
    });
  }
}

self.addEventListener("message", e => {
  const ts = performance.now();
  Promise.resolve()
    .then(() => withFiles(
      e.data.files,
      () => {
        const inliner = createDefaultInliner();
        return inliner.inline({name: "text", args: [e.data.files[0].name]});
      }
    ))
    .then(({content, children}) => ({
      requestId: e.data.requestId,
      error: false,
      data: {
        content,
        dependency: buildDependency(e.data.files[0].name, children),
        timeout: performance.now() - ts
      }
    }))
    .catch(err => ({
      requestId: e.data.requestId,
      error: true,
      data: err.message
    }))
    .then(message => self.postMessage(message));
});
