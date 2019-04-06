# Common Plugins

These are a set of plugins created to support basic development utilities, extended configurations, styling with SASS/SCSS, stats on output bundles, etc. They are hosted on [a repo](https://github.com/packem/packem-plugins) on the packem github org.

## `@packem/file-plugin`

The file plugin allows processing of raw file types as JavaScript modules during runtime. For instance this would return a valid JavaScript object:

```javascript
import tomlConfig from "./path/to/your/file.toml";

console.log(tomlConfig);
```

### Usage

Add `file-plugin: on` to the `plugins` section in `packem.config.yml`.
