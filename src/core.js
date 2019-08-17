const path = require("path");
const { existsSync, readFileSync } = require("fs-extra");

const chalk = require("chalk");
const yaml = require("js-yaml");
const { sync: mkdirSync } = require("make-dir");

const PluginEventsDispatcher = require("./PluginEventsDispatcher");
const ModuleGraph = require("./ModuleGraph");
const logger = require("./logger");
const {
  compileStepLog,
  bundleStepLog,
  linkStepLog,
  targetGeneratedStepLog
} = require("./cli");

const CWD = process.cwd();
const CONFIG_PATH = path.join(CWD, ".packemrc");

if (!existsSync(CONFIG_PATH))
  logger.fatal(
    "NoConfigFoundError",
    `No ${chalk.bold
      .yellow`\`.packemrc\``} configuration file detected in this scope.`
  );

const START_CLI_TIME = new Date();

// Parse config to object
const config = yaml.safeLoad(readFileSync(CONFIG_PATH, "utf8"));
/**
 * Clean output path. Note that these mutations make up
 * the `ConfigurationObject`. Some of the fields are ommitted
 * in the docs for conveniency sake.
 *
 * https://packem.github.io/docs/advanced-plugin-apis.html#the-configurationobject
 */
// @FIXME `output: ./dir/` results in bug that deletes project
config.mode = config.mode || "production";
config.format = config.format || "iife";
config.inputPaths =
  config.input.constructor == String
    ? [path.resolve(config.input)]
    : // remove duplicates in multiple inputs
      [...new Set(config.input.map(input => path.resolve(input)))];
config.outputPath = config.output
  ? path.resolve(config.output)
  : path.join(CWD, "build");
// @TODO do a better check
config.outputDir = !!path.extname(config.outputPath)
  ? path.dirname(config.outputPath)
  : config.outputPath;
const fileStemMatch = config.outputPath.match(/(\w+)\.js$/);
config.outputPathFileStem = (fileStemMatch && fileStemMatch[1]) || "";

compileStepLog();

// sync create output dir
mkdirSync(config.outputDir);

// Setup global event dispatcher for plugins.
global.PluginEvents = new PluginEventsDispatcher(config.plugins);

/**
 * @event onStart
 *
 * This highlights the beginning of the bundling cycle.
 */
PluginEvents.dispatch("onStart", config);

let moduleGraph = new ModuleGraph(config);

bundleStepLog(moduleGraph.graphLength, config.mode);

moduleGraph.transform();

linkStepLog(config.format);

// write files only if in production mode
// if (config.mode == "production")
moduleGraph.output();

/**
 * @event onBundleComplete
 *
 * This is used by the `@packem/dev-plugin` and marks the end of a bundle cycle
 * and the start of development-specific functionalities.
 */
PluginEvents.dispatch("onBundleComplete", config, moduleGraph);

const FINAL_CLI_TIME = new Date();

targetGeneratedStepLog(
  ((FINAL_CLI_TIME - START_CLI_TIME) / 1000).toPrecision(2)
);
