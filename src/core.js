const path = require("path");
const {
  existsSync,
  emptyDirSync,
  readFileSync,
  writeFileSync
} = require("fs-extra");

const ora = require("ora");
const chalk = require("chalk");
const yaml = require("js-yaml");
const { transformSync } = require("@babel/core");
const workerFarm = require("worker-farm");

const spinner = ora("Initializing bundling cycle...").start();

const PluginEventsDispatcher = require("./PluginEventsDispatcher");
const bundleTemp = require("./bundleTemp");

// Get the module graph generator from the
// logical context (as a Rust addon).
const { generateModuleGraph } = require("../bin");

// Start timer.
const INITIAL_BUNDLE_START_TIME = Date.now();
const CWD = process.cwd();
const VERBOSE_BUNDLE = process.argv.includes("--verbose");
const configPath = path.join(CWD, "packem.config.yml");

if (!existsSync(configPath))
  throw Error(
    "A `packem.config.yml` configuration file must be present in project root."
  );

const config = yaml.safeLoad(readFileSync(configPath, "utf8"));
const { transformer: transformerConfig, plugins: configPlugins } = config;
const babelTransformOptions = {
  presets: (transformerConfig && transformerConfig.babelPresets) || [],
  plugins: (transformerConfig && transformerConfig.babelPlugins) || []
};

/**
 * Clean output path. Note that these mutations make up
 * the `ConfigurationObject`. Some of the fields are ommitted
 * in the docs for conveniency sake.
 *
 * https://packem.github.io/docs/advanced-plugin-apis.html#the-configurationobject
 */
config.rootPath = path.resolve(config.root);
config.outputPath = path.resolve(config.output);
config.outputDir = path.resolve(path.dirname(config.output));
config.outputPathFileStem = path.basename(config.outputPath, ".js");

// Setup event dispatcher for plugins.
const PluginEvents = new PluginEventsDispatcher(configPlugins);

/**
 * @event onStart
 *
 * This highlights the beginning of the bundling cycle.
 */
PluginEvents.dispatch("onStart", config);

// Generate Module Graph
// @TODO better errors for false `config.rootPath`
let initialBundles = Object.create(null);
let [moduleGraph, moduleGraphLength, dependencyMap] = generateModuleGraph(
  CWD,
  config.rootPath,
  config.outputPathFileStem // @TODO Do this internally
);

/**
 * @event onGenerateModuleGraph
 *
 * This is fired when the module graph is generated.
 */
PluginEvents.dispatch("onGenerateModuleGraph", moduleGraph);

// Begin the transformation process.
if (VERBOSE_BUNDLE) {
  spinner.succeed(
    "Total module count: " + chalk.bold.yellow(moduleGraphLength)
  );
  spinner.succeed("Transforming the module graph...");
}

