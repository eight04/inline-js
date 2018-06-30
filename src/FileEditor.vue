<template>
  <div class="file-editor">
    <input type="text" class="file-name" v-model="editorName">
    <button type="button" @click="$emit('delete-file')">Remove</button>
    <div class="editor-type">
      <label>
        <input type="radio" value="text" v-model="editorType">
        Text
      </label>
      <label>
        <input type="radio" value="binary" v-model="editorType">
        Binary
      </label>
    </div>
    <div class="editor-content">
      <textarea class="text-data" v-show="type === 'text'" v-model="textData"></textarea>
      <div class="binary-data" v-show="type === 'binary'" @drop="drop" @dragover="dragover">
        {{binaryDataStatus}}
        <img :src="binaryData" v-if="fileType.startsWith('image')">
      </div>
    </div>
  </div>
</template>

<script>
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

export default {
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
}
</script>
