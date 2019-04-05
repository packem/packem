// All tests reside in the `test` directory

const { defaults } = require("jest-config");

module.exports = {
  verbose: true,
  maxConcurrency: 4,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "js"],
  globals: {
    CONFIG_MOCK: {
      // Necessary needed
      root: "./mock/index.js",
      output: "./mock/dist/"
    }
  }
};
