const { transformSync } = require("@babel/core");
const chalk = require("chalk")
const logger = require("./logger");

// @TODO use multi-threaded transform
class Transformer {
  constructor(moduleGraph) {
    this.moduleGraph = moduleGraph;
    this.babelTransformOptions = moduleGraph.config.transformer && {
      presets: moduleGraph.config.transformer.babelPresets || [],
      plugins: moduleGraph.config.transformer.babelPlugins || []
    };

    if (moduleGraph.config.format == "cjs") {
      // remove @babel/preset-env if present
      this.babelTransformOptions.presets = this.babelTransformOptions.presets.filter(
        p => p !== "@babel/preset-env"
      );
      // auto configure @babel/preset-env for cjs
      this.babelTransformOptions.presets.push([
        "@babel/preset-env",
        {
          targets: {
            node: true
          },
          modules: "commonjs"
        }
      ]);
    }
  }

  transformGraph() {
    for (const [/** skipped modId */, mod] of this.moduleGraph.modules.entries()) {
      /**
       * @event onBeforeTransform
       *
       * Just before the transformer kicks in, this event
       * is fired.
       */
      global.PluginEvents.dispatch("onBeforeTransform", mod);

      const modExt = mod.extension;

      if (modExt === "js") {
        const { code: transformedContent } = transformSync(
          mod.content,
          this.babelTransformOptions
        );

        mod.content = transformedContent;
      } else if (modExt) {
        /**
         * @event onModuleBundle
         *
         * This event is fired after the source is bundled. It doesn't mark
         * the end of the bundling cycle.
         */
        const transformedContent = global.PluginEvents.dispatch(
          "onModuleBundle",
          mod
        );

        if (!transformedContent)
          logger.fatal(
            "UnsupportedFileTypeError",
            `${chalk.bold.white`@packem/core`} does not support ${chalk.yellow(
              `\`.${modExt}\``
            )} file types. Try out ${chalk.bold.white`@packem/file-plugin`}.`,
            `@ ${chalk.grey(mod.path)}`
          );

        mod.content = transformedContent;
      }

      this.moduleGraph.serializer.pushModule(mod);

      /**
       * @event onAfterTransform
       *
       * This event is fired after the source code is transformed.
       */
      global.PluginEvents.dispatch("onAfterTransform", mod);
    }
  }
}

module.exports = Transformer;
