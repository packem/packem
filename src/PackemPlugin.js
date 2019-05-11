/**
 * @class `PackemPlugin`
 * 
 * @classdesc This class provides a container for Packem
 * plugins to gain access to the bundle cycle.
 */
class PackemPlugin {
  constructor(pluginConfig) {
    this.pluginConfig = pluginConfig;
  }

  // onGenerateModuleGraph(moduleGraph) {}
  // onTransformModule(mod) {}
  // onDevServerStart(devserver) {}
  // onDevServerClose(devserver) {}
  // onModuleChanged(mod) {}
  // onHotModuleReload(mod) {}
  // onDiffUpdate(mod) {}
  // onModuleBundle(mod) {}
  // onBundle(bundle) {}
  // onSubsequentBuild(mod) {}
  // onError(message) {}
  // onBundleComplete(mod) {}
}

module.exports = PackemPlugin;
