<template>
  <div class="file-editor">
    <input type="text" class="file-name" v-model="name">
    <button type="button" @click="$emit('deleteFile', id)">Remove</button>
    <label>
      <input type="radio" value="text" v-model="type">
      Text
    </label>
    <label>
      <input type="radio" value="binary" v-model="type">
      Binary
    </label>
    <div v-show="file.type === 'text'">
      <textarea v-model="textData"></textarea>
    </div>
    <div v-show="file.type === 'binary'" @drop="drop" @dragover="dragover">
      <div v-if="readingFile">Reading the file...</div>
      <div v-else-if="!binaryData">Drop your file here.</div>
      <div v-else>
        {{fileType}}
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
    reader.readAsDataURL(file);2
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
}
</script>
