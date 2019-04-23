# Getting Started

This section outlines how to install and configure Packem to get you started. Based off a simple app, you could extend your needs further to fit your requirements.

## Installation

To install Packem, your system needs to meet a few requirements:

- [Node (v10, v9 or v8)](https://nodejs.org/) **must** be installed (with *npm*). If you use [Yarn](https://yarnpkg.com/), then follow along with the appropriate commands.

Through your terminal, run:

```bash
# Default installation method (with npm)
npm install -g packem

# For Yarn, run
yarn global add packem
```

It is highly recommended to install Packem globally so that any version update could allow multiple Packem projects to compile using the latest installed version. You can check more about the versionings [here](https://github.com/packem/packem/blob/master/CHANGELOG.md). Alternatively, you could install it locally then use a package runner like [npx](https://github.com/zkat/npx) to run Packem on your project locally.

After installing Packem, setting up your workspace environment will be a matter of adding a single YAML file at the root of your project. Packem needs this configuration file to tell exactly what and how your code should be bundled.

## Creating the configuration file

In the root of your project's file structure, add a new file and name it `packem.config.yml`. This file will contain all the necessary configuration options for your project. In this file, copy the following content into it and save.

```yaml
root: "./src/index.js"
output: "./dist/bundle.js"
```

As you might've noticed, the `root` field is where the bundling process starts and the `output` field is where your final concatenated bundle ends up. You need to point to a file to get the root and output right. Packem takes care of the rest of the process according to how you've defined it.

> Only the `root` and `output` fields are necessary.

## Using custom Babel presets and/or plugins with Packem's transformer

Module Bundling is much more than mere string concatenation so allowing tools like [Babel](https://babeljs.io/) to transform your code is necessary.

Create a new field relative to the (required) `root` and `output` fields called `transformer`. Under this field, add a `babelPresets` and/or a `babelPlugins` field(s). Both fields accept an array of strings that indicate which Babel presets and/or plugins should be used during transformation.

By default, Packem includes `@babel/core` so you don't need to install it. The configuration psuedocode below shows how to add `@babel/preset-env` and `@babel/plugin-syntax-dynamic-import` to your code.

```yaml
root: ./src/my-root.js
output: ./dist/

# Here's where you configure Babel to your needs.
transformer:
  babelPresets: ["@babel/preset-env"]
  babelPlugins: ["@babel/plugin-syntax-dynamic-import"]
```

> __Note__
> - You must manually install your presets and/or plugins with a package manager.
> - Packem doesn't take __ANY__ externally defined Babel configurations as in `package.json`, `.babelrc` or `babel.config.js`. You must define your presets and/or plugins under the `transformer` field.

## Including/excluding globs from transformation

Use the `include` and/or `exclude` fields under `transformer` to include and/or exclude globs of files from being transformed respectively. Since `node_modules` is usually expected to be transformed, it is clear cut that it is moreso unnecessary to allow `node_modules` being transformed. There might be specific reasons as to why you would need to bundle with `node_modules` especially in the case where building for the browser is necessary. `include` and `exclude` accept a glob as a value.

For example, to exclude `node_modules` and include every JavaScript file under `src` (even if deeply nested),

```yaml
root: ./src/my-root.js
output: ./dist/

transformer:
  # The double stars makes it match deeper (exhaustively)
  # into sub folders. A glob is recursive so a list of
  # matches is returned from this glob.
  include: src/**/*.js
  exclude: node_modules
```

## Resources

- [Glob pattern matching, Wikipedia.](https://en.wikipedia.org/wiki/Glob_(programming))
