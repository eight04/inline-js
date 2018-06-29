/* eslint-env browser */
import fs from "fs";
import dataUriToBuffer from "data-uri-to-buffer";
import {createDefaultInliner, buildDependency} from "..";

async function withFiles(files, onReady) {
  try {
    files.forEach(file => {
      if (file.type === "text") {
        fs.writeFileSync(file.name, file.data, {flag: "wx"});
      } else {
        fs.writeFileSync(file.name, dataUriToBuffer(file.data), {flag: "wx"});
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
