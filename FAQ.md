# FAQ

Have any additional question you need an answer for? File an issue at the master branch to get it reviewed.

## Are the binaries cross platform?

Packem v1.4 binaries are available for MacOS (_x64_) and Ubuntu (_x64_) only. Window binaries are not available. However, the next stable release of Packem will hopefully ensure full cross-platform support.

## How many output types are available?

Currently, Packem v1.4 (and below) can only output to a browser-compatible IIFE format only. Other output formats are expected soon.

## Can I run my bundles in Node/Electron?

By default, Packem generates bundles for the browser. These bundles can run directly in Electron but the problem persists as long as Packem replaces `require()` and `import()` statements with mangled ids. Support for Node/Electron in the future holds.

## Why static configuration?

A static configuration is **enough to declaratively tell Packem what to do** in your project so you have control of how Packem should run and what options to make that best suits your project's needs.

## Why YAML? Why not JSON?

YAML is syntactically pleasing than JSON. The JSON specification defines it as a data interchanging format and _not a configuration format_.

On the contrary, YAML is meant for configuration-driven tools that need a more elegant way of configuration without all the unnecessary curly braces, quotations, etc. All of this is at the benefit of the developer.

Choosing YAML over other static formats for Packem was a rock solid decision and a win!

The pseudocode below provides an clear illustration on the difference between the two formats.

```json
{
  "transformer": {
    "presets": ["es2015", "env", "react", "stage-2"],
    "plugins": [
      "transform-es2015-arrow-functions",
      "check-es2015-constants",
      "transform-es2015-block-scoping"
    ]
  }
}
```

```yaml
transformer:
  presets: [es2015, env, react, stage-2]
  plugins:
    - transform-es2015-arrow-functions
    - check-es2015-constants
    - transform-es2015-block-scoping
```

> __Note:__ Packem assumes your configuration complies to YAML v1.2.

## `.yml` or `.yaml`?

You can find more about that [here](https://stackoverflow.com/a/22268973).
