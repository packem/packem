# FAQ

Have any additional question you need an answer for? File an issue at the master branch to get it reviewed.

## Why static configuration? Why YAML?

A static configuration is **enough to declaratively tell Packem what to do** in your project so you have control of how Packem should run and what options to make that best suits your project's needs.

## Why YAML? Why not JSON?

YAML is syntactically pleasing than JSON. Even though V8 can effectively handle JSON parsing, JSON still remains a data interchanging format.

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

> Packem uses YAML v1.2

## `.yml` or `.yaml`?

You can find more about that [here](https://stackoverflow.com/a/22268973).
