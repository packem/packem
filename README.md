<p align="center"><img width="100" src="https://raw.githubusercontent.com/packem/packem/master/resources/packem-logo.png" /></p>

<h1 align="center">Packem</h1>

<p align="center">
  <a href="https://travis-ci.org/packem/packem">
    <img alt="Travis (.org)" src="https://travis-ci.org/packem/packem.svg?branch=master">
  </a>
  <img alt="npm" src="https://img.shields.io/npm/dt/packem.svg">
  <img alt="David" src="https://img.shields.io/david/packem/packem.svg">
  <a href="https://gitter.im/packem_bundler/community">
    <img alt="Gitter" src="https://img.shields.io/gitter/room/bukharim96/packem_bundler.svg">
  </a>
</p>

Packem is an extensively _precompiled_ general-purpose JavaScript module bundler with a focus on performance, flexibility and extendibility. Its crust is built with [Rust](https://www.rust-lang.org/), a zero-cost abstraction systems programming language with guaranteed memory safety.

> **Note:**
>
> - As of now, prebuilt Packem binaries are only available for macOS (_x64_) and Ubuntu (_x64_) machines. Binaries for Windows are to appear soon.
> - This is a pre-release version. Do not use it in production.

## Table of Contents
1. [Why Packem?](#why-packem)
2. [Installation](#installation)
3. [Plugins](#plugins)
4. [Further Reading](#further-reading)
5. [Contributing](#contributing)
6. [FAQ](#faq)
7. [License](#license)

## Why Packem?

- Hypersonic speeds that go **+2X faster than [ParcelJS](https://parceljs.org/)**.
- **Light** and **efficient** outputs.
- **Unique configuration style** that will not make you cry.
- **Code Splitting** with dynamic imports.
- **Comprehensive & versatile plugin API** with an elegant approach.
- Common plugins for smoother development experience.

**Packem (v0.1.3-alpha) is +2X faster than [Parcel](https://parceljs.org/) (v1.12.3 - with multicore compilation).**

Modern bundlers today do optimize your code heavily, minify them and create near-perfect bundles but it comes at an expensive cost, time. The time slice is worth the effort to boost your productivity and not unnecessarily spending too much time on the tool.

Packem's real power lies in its usage of Rust, which is the state-of-the-art in high performance solutions. This delivers **close-to-the-metal** speed when compared against other bundlers without comprimising features.

In a comparison of Packem against Parcel, each bundler had to compile the entire [lodash v4.17.1](https://lodash.com/docs/4.17.11) to a single bundle and this was the results of the speed test:

| Test No. | Packem | Parcel |
| -------- | ------ | ------ |
| 1        | 4.23s  | 11.01s |
| 2 (cold) | 5.12s  | 12.39s |
| 3        | 4.55s  | 11.80s |

## Installation

Packem is distrubuted as npm package, you can install packem globally by running the following:

```bash
# Default installation method (with npm)
npm install -g packem

# For Yarn, run
yarn global add packem
```

Checkout the [Getting Started](https://packem.github.io/docs/getting-started.html) guide for more details.

## Plugins

Packem uses a comprehensive _class-based_ event system. Based off of this, plugins are instantiated in order of definition in the configuration during build time. Built-in events are also rehydrated into the plugins which they can hook onto using the `PackemEventDispatcher` API. More details on this can be found in the [Plugins API](https://packem.github.io/docs/plugin-system.html).

Most of the common plugins are not included with a single installation of Packem and will require you to install them manually. Some of these common plugins include:

- [dev-plugin](https://packem.github.io/docs/common-plugins.html#packemdev-plugin) - An abstraction of the Packem's development toolkit i.e. the development server, watcher and other development utilities. This means, in essence, Packem doesn't include development tools by default.
- [file-plugin](https://packem.github.io/docs/common-plugins.html#packemfile-plugin) - Loads common structural and text-based file formats to their appropriate equivalents in JavaScript like _txt_ to string & _YAML_ to a JSON object.
- [minify-plugin](https://packem.github.io/docs/common-plugins.html#packemminify-plugin) - Uses [terserjs](https://github.com/terser-js/terser) to crunch and optimize your JavaScript into tiny obfuscated files and write it to the output path.
- [style-plugin](https://packem.github.io/docs/common-plugins.html#packemstyle-plugin) - Responsible for bundling SASS/SCSS, LESS & PostCSS to plain CSS which is then injected into the webpage at runtime.
- [image-plugin](https://packem.github.io/docs/common-plugins.html#packemimage-plugin) - Processes a PNG, JPG/JPEG, GIF, WebP or SVG file, compresses it with a few options like `quality`, `compressionRatio` and `dithering` to create efficiently optimized images that still retain fidelity.
- [bundle-stats-plugin](https://packem.github.io/docs/common-plugins.html#packembundle-stats-plugin) - Checks if your bundles exceed a certain custom constraint/limit and issues tabular diagnostics with details like bundle size vs the pre-defined limit.
- [markdown-plugin](https://packem.github.io/docs/common-plugins.html#packemmarkdown-plugin) - Transforms a Markdown file into escaped HTML and then returns the result into the bundling pipeline.
- [coffeescript-plugin](https://packem.github.io/docs/common-plugins.html#packemcoffeescript-plugin) - Compiles CoffeeScript to JavaScript then appends it to the mainstream bundle.

## Further Reading

- [Roadmap](https://packem.github.io/docs/roadmap.html)
- [Code Splitting](https://packem.github.io/docs/code-splitting.html)
- [Common Plugins](https://packem.github.io/docs/common-plugins.html)
- [Advanced Plugin APIs](https://packem.github.io/docs/advanced-plugin-apis.html)


## Contributing

Packem is a community-led project. We depend on your contributions to sustain this project through financial support, filing issues and presenting PRs. Check the [contribution guidelines](CONTRIBUTING.md) for more details.

## FAQ

Check the [FAQ](FAQ.md) page to get help on some common caveats.

## License

This project is licensed under the MIT License.
