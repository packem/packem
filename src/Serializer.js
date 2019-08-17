const path = require("path");
const { emptyDirSync, writeFileSync } = require("fs-extra");

const es5Runtime = require("./runtimes/runtime.es5");
const cjsRuntime = require("./runtimes/runtime.cjs");

const pathSep = path.sep;

class Serializer {
  constructor(moduleGraph) {
    this.config = moduleGraph.config;
    this.dependencyMap = moduleGraph.dependencyMap;
    this.bundles = Object.create(null);

    this.rootInputIds = this.config.inputPaths.map(p =>
      path.basename(p, ".js")
    );

    // determine runtime
    switch (this.config.format) {
      case "cjs":
        this.runtime = cjsRuntime;
        break;
      case "iife":
      default:
        this.runtime = es5Runtime;
        break;
    }
  }

  // determine whether mod is one of the main/root inputs
  isRootInput(modId) {
    return this.rootInputIds.includes(modId);
  }

  // check if a commons bundle exists
  hasCommons() {
    return Object.keys(this.bundles).includes("commons");
  }

  pushModule(mod) {
    const bundleId = mod.bundle_id;

    let output = "\n";
    if (this.config.mode == "development")
      output += `// Source: "${mod.path}"\n`;

    switch (this.config.format) {
      case "iife":
        output += `_packemModules._mod_${mod.id} = `;
        output += `function(require, _packemImport, module, exports) {\n${
          mod.content
        }\n}`;
        break;
      case "cjs":
        if (mod.is_external || mod.is_builtin) {
          output += mod.content; // Preformatted in LC
        } else {
          output += `_packemModules._mod_${mod.id} = (module, exports) => {\n${
            mod.content
          }\n}\n`;
        }
        break;
    }

    if (!this.bundles[bundleId]) this.bundles[bundleId] = output;
    else this.bundles[bundleId] += output;
  }

  // Generate output files
  outputGraph() {
    // Clear output directory.
    emptyDirSync(this.config.outputDir);

    for (const bundleId in this.bundles) {
      const outputPath = this.config.outputPathFileStem
        ? this.config.outputDir +
          pathSep +
          this.config.outputPathFileStem +
          `.${bundleId}.js`
        : this.config.outputDir + pathSep + bundleId + ".js";

      // Write the input bundles first.
      if (this.isRootInput(bundleId))
        writeFileSync(
          outputPath,
          this.runtime(bundleId, this.hasCommons(), this.bundles[bundleId])
        );
      // Followed by dynamically imported bundles.
      else
        writeFileSync(
          outputPath,
          // @TODO Embed Packem's version.
          `/* Dynamic Bundle | Packem v0.1.0 (${new Date().toUTCString()}) */${
            this.bundles[bundleId]
          }`
        );
    }

//     // for development
//     writeFileSync(
//       this.config.outputDir + pathSep + "index.html",
//       `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <meta http-equiv="X-UA-Compatible" content="ie=edge" />
//     <title>Packem Playground</title>
//   </head>
//   <body>
//     <script src="./index.js"></script>
//   </body>
// </html>`
//     );
  }
}

module.exports = Serializer;
