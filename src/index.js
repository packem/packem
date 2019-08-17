const { version } = require("../package.json");

module.exports = {
  version,
  utils: require("./utils"),
  NativeOps: require("../bin"),
  PackemPlugin: require("./PackemPlugin.js")
};
