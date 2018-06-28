<template>
  <div id="app" @file-update="fileUpdate" @delete-file="deleteFile">
    <div class="file-system">
      <FileEditor
        v-for="file in files"
        :key="file.id"
        v-bind="file"
      ></FileEditor>
      <button @click="addFile()" type="button">Add file</button>
    </div>
    <div class="inliner">
      <div class="compile-error" v-if="compileResult && compileResult.error">{{compileResult.error}}</div>
      <div class="compile-success" v-else-if="compileResult">
        Compiled in {{compileResult.timeout}}ms.
        
        Dependency tree:
        <pre>{{compileResult.dependency}}</pre>
      </div>
      <textarea class="compile-result" readonly v-model="compileResult.content"></textarea>
    </div>
  </div>
</template>

<script>
import FileEditor from "./FileEditor.vue";

export default {
  data() {
    return {
      files: [],
      id: 0,
      compileResult: null
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
      // ...
    }
  },
  components: {FileEditor}
};
</script>
