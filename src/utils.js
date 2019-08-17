const { version: PACKEM_VERSION } = require("../package.json");

module.exports = {
  /**
   * Escapes a string that contains single or double quotes.
   * Wrap the result in a double quoted string for compat.
   *
   * @param {string} string
   */
  escapeTextBasedImport(string) {
    return string.replace(/(\r\n|\r|\n)/g, `\\n`).replace(/\"/g, '\\"');
  },
  embedPackemMetaInfo(bundleId = "") {
    return `/* ${bundleId &&
      bundleId +
        " | "} Packem v${PACKEM_VERSION} (${new Date().toUTCString()}) */`;
  },
  print(...args) {
    console.log(...args);
  },
  die(...args) {
    console.log(...args);
    process.exit(0);
  }
};
