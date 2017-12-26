module.exports = {
  resources: [{
    name: "resourceConfigured",
    read: () => "resourceOK"
  }],
  transforms: [{
    name: "transformConfigured",
    transform: () => "transformOK"
  }],
  shortcuts: [{
    name: "shortcutConfigured",
    expand: () => "shortcutOK"
  }]
};
