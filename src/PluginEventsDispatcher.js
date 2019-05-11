const PackemPlugin = require("./PackemPlugin");

/**
 * `PluginEventsDispatcher._initPluginsFromConfig`
 * requires this in order to find Packem plugins.
 */
const path = require("path");

module.paths.unshift(path.join(process.cwd(), "node_modules"));

/**
 * `PluginEventsDispatcher`
 *
 * Handles global Packem plugin events.
 */
class PluginEventsDispatcher {
  constructor(configPlugins) {
    this.plugins = [];
    this._initPluginsFromConfig(configPlugins);
  }

  dispatch(event, ...args) {
    if (!this.plugins.length) return;

    let output = null;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];

      if (!plugin[event]) continue;

      output = plugin[event](...args);
    }

    return output;
  }

  // if `this.plugins` is not empty
  isHooked() {
    return !!this.plugins.length;
  }

  _initPluginsFromConfig(plugins = null) {
    if (!plugins) return [];

    const pluginNames = Object.keys(plugins);

    for (let i = 0; i < pluginNames.length; i++) {
      const pluginName = pluginNames[i];
      const pluginConfig = plugins[pluginName];

      let PluginInstance;

      try {
        PluginInstance = require("@packem/" + pluginName);
      } catch (error) {
        PluginInstance = require(pluginName);
      }

      if (PluginInstance.prototype instanceof PackemPlugin) {
        this.plugins.push(new PluginInstance(pluginConfig));
      } else console.error(`${pluginName} is not a valid Packem plugin.`);
    }
  }
}

module.exports = PluginEventsDispatcher;
