(function () {
'use strict';
function getDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

var script$1 = {
  props: {
    id: Number,
    name: String,
    type: String,
    data: String
  },
  data() {
    return {
      editorName: this.name,
      editorType: this.type,
      textData: this.type === "text" ? this.data : "",
      binaryData: this.type === "binary" ? this.data : "",
      readingFile: false
    }
  },
  mounted() {
    for (const [prop, targetProp] of [["editorName", "name"], ["editorType", "type"]]) {
      this.$watch(prop, () => {
        this.$emit("file-update", {
          prop: targetProp,
          data: this[prop]
        });
        if (prop === "editorType") {
          this.$emit("file-update", {
            prop: "data",
            data: this.editorType === "text" ? this.textData : this.binaryData
          });
        }
      });
    }
    for (const prop of ["textData", "binaryData"]) {
      this.$watch(prop, () => {
        if (this.type === "text") {
          this.$emit("file-update", {
            prop: "data",
            data: this.textData
          });
        } else if (this.type === "binary") {
          this.$emit("file-update", {
            prop: "data",
            data: this.binaryData
          });
        }
      });
    }
  },
  computed: {
    binaryDataStatus() {
      if (this.readingFile) {
        return "Reading the file...";
      }
      if (!this.binaryData) {
        return "Drop your file here";
      }
      return this.fileType;
    },
    fileType() {
      if (!this.binaryData) {
        return "no data";
      }
      const match = this.binaryData.match(/^data:(.*?)[,;]/);
      if (!match || !match[1]) {
        return "unknown type";
      }
      return match[1];
    }
  },
  methods: {
    drop(e) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) {
        return;
      }
      this.readingFile = true;
      getDataURL(file)
        .then(binary => {
          this.readingFile = false;
          this.binaryData = binary;
        });
    },
    dragover(e) {
      e.preventDefault();
    }
  }
};

const _hoisted_1$1 = { class: "file-editor" };
const _hoisted_2$1 = { class: "editor-type" };
const _hoisted_3$1 = { class: "editor-content" };
const _hoisted_4$1 = ["src"];

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (Vue.openBlock(), Vue.createElementBlock("div", _hoisted_1$1, [
    Vue.withDirectives(Vue.createElementVNode("input", {
      type: "text",
      class: "file-name",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($data.editorName) = $event))
    }, null, 512 /* NEED_PATCH */), [
      [Vue.vModelText, $data.editorName]
    ]),
    Vue.createElementVNode("button", {
      type: "button",
      onClick: _cache[1] || (_cache[1] = $event => (_ctx.$emit('delete-file')))
    }, "Remove"),
    Vue.createElementVNode("div", _hoisted_2$1, [
      Vue.createElementVNode("label", null, [
        Vue.withDirectives(Vue.createElementVNode("input", {
          type: "radio",
          value: "text",
          "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => (($data.editorType) = $event))
        }, null, 512 /* NEED_PATCH */), [
          [Vue.vModelRadio, $data.editorType]
        ]),
        _cache[7] || (_cache[7] = Vue.createTextVNode(" Text ", -1 /* CACHED */))
      ]),
      Vue.createElementVNode("label", null, [
        Vue.withDirectives(Vue.createElementVNode("input", {
          type: "radio",
          value: "binary",
          "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => (($data.editorType) = $event))
        }, null, 512 /* NEED_PATCH */), [
          [Vue.vModelRadio, $data.editorType]
        ]),
        _cache[8] || (_cache[8] = Vue.createTextVNode(" Binary ", -1 /* CACHED */))
      ])
    ]),
    Vue.createElementVNode("div", _hoisted_3$1, [
      Vue.withDirectives(Vue.createElementVNode("textarea", {
        class: "text-data",
        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (($data.textData) = $event))
      }, null, 512 /* NEED_PATCH */), [
        [Vue.vShow, $props.type === 'text'],
        [Vue.vModelText, $data.textData]
      ]),
      Vue.withDirectives(Vue.createElementVNode("div", {
        class: "binary-data",
        onDrop: _cache[5] || (_cache[5] = (...args) => ($options.drop && $options.drop(...args))),
        onDragover: _cache[6] || (_cache[6] = (...args) => ($options.dragover && $options.dragover(...args)))
      }, [
        Vue.createTextVNode(Vue.toDisplayString($options.binaryDataStatus) + " ", 1 /* TEXT */),
        ($options.fileType.startsWith('image'))
          ? (Vue.openBlock(), Vue.createElementBlock("img", {
              key: 0,
              src: $data.binaryData
            }, null, 8 /* PROPS */, _hoisted_4$1))
          : Vue.createCommentVNode("v-if", true)
      ], 544 /* NEED_HYDRATION, NEED_PATCH */), [
        [Vue.vShow, $props.type === 'binary']
      ])
    ])
  ]))
}

script$1.render = render$1;
script$1.__file = "src/FileEditor.vue";

function createCompileWorker() {
  let worker;
  let id = 0;
  const waitForResponse = new Map;
  return {compile};
  
  function compile(files) {
    if (!worker) {
      worker = new Worker("worker.js");
      worker.addEventListener("error", onError);
      worker.addEventListener("message", onMessage);
    }
    return new Promise((resolve, reject) => {
      const requestId = id++;
      worker.postMessage({requestId, files: Vue.toRaw(files)});
      waitForResponse.set(requestId, {resolve, reject});
    });
  }
  
  function onError(err) {
    for (const {reject} of waitForResponse.values()) {
      reject(err);
    }
    waitForResponse.clear();
  }
  
  function onMessage(e) {
    if (e.data.error) {
      waitForResponse.get(e.data.requestId).reject(e.data.data);
    } else {
      waitForResponse.get(e.data.requestId).resolve(e.data.data);
    }
    waitForResponse.delete(e.data.requestId);
  }
}

