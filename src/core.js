const path = require("path");
const {
  existsSync,
  emptyDir,
  emptyDirSync,
  readFileSync,
  writeFileSync,
  statSync
} = require("fs-extra");

const ora = require("ora");
const chalk = require("chalk");
const yaml = require("js-yaml");
const { transformSync } = require("@babel/core");
const workerFarm = require("worker-farm");

const spinner = ora("Initializing bundle process...").start();

const PluginEventsDispatcher = require("./PluginEventsDispatcher");
const bundleTemp = require("./bundleTemp");
// Get prebuilt rust addons
const { generateModuleGraph } = require("../bin");

// Start timer
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
// clean output path
config.rootPath = path.resolve(config.root);
config.outputPath = path.resolve(config.output);
config.outputDir = path.resolve(path.dirname(config.output));
config.outputPathFileStem = path.basename(config.outputPath, ".js");

// Setup event dispatcher for plugins
const PluginEvents = new PluginEventsDispatcher(configPlugins);

// onStart event
PluginEvents.dispatch("onStart", config);

// generate Module Graph
// @todo better errors for false config.rootPath
let initialBundles = Object.create(null);
let [moduleGraph, moduleGraphLength, dependencyMap] = generateModuleGraph(
  CWD,
  config.rootPath,
  config.outputPathFileStem // @todo do this internally
);

// onGenerateModuleGraph event
PluginEvents.dispatch("onGenerateModuleGraph", moduleGraph);

// Begin the great transformation
if (VERBOSE_BUNDLE) {
  spinner.succeed(
    "Total module count: " + chalk.bold.yellow(moduleGraphLength)
  );
  spinner.succeed("Initializing transformation process...");
}

// @todo find appropriate limit
if (moduleGraphLength < 500) {
  // Use single-threaded transform
  for (const modId in moduleGraph) {
    let mod = moduleGraph[modId];
    const bundleId = mod.bundle_id || "root";

    // onBeforeTransform event
    PluginEvents.dispatch("onBeforeTransform", mod);

    if (mod.extension !== "js") {
      // onModuleBundle event
      const pluginBundleWrap = PluginEvents.dispatch("onModuleBundle", mod);
      if (!pluginBundleWrap)
        throw Error(
          `Packem core does not support ${mod.extension.toUpperCase()} filetypes. Try out the packem-file-plugin.`
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

      // onAfterTransform event
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
  // Use multi-threaded transform pool
  if (VERBOSE_BUNDLE)
    spinner.succeed(chalk.green(" Using multi-threaded transformation."));

  let transformerWorkers = workerFarm(
    require.resolve("./multiThreadTransformer")
  );
  let ret = 0;

  for (const modId in moduleGraph) {
    let mod = moduleGraph[modId];
    const bundleId = mod.bundle_id || "root";

    // onBeforeTransform event
    PluginEvents.dispatch("onBeforeTransform", mod);

    transformerWorkers(
      mod.content,
      babelTransformOptions,
      (content, babelTransformOptions) => {
        if (mod.extension !== "js") {
          // onModuleBundle event
          const pluginBundleWrap = PluginEvents.dispatch("onModuleBundle", mod);
          if (!pluginBundleWrap)
            throw Error(
              `Packem core does not support ${mod.extension.toUpperCase()} filetypes. Try out the packem-file-plugin.`
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

          // onAfterTransform event
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

        // End worker farm
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
  emptyDirSync(config.outputDir);

  // write bundles to output dir
  if (VERBOSE_BUNDLE)
    spinner.succeed(
      "Writing bundle(s) to: \n    " +
        chalk.bold.grey(`.../${path.basename(CWD)}/`) +
        chalk.bold.cyan(config.output.replace(/^\.\//, "") || config.output)
    );

  // @todo prevent file write if in development
  for (const bundle_id in initialBundles) {
    if (bundle_id === "root")
      // main bundle
      writeFileSync(config.outputPath, bundleTemp(initialBundles["root"]));
    // dynamic import | split bundles
    else
      writeFileSync(
        config.outputPath.replace(/\.js$/, `_${bundle_id}.js`),
        // @todo embed packem version
        `/* Dynamic Bundle | Packem v0.1.0 (${new Date().toUTCString()}) */${
          initialBundles[bundle_id]
        }`
      );
  }

  // onSuccess event
  PluginEvents.dispatch("onSuccess");

  // Finalize
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

  // writeFileSync("../moduleGraph.json", JSON.stringify(initialBundles, null, 2));
}

// onBundleComplete event
// This is used by the @packem/dev-plugin.
PluginEvents.dispatch(
  "onBundleComplete",
  config,
  PluginEvents,
  moduleGraph,
  dependencyMap,
  initialBundles
);

// onEnd event
PluginEvents.dispatch("onEnd", config);
