module.exports = {
  /**
   * Escapes a string that contains single or double quotes.
   * Wrap the result in a double quoted string.
   * 
   * @param {*} string 
   */
  escapeTextBasedImport(string) {
    return string.replace(/(\r\n|\r|\n)/g, `\\n`).replace(/\"/g, '\\"');
  }
};