var script = {
  data() {
    return {
      files: [],
      id: 0,
      compileResult: null,
      compileError: null,
      compiling: null,
      compileNext: null,
      worker: createCompileWorker()
    }
  },
  mounted() {
    let files;
    let needUpdate = false;
    try {
      const hash = document.location.hash.slice(2);
      files = JSON.parse(atob(hash));
    } catch (err) {
      files = [
        {
          type: "text",
          name: "entry",
          data: "$inline('foo.txt') $inline('bar.txt')!"
        },
        {
          type: "text",
          name: "foo.txt",
          data: "Hello"
        },
        {
          type: "text",
          name: "bar.txt",
          data: "inline-js"
        }
      ];
      needUpdate = true;
    }
    for (const file of files) {
      this.addFile(file);
    }
    if (needUpdate) {
      this.updateURL();
    }
    this.compile();
  },
  methods: {
    updateFile(file, e) {
      file[e.prop] = e.data;
      this.updateURL();
      this.compile();
    },
    updateURL() {
      const files = this.files.map(f => {
        const newFile = Object.assign({}, f);
        delete newFile.id;
        return newFile;
      });
      const hash = btoa(JSON.stringify(files));
      history.replaceState({}, "", `#!${hash}`);
    },
    getNewName() {
      const names = new Set(this.files.map(f => f.name));
      let name = "file";
      let i = 1;
      while (names.has(name)) {
        name = "file" + i++;
      }
      return name;
    },
    addFile({name = this.getNewName(), data = "", type = "text"} = {}) {
      this.files.push({
        id: this.id++,
        name,
        type,
        data
      });
    },
    deleteFile(file) {
      const index = this.files.indexOf(file);
      this.files.splice(index, 1);
    },
    compile() {
      const drawResult = result => {
        this.compiling = null;
        this.compileResult = result;
        this.compileError = null;
      };
      const drawError = err => {
        this.compiling = null;
        this.compileResult = null;
        this.compileError = err;
        console.error(err);
      };
      if (!this.compiling) {
        this.compiling = this.worker.compile(this.files)
          .then(drawResult, drawError);
        return;
      }
      if (!this.compileNext) {
        this.compileNext = this.compiling
          .then(() => {
            this.compiling = this.compileNext;
            this.compileNext = null;
            return this.worker.compile(this.files);
          })
          .then(drawResult, drawError);
      }
    }
  },
  components: {FileEditor: script$1}
};

const _hoisted_1 = { id: "app" };
const _hoisted_2 = { class: "file-system" };
const _hoisted_3 = { class: "inliner" };
const _hoisted_4 = {
  key: 0,
  class: "compile-error"
};
const _hoisted_5 = {
  key: 1,
  class: "compile-success"
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FileEditor = Vue.resolveComponent("FileEditor");

  return (Vue.openBlock(), Vue.createElementBlock("div", _hoisted_1, [
    Vue.createElementVNode("div", _hoisted_2, [
      (Vue.openBlock(true), Vue.createElementBlock(Vue.Fragment, null, Vue.renderList($data.files, (file) => {
        return (Vue.openBlock(), Vue.createBlock(_component_FileEditor, Vue.mergeProps({
          key: file.id
        }, { ref_for: true }, file, {
          onFileUpdate: $event => ($options.updateFile(file, $event)),
          onDeleteFile: $event => ($options.deleteFile(file))
        }), null, 16 /* FULL_PROPS */, ["onFileUpdate", "onDeleteFile"]))
      }), 128 /* KEYED_FRAGMENT */)),
      Vue.createElementVNode("button", {
        onClick: _cache[0] || (_cache[0] = $event => ($options.addFile())),
        type: "button"
      }, "Add file")
    ]),
    Vue.createElementVNode("div", _hoisted_3, [
      ($data.compileError)
        ? (Vue.openBlock(), Vue.createElementBlock("div", _hoisted_4, Vue.toDisplayString($data.compileError), 1 /* TEXT */))
        : ($data.compileResult)
          ? (Vue.openBlock(), Vue.createElementBlock("div", _hoisted_5, [
              Vue.createTextVNode(" Compiled in " + Vue.toDisplayString($data.compileResult.timeout) + "ms. Dependency tree: ", 1 /* TEXT */),
              Vue.createElementVNode("pre", null, Vue.toDisplayString($data.compileResult.dependency), 1 /* TEXT */)
            ]))
          : Vue.createCommentVNode("v-if", true),
      ($data.compileResult)
        ? Vue.withDirectives((Vue.openBlock(), Vue.createElementBlock("textarea", {
            key: 2,
            class: "compile-result",
            readonly: "",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($data.compileResult.content) = $event))
          }, null, 512 /* NEED_PATCH */)), [
            [Vue.vModelText, $data.compileResult.content]
          ])
        : Vue.createCommentVNode("v-if", true)
    ])
  ]))
}

script.render = render;
script.__file = "src/App.vue";

/* global Vue */


Vue.createApp(script).mount("#app");
})();