// @TODO Find appropriate limit.
if (moduleGraphLength < 500) {
  // Use single-threaded transform
  for (const modId in moduleGraph) {
    let mod = moduleGraph[modId];
    const bundleId = mod.bundle_id || "root";

    /**
     * @event onBeforeTransform
     *
     * Just before the transformer kicks in, this event
     * is fired.
     */
    PluginEvents.dispatch("onBeforeTransform", mod);

    if (mod.extension !== "js") {
      /**
       * @event onModuleBundle
       *
       * This event is fired after the source is bundled. It doesn't mark
       * the end of the bundling cycle.
       */
      const pluginBundleWrap = PluginEvents.dispatch("onModuleBundle", mod);

      if (!pluginBundleWrap)
        throw Error(
          `Packem does not support ${mod.extension.toUpperCase()} file type(s) out of the box. Try out the "@packem/file-plugin".`
        );

      mod.content = pluginBundleWrap;

      if (!initialBundles[bundleId]) initialBundles[bundleId] = "";

      initialBundles[bundleId] += `\n\n// Source: "${mod.path}"
__packemModules._mod_${
        mod.id
      } = function(require, __packemImport, module, exports) {
${pluginBundleWrap}
}`;
    } else {
      const { code } = transformSync(mod.content, babelTransformOptions);

      /**
       * @event onAfterTransform
       *
       * This event is fired after the source code is transformed.
       */
      PluginEvents.dispatch("onAfterTransform", code);

      mod.content = code;

      if (!initialBundles[bundleId]) initialBundles[bundleId] = "";

      initialBundles[bundleId] += `\n\n// Source: "${mod.path}"
__packemModules._mod_${
        mod.id
      } = function(require, __packemImport, module, exports) {
${code}
}`;
    }
  }

  finalizeBundle();
} else {
  // Use a multi-threaded transform pool.
  if (VERBOSE_BUNDLE)
    spinner.succeed(
      chalk.green(" Using multi-core compilation to transform modules.")
    );

  let transformerWorkers = workerFarm(
    require.resolve("./multiThreadTransformer")
  );
  let ret = 0;

  for (const modId in moduleGraph) {
    let mod = moduleGraph[modId];
    const bundleId = mod.bundle_id || "root";

    /**
     * @event onBeforeTransform
     *
     * Just before the transformer kicks in, this event
     * is fired.
     */
    PluginEvents.dispatch("onBeforeTransform", mod);

    transformerWorkers(
      mod.content,
      babelTransformOptions,
      (content, babelTransformOptions) => {
        if (mod.extension !== "js") {
          /**
           * @event onModuleBundle
           *
           * This event is fired after the source is bundled. It doesn't mark
           * the end of the bundling cycle.
           */
          const pluginBundleWrap = PluginEvents.dispatch("onModuleBundle", mod);

          if (!pluginBundleWrap)
            throw Error(
              `Packem does not support ${mod.extension.toUpperCase()} file type(s) out of the box. Try out the "@packem/file-plugin".`
            );

          mod.content = pluginBundleWrap;

          if (!initialBundles[bundleId]) initialBundles[bundleId] = "";

          initialBundles[bundleId] += `\n\n// Source: "${mod.path}"
__packemModules._mod_${
            mod.id
          } = function(require, __packemImport, module, exports) {
${pluginBundleWrap}
}`;
        } else {
          let { code } = transformSync(mod.content, babelTransformOptions);

          /**
           * @event onAfterTransform
           *
           * This event is fired after the source code is transformed.
           */
          PluginEvents.dispatch("onAfterTransform", code);

          mod.content = code;

          if (!initialBundles[bundleId]) initialBundles[bundleId] = "";

          initialBundles[bundleId] += `\n\n// Source: "${mod.path}"
__packemModules._mod_${
            mod.id
          } = function(require, __packemImport, module, exports) {
${code}
}`;
        }

        // Worker farm is dropped from this point.
        if (++ret == moduleGraphLength) {
          workerFarm.end(transformerWorkers);

          finalizeBundle();
        }
      }
    );
  }
}

function finalizeBundle() {
  if (VERBOSE_BUNDLE) spinner.succeed("Cleaning output directory...");

  // Clear output directory.
  emptyDirSync(config.outputDir);

  // Write bundles to output directory.
  if (VERBOSE_BUNDLE)
    spinner.succeed(
      "Writing bundle(s) to: \n    " +
        chalk.bold.grey(`.../${path.basename(CWD)}/`) +
        chalk.bold.cyan(config.output.replace(/^\.\//, "") || config.output)
    );

  // @TODO Prevent file write if in development mode.
  for (const bundle_id in initialBundles) {
    // Write the main bundle first.
    if (bundle_id === "root")
      writeFileSync(config.outputPath, bundleTemp(initialBundles["root"]));
    // Followed by dynamically imported bundles.
    else
      writeFileSync(
        config.outputPath.replace(/\.js$/, `_${bundle_id}.js`),
        // @TODO Embed Packem's version.
        `/* Dynamic Bundle | Packem v0.1.0 (${new Date().toUTCString()}) */${
          initialBundles[bundle_id]
        }`
      );
  }

  /**
   * @event onSuccess
   *
   * This marks the completion of a successful bundle.
   */
  PluginEvents.dispatch("onSuccess");

  // Finalize logging for verbose bundle.
  spinner.succeed(
    chalk.bold(
      `Bundled${(!VERBOSE_BUNDLE && " " + chalk.yellow(moduleGraphLength)) ||
        ""} modules in ` +
        chalk.green(
          ((Date.now() - INITIAL_BUNDLE_START_TIME) / 1000).toFixed(2) + " s"
        )
    )
  );
  spinner.stop();
}

/**
 * @event onSuccess
 *
 * This is used by the `@packem/dev-plugin` and marks the end of a bundle cycle
 * and the start of development-specific functionalities.
 */
PluginEvents.dispatch(
  "onBundleComplete",
  config,
  PluginEvents,
  moduleGraph,
  dependencyMap,
  initialBundles
);

/**
 * @event onEnd
 *
 * This is used by the `@packem/dev-plugin` and defines the completion of a full bundle cycle.
 */
PluginEvents.dispatch("onEnd", config);
