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
//
//

function getDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);  });
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
      textData: this.type === "text" ? this.data : "",
      binaryData: this.type === "binary" ? this.data : "",
      readingFile: false
    }
  },
  mounted() {
    for (const prop of ["name", "type"]) {
      this.$watch(prop, () => this.$emit("fileUpdate", this.id, prop, this[prop]));
    }
    for (const prop of ["textData", "binaryData"]) {
      this.$watch(prop, () => {
        if (this.file.type === "text") {
          this.$emit("fileUpdate", this.id, "data", this.textData);
        } else if (this.file.type === "binary") {
          this.$emit("fileUpdate", this.id, "data", this.binaryData);
        }
      });
    }
  },
  computed: {
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
          value: _vm.name,
          expression: "name"
        }
      ],
      staticClass: "file-name",
      attrs: { type: "text" },
      domProps: { value: _vm.name },
      on: {
        input: function($event) {
          if ($event.target.composing) {
            return
          }
          _vm.name = $event.target.value;
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
            _vm.$emit("deleteFile", _vm.id);
          }
        }
      },
      [_vm._v("Remove")]
    ),
    _vm._v(" "),
    _c("label", [
      _c("input", {
        directives: [
          {
            name: "model",
            rawName: "v-model",
            value: _vm.type,
            expression: "type"
          }
        ],
        attrs: { type: "radio", value: "text" },
        domProps: { checked: _vm._q(_vm.type, "text") },
        on: {
          change: function($event) {
            _vm.type = "text";
          }
        }
      }),
      _vm._v("\n    Text\n  ")
    ]),
    _vm._v(" "),
    _c("label", [
      _c("input", {
        directives: [
          {
            name: "model",
            rawName: "v-model",
            value: _vm.type,
            expression: "type"
          }
        ],
        attrs: { type: "radio", value: "binary" },
        domProps: { checked: _vm._q(_vm.type, "binary") },
        on: {
          change: function($event) {
            _vm.type = "binary";
          }
        }
      }),
      _vm._v("\n    Binary\n  ")
    ]),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.file.type === "text",
            expression: "file.type === 'text'"
          }
        ]
      },
      [
        _c("textarea", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.textData,
              expression: "textData"
            }
          ],
          domProps: { value: _vm.textData },
          on: {
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.textData = $event.target.value;
            }
          }
        })
      ]
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.file.type === "binary",
            expression: "file.type === 'binary'"
          }
        ],
        on: { drop: _vm.drop, dragover: _vm.dragover }
      },
      [
        _vm.readingFile
          ? _c("div", [_vm._v("Reading the file...")])
          : !_vm.binaryData
            ? _c("div", [_vm._v("Drop your file here.")])
            : _c("div", [
                _vm._v("\n      " + _vm._s(_vm.fileType) + "\n      "),
                _vm.fileType.startsWith("image")
                  ? _c("img", { attrs: { src: _vm.binaryData } })
                  : _vm._e()
              ])
      ]
    )
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
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    {
      component.__file = "D:\\Dev\\inline-js\\src\\FileEditor.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  function __vue_create_injector__() {
    const head = document.head || document.getElementsByTagName('head')[0];
    const styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
    const isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return // SSR styles are present.

      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        let code = css.source;
        let index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          const el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) el.setAttribute('media', css.media);
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          const textNode = document.createTextNode(code);
          const nodes = style.element.childNodes;
          if (nodes[index]) style.element.removeChild(nodes[index]);
          if (nodes.length) style.element.insertBefore(textNode, nodes[index]);
          else style.element.appendChild(textNode);
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var FileEditor = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    __vue_create_injector__,
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
          data: "$inline('foo.txt')"
        },
        {
          type: "text",
          name: "foo.txt",
          data: "Lorem ipsum dolor."
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
    fileUpdate(id, prop, value) {
      const file = this.files.find(f => f.id === id);
      if (!file) {
        return;
      }
      file[prop] = value;
      this.updateURL();
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
    deleteFile(id) {
      const index = this.files.findIndex(f => f.id === id);
      if (index >= 0) {
        this.files.splice(index, 1);
      }
    },
    compile() {
      if (!this.compiling) {
        this.compiling = this.worker.compile(this.files)
          .then(result => {
            this.compileResult = result;
            this.compiling = null;
          });
        return;
      }
      if (!this.compileNext) {
        this.compileNext = this.compiling
          .then(() => {
            this.compiling = this.compileNext;
            this.compileNext = null;
            return this.worker.compile(this.files);
          })
          .then(result => {
            this.compileResult = result;
            this.compiling = null;
          });
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
  return _c(
    "div",
    {
      attrs: { id: "app" },
      on: { "file-update": _vm.fileUpdate, "delete-file": _vm.deleteFile }
    },
    [
      _c(
        "div",
        { staticClass: "file-system" },
        [
          _vm._l(_vm.files, function(file) {
            return _c(
              "FileEditor",
              _vm._b({ key: file.id }, "FileEditor", file, false)
            )
          }),
          _vm._v(" "),
          _c(
            "button",
            {
              attrs: { type: "button" },
              on: {
                click: function($event) {
                  _vm.addFile();
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
        _vm.compileResult && _vm.compileResult.error
          ? _c("div", { staticClass: "compile-error" }, [
              _vm._v(_vm._s(_vm.compileResult.error))
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
        _c("textarea", {
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
      ])
    ]
  )
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
  /* component normalizer */
  function __vue_normalize__$1(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    {
      component.__file = "D:\\Dev\\inline-js\\src\\App.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  function __vue_create_injector__$1() {
    const head = document.head || document.getElementsByTagName('head')[0];
    const styles = __vue_create_injector__$1.styles || (__vue_create_injector__$1.styles = {});
    const isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return // SSR styles are present.

      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        let code = css.source;
        let index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          const el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) el.setAttribute('media', css.media);
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          const textNode = document.createTextNode(code);
          const nodes = style.element.childNodes;
          if (nodes[index]) style.element.removeChild(nodes[index]);
          if (nodes.length) style.element.insertBefore(textNode, nodes[index]);
          else style.element.appendChild(textNode);
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var App = __vue_normalize__$1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    __vue_create_injector__$1,
    undefined
  );

/* global Vue */
new Vue({
  el: "#app",
  render: h => h(App)
});
//# sourceMappingURL=index.js.map
