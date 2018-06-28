<template>
  <div id="app">
    <FileSystem :files="files"></FileSystem>
    <InlineOutput :files="files"></InlineOutput>
  </div>
</template>

<script>
import FileSystem from "./FileSystem.vue";
import InlineOutput from "./InlineOutput.vue";

export default {
  data() {
    return {
      files: []
    }
  },
  mounted() {
    try {
      const params = new URLSearchParams(document.location.search.slice(1));
      this.files = JSON.parse(atob(params.get("files")));
    } catch (err) {
      this.files = [
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
      this.updateURL();
    }
  },
  methods: {
    updateURL() {
      const hash = btoa(JSON.stringify(this.files));
      history.replaceState({}, "", `?files=${hash}`);
    }
  },
  components: {FileSystem, InlineOutput}
};
</script>
