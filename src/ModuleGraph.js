const { create_init_modgraph: createInitialModuleGraph } = require("../bin");
const Transformer = require("./Transformer");
const Serializer = require("./Serializer");
const logger = require("./logger");

class ModuleGraph {
  constructor(config) {
    this.config = config;

    this.generate();

    // Initialize serializer & transformer
    this.serializer = new Serializer(this);
    this.transformer = new Transformer(this);
  }

  // Generate Module Graph
  // @TODO better errors for false `config.inputPath`
  generate() {
    try {
      const [
        moduleGraphJson,
        moduleGraphLength,
        dependencyMap
      ] = createInitialModuleGraph(
        this.config.inputPaths,
        this.config.outputPathFileStem,
        this.config.format
      );

      this.modules = new Map(JSON.parse(moduleGraphJson));
      this.graphLength = moduleGraphLength;
      this.dependencyMap = dependencyMap;
    } catch (error) {
      // The issue with this is that the same error type is used
      // for different `panic!`s implemented in Rust. This creates
      // unreachable code.
      logger.fatal("UnresolvableModuleError", error.toString().substring(38));
    }

    /**
     * @event onGenerateModuleGraph
     *
     * This is fired when the module graph is generated.
     */
    global.PluginEvents.dispatch("onGenerateModuleGraph", this);
  }

  // @TODO regenerate for subsequent builds in development
  regenerate() {}

  transform() {
    this.transformer.transformGraph();
  }

  output() {
    this.serializer.outputGraph();
  }
}

module.exports = ModuleGraph;
