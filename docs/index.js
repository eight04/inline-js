//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

(function () {
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

var script = {
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

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "file-editor" }, [
    _c("input", {
      directives: [
        {
          name: "model",
          rawName: "v-model",
          value: _vm.editorName,
          expression: "editorName"
        }
      ],
      staticClass: "file-name",
      attrs: { type: "text" },
      domProps: { value: _vm.editorName },
      on: {
        input: function($event) {
          if ($event.target.composing) {
            return
          }
          _vm.editorName = $event.target.value;
        }
      }
    }),
    _vm._v(" "),
    _c(
      "button",
      {
        attrs: { type: "button" },
        on: {
          click: function($event) {
            return _vm.$emit("delete-file")
          }
        }
      },
      [_vm._v("Remove")]
    ),
    _vm._v(" "),
    _c("div", { staticClass: "editor-type" }, [
      _c("label", [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.editorType,
              expression: "editorType"
            }
          ],
          attrs: { type: "radio", value: "text" },
          domProps: { checked: _vm._q(_vm.editorType, "text") },
          on: {
            change: function($event) {
              _vm.editorType = "text";
            }
          }
        }),
        _vm._v("\n      Text\n    ")
      ]),
      _vm._v(" "),
      _c("label", [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.editorType,
              expression: "editorType"
            }
          ],
          attrs: { type: "radio", value: "binary" },
          domProps: { checked: _vm._q(_vm.editorType, "binary") },
          on: {
            change: function($event) {
              _vm.editorType = "binary";
            }
          }
        }),
        _vm._v("\n      Binary\n    ")
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "editor-content" }, [
      _c("textarea", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.type === "text",
            expression: "type === 'text'"
          },
          {
            name: "model",
            rawName: "v-model",
            value: _vm.textData,
            expression: "textData"
          }
        ],
        staticClass: "text-data",
        domProps: { value: _vm.textData },
        on: {
          input: function($event) {
            if ($event.target.composing) {
              return
            }
            _vm.textData = $event.target.value;
          }
        }
      }),
      _vm._v(" "),
      _c(
        "div",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.type === "binary",
              expression: "type === 'binary'"
            }
          ],
          staticClass: "binary-data",
          on: { drop: _vm.drop, dragover: _vm.dragover }
        },
        [
          _vm._v("\n      " + _vm._s(_vm.binaryDataStatus) + "\n      "),
          _vm.fileType.startsWith("image")
            ? _c("img", { attrs: { src: _vm.binaryData } })
            : _vm._e()
        ]
      )
    ])
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var FileEditor = normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

//

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
      worker.postMessage({requestId, files});
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

var script$1 = {
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
  components: {FileEditor}
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { id: "app" } }, [
    _c(
      "div",
      { staticClass: "file-system" },
      [
        _vm._l(_vm.files, function(file) {
          return _c(
            "FileEditor",
            _vm._b(
              {
                key: file.id,
                on: {
                  "file-update": function($event) {
                    return _vm.updateFile(file, $event)
                  },
                  "delete-file": function($event) {
                    return _vm.deleteFile(file)
                  }
                }
              },
              "FileEditor",
              file,
              false
            )
          )
        }),
        _vm._v(" "),
        _c(
          "button",
          {
            attrs: { type: "button" },
            on: {
              click: function($event) {
                return _vm.addFile()
              }
            }
          },
          [_vm._v("Add file")]
        )
      ],
      2
    ),
    _vm._v(" "),
    _c("div", { staticClass: "inliner" }, [
      _vm.compileError
        ? _c("div", { staticClass: "compile-error" }, [
            _vm._v(_vm._s(_vm.compileError))
          ])
        : _vm.compileResult
        ? _c("div", { staticClass: "compile-success" }, [
            _vm._v(
              "\n      Compiled in " +
                _vm._s(_vm.compileResult.timeout) +
                "ms.\n      \n      Dependency tree:\n      "
            ),
            _c("pre", [_vm._v(_vm._s(_vm.compileResult.dependency))])
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.compileResult
        ? _c("textarea", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.compileResult.content,
                expression: "compileResult.content"
              }
            ],
            staticClass: "compile-result",
            attrs: { readonly: "" },
            domProps: { value: _vm.compileResult.content },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.$set(_vm.compileResult, "content", $event.target.value);
              }
            }
          })
        : _vm._e()
    ])
  ])
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var App = normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    undefined,
    undefined
  );

/* global Vue */
new Vue({
  el: "#app",
  render: h => h(App)
});
})();
