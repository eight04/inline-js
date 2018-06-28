function getDataURL(e){return new Promise((t,i)=>{const n=new FileReader;n.onload=(e=>{t(e.target.result)}),n.onerror=i,n.readAsDataURL(e)})}var script={props:{id:Number,name:String,type:String,data:String},data(){return{textData:"text"===this.type?this.data:"",binaryData:"binary"===this.type?this.data:"",readingFile:!1}},mounted(){for(const e of["name","type"])this.$watch(e,()=>this.$emit("fileUpdate",this.id,e,this[e]));for(const e of["textData","binaryData"])this.$watch(e,()=>{"text"===this.file.type?this.$emit("fileUpdate",this.id,"data",this.textData):"binary"===this.file.type&&this.$emit("fileUpdate",this.id,"data",this.binaryData)})},computed:{fileType(){if(!this.binaryData)return"no data";const e=this.binaryData.match(/^data:(.*?)[,;]/);return e&&e[1]?e[1]:"unknown type"}},methods:{drop(e){e.preventDefault();const t=e.dataTransfer.files[0];t&&(this.readingFile=!0,getDataURL(t).then(e=>{this.readingFile=!1,this.binaryData=e}))},dragover(e){e.preventDefault()}}};const __vue_script__=script;var __vue_render__=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"file-editor"},[i("input",{directives:[{name:"model",rawName:"v-model",value:e.name,expression:"name"}],staticClass:"file-name",attrs:{type:"text"},domProps:{value:e.name},on:{input:function(t){t.target.composing||(e.name=t.target.value)}}}),e._v(" "),i("button",{attrs:{type:"button"},on:{click:function(t){e.$emit("deleteFile",e.id)}}},[e._v("Remove")]),e._v(" "),i("label",[i("input",{directives:[{name:"model",rawName:"v-model",value:e.type,expression:"type"}],attrs:{type:"radio",value:"text"},domProps:{checked:e._q(e.type,"text")},on:{change:function(t){e.type="text"}}}),e._v("\n    Text\n  ")]),e._v(" "),i("label",[i("input",{directives:[{name:"model",rawName:"v-model",value:e.type,expression:"type"}],attrs:{type:"radio",value:"binary"},domProps:{checked:e._q(e.type,"binary")},on:{change:function(t){e.type="binary"}}}),e._v("\n    Binary\n  ")]),e._v(" "),i("div",{directives:[{name:"show",rawName:"v-show",value:"text"===e.file.type,expression:"file.type === 'text'"}]},[i("textarea",{directives:[{name:"model",rawName:"v-model",value:e.textData,expression:"textData"}],domProps:{value:e.textData},on:{input:function(t){t.target.composing||(e.textData=t.target.value)}}})]),e._v(" "),i("div",{directives:[{name:"show",rawName:"v-show",value:"binary"===e.file.type,expression:"file.type === 'binary'"}],on:{drop:e.drop,dragover:e.dragover}},[e.readingFile?i("div",[e._v("Reading the file...")]):e.binaryData?i("div",[e._v("\n      "+e._s(e.fileType)+"\n      "),e.fileType.startsWith("image")?i("img",{attrs:{src:e.binaryData}}):e._e()]):i("div",[e._v("Drop your file here.")])])])},__vue_staticRenderFns__=[];__vue_render__._withStripped=!0;const __vue_inject_styles__=void 0,__vue_scope_id__=void 0,__vue_module_identifier__=void 0,__vue_is_functional_template__=!1;function __vue_normalize__(e,t,i,n,a,s,r,o){const d=("function"==typeof i?i.options:i)||{};return d.__file="D:\\Dev\\inline-js\\src\\FileEditor.vue",d.render||(d.render=e.render,d.staticRenderFns=e.staticRenderFns,d._compiled=!0,a&&(d.functional=!0)),d._scopeId=n,d}function __vue_create_injector__(){const e=document.head||document.getElementsByTagName("head")[0],t=__vue_create_injector__.styles||(__vue_create_injector__.styles={}),i="undefined"!=typeof navigator&&/msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());return function(n,a){if(document.querySelector('style[data-vue-ssr-id~="'+n+'"]'))return;const s=i?a.media||"default":n,r=t[s]||(t[s]={ids:[],parts:[],element:void 0});if(!r.ids.includes(n)){let t=a.source,o=r.ids.length;if(r.ids.push(n),i&&(r.element=r.element||document.querySelector("style[data-group="+s+"]")),!r.element){const t=r.element=document.createElement("style");t.type="text/css",a.media&&t.setAttribute("media",a.media),i&&(t.setAttribute("data-group",s),t.setAttribute("data-next-index","0")),e.appendChild(t)}if(i&&(o=parseInt(r.element.getAttribute("data-next-index")),r.element.setAttribute("data-next-index",o+1)),r.element.styleSheet)r.parts.push(t),r.element.styleSheet.cssText=r.parts.filter(Boolean).join("\n");else{const e=document.createTextNode(t),i=r.element.childNodes;i[o]&&r.element.removeChild(i[o]),i.length?r.element.insertBefore(e,i[o]):r.element.appendChild(e)}}}}var FileEditor=__vue_normalize__({render:__vue_render__,staticRenderFns:__vue_staticRenderFns__},void 0,__vue_script__,void 0,!1,void 0,__vue_create_injector__,void 0),script$1={data:()=>({files:[],id:0,compileResult:null}),mounted(){let e,t=!1;try{const i=document.location.hash.slice(2);e=JSON.parse(atob(i))}catch(i){e=[{type:"text",name:"entry",data:"$inline('foo.txt')"},{type:"text",name:"foo.txt",data:"Lorem ipsum dolor."}],t=!0}for(const t of e)this.addFile(t);t&&this.updateURL(),this.compile()},methods:{fileUpdate(e,t,i){const n=this.files.find(t=>t.id===e);n&&(n[t]=i,this.updateURL())},updateURL(){const e=this.files.map(e=>{const t=Object.assign({},e);return delete t.id,t}),t=btoa(JSON.stringify(e));history.replaceState({},"",`#!${t}`)},getNewName(){const e=new Set(this.files.map(e=>e.name));let t="file",i=1;for(;e.has(t);)t="file"+i++;return t},addFile({name:e=this.getNewName(),data:t="",type:i="text"}={}){this.files.push({id:this.id++,name:e,type:i,data:t})},deleteFile(e){const t=this.files.findIndex(t=>t.id===e);t>=0&&this.files.splice(t,1)},compile(){}},components:{FileEditor:FileEditor}};const __vue_script__$1=script$1;var __vue_render__$1=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{attrs:{id:"app"},on:{"file-update":e.fileUpdate,"delete-file":e.deleteFile}},[i("div",{staticClass:"file-system"},[e._l(e.files,function(t){return i("FileEditor",e._b({key:t.id},"FileEditor",t,!1))}),e._v(" "),i("button",{attrs:{type:"button"},on:{click:function(t){e.addFile()}}},[e._v("Add file")])],2),e._v(" "),i("div",{staticClass:"inliner"},[e.compileResult&&e.compileResult.error?i("div",{staticClass:"compile-error"},[e._v(e._s(e.compileResult.error))]):e.compileResult?i("div",{staticClass:"compile-success"},[e._v("\n      Compiled in "+e._s(e.compileResult.timeout)+"ms.\n      \n      Dependency tree:\n      "),i("pre",[e._v(e._s(e.compileResult.dependency))])]):e._e(),e._v(" "),i("textarea",{directives:[{name:"model",rawName:"v-model",value:e.compileResult.content,expression:"compileResult.content"}],staticClass:"compile-result",attrs:{readonly:""},domProps:{value:e.compileResult.content},on:{input:function(t){t.target.composing||e.$set(e.compileResult,"content",t.target.value)}}})])])},__vue_staticRenderFns__$1=[];__vue_render__$1._withStripped=!0;const __vue_inject_styles__$1=void 0,__vue_scope_id__$1=void 0,__vue_module_identifier__$1=void 0,__vue_is_functional_template__$1=!1;function __vue_normalize__$1(e,t,i,n,a,s,r,o){const d=("function"==typeof i?i.options:i)||{};return d.__file="D:\\Dev\\inline-js\\src\\App.vue",d.render||(d.render=e.render,d.staticRenderFns=e.staticRenderFns,d._compiled=!0,a&&(d.functional=!0)),d._scopeId=n,d}function __vue_create_injector__$1(){const e=document.head||document.getElementsByTagName("head")[0],t=__vue_create_injector__$1.styles||(__vue_create_injector__$1.styles={}),i="undefined"!=typeof navigator&&/msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());return function(n,a){if(document.querySelector('style[data-vue-ssr-id~="'+n+'"]'))return;const s=i?a.media||"default":n,r=t[s]||(t[s]={ids:[],parts:[],element:void 0});if(!r.ids.includes(n)){let t=a.source,o=r.ids.length;if(r.ids.push(n),i&&(r.element=r.element||document.querySelector("style[data-group="+s+"]")),!r.element){const t=r.element=document.createElement("style");t.type="text/css",a.media&&t.setAttribute("media",a.media),i&&(t.setAttribute("data-group",s),t.setAttribute("data-next-index","0")),e.appendChild(t)}if(i&&(o=parseInt(r.element.getAttribute("data-next-index")),r.element.setAttribute("data-next-index",o+1)),r.element.styleSheet)r.parts.push(t),r.element.styleSheet.cssText=r.parts.filter(Boolean).join("\n");else{const e=document.createTextNode(t),i=r.element.childNodes;i[o]&&r.element.removeChild(i[o]),i.length?r.element.insertBefore(e,i[o]):r.element.appendChild(e)}}}}var App=__vue_normalize__$1({render:__vue_render__$1,staticRenderFns:__vue_staticRenderFns__$1},void 0,__vue_script__$1,void 0,!1,void 0,__vue_create_injector__$1,void 0);new Vue({el:"#app",render:e=>e(App)});
//# sourceMappingURL=index.js.map
