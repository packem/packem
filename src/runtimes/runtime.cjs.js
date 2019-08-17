const { embedPackemMetaInfo } = require("../utils")

// @TODO Add fetch polyfill only when necessary.
// @TODO Embed Packem's current version into the generated bundles
// to keep track of any breakages caused in different Packem versions.
module.exports = (
  bundleId,
  hasCommons,
  bundleContent
) => `${embedPackemMetaInfo(bundleId)}
"use strict";

const _packemModules = {};
${bundleContent}
const packemExternalRequire = require;
require = mod => {
  let module = { exports: {} };
  _packemModules[mod](module, module.exports);
  return module.exports.default || module.exports;
};
module.exports = require("_mod_${bundleId}");
`;
