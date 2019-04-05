// Utility functions for suites
const { PackemPlugin } = require("../");

// Creates an empty Packem plugin
exports.createBasePackemPlugin = () => class extends PackemPlugin {};

// Checks if a given plugin is a Packem plugin
exports.isPackemPlugin = plugin => plugin.constructor === "PackemPlugin";

// Returns a Packem config mock with the transformer field as the arguments
exports.overrideTransformers = transformer => ({
  ...global.CONFIG_MOCK,
  transformer
});
