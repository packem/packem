<p align="center"><img width="100" src="https://raw.githubusercontent.com/packem/packem/master/resources/packem-logo.png" /></p>

<h1 align="center">Packem</h1>

<p align="center">
  <img alt="Travis (.org)" src="https://img.shields.io/travis/packem/packem.svg">
  <img alt="npm" src="https://img.shields.io/npm/dt/packem.svg">
  <img alt="David" src="https://img.shields.io/david/packem/packem.svg">
  <img alt="Gitter" src="https://img.shields.io/gitter/room/bukharim96/packem_bundler.svg">
</p>

Packem is an extensively _precompiled_ general-purpose JavaScript module bundler with a focus on performance, flexibility and extendibility. Its crust is built with [Rust](https://www.rust-lang.org/), a zero-cost abstraction systems programming language with guaranteed memory safety.

> **Note:**
>
> - As of now, prebuilt Packem binaries are only available for MacOS (x64) and Linux (x64) machines. Prebuilt Windows binaries are to appear soon.
> - This is a pre-release version. Do not use it in production.

## Table of Contents
1. [Why Packem?](#why-packem)
2. [How Packem Works](#how-packem-works)
3. [Installation](#installation)
4. [Plugins](#plugins)
5. [Further Reading](#further-reading)
6. [Contributing](#contributing)
7. [FAQ](#faq)
8. [License](#license)

## Why Packem?

- Hypersonic speeds that go **+2X faster than [ParcelJS](https://parceljs.org/)**.
- **Light** and **efficient** outputs.
- **Unique configuration style** that will not make you cry.
- **Code Splitting** with dynamic imports.
- **Comprehensive & versatile plugin API** with an elegant approach.
- Common plugins for smoother development experience.

**Packem (v0.1.3-alpha) is +2X faster than [Parcel](https://parceljs.org/) (v1.12.3) (with multicore compilation).**

Modern bundlers today do optimize your code heavily, minify them and create near-perfect bundles but it comes at an expensive cost, time. The time slice is worth the effort to boost your productivity and not unnecessarily spending too much time on the tool.

Packem's real power lies in its usage of Rust, which is the state-of-the-art in high performance solutions. This delivers **close-to-the-metal** speed when compared against other bundlers without comprimising features.

In a comparison of Packem against Parcel, each bundler had to compile the entire [lodash v4.17.1](https://lodash.com/docs/4.17.11) to a single bundle and this was the results of the speed test:

| Test No. | Packem | Parcel |
| -------- | ------ | ------ |
| 1        | 4.23s  | 11.01s |
| 2 (cold) | 5.12s  | 12.39s |
| 3        | 4.55s  | 11.80s |

## How Packem Works

> For a quick preview of Packem in action, clone [this repo](https://github.com/bukharim96/packem-lodash-test#readme) and follow the necessary instructions.

<p align="center">
  <figure>
    <img src="https://raw.githubusercontent.com/packem/packem/master/resources/bundling-cycle.png" />
    <figcaption align="center"><i>Fig.1 - Bundling Cycle.</i></figcaption>
  </figure>
</p>

A static configuration (`packem.config.yml`) is used to outline the general flow of the process. From the root of your project, all dependencies are recursively matched, tracked then stacked into a **Module Graph** which is essentially a giant (depending on the nature of your project) mutable flat list of interfaces which represent a _'living resource'_ in your project. Packem works with the principle that each file type is treated as a module even though the same interface is not necessarily maintained.

**ES Dynamic Imports** could be used to create a seperate sub-graph that lives on its own, quite independant of the main graph or sibling/child graphs. Such complexity can be caused if multiple dynamic imports are nested which is not quite what one would need most of the time even though Packem can take care of it.

All the scripts are transpiled first (any Babel plugin can be included at this point as well) afterwhich plugins are instantiated to allow easy manipulation of the module graph. Under the hood, a built-in event dispatcher is used to trigger each event which a child or sibling plugin hooks onto.

Finally, the Graph Serializer concatenates all the transformed scripts which is eventually written to the output path. This defines a complete **Bundling Cycle**.

### Logical and Runtime Contexes

Most of the bundling decisions go into the module graph generator which is simply abstracted into Rust. The entire layer of the bundling cycle which involves Rusty OS-specific binaries _arbitrating_ the bundling process is what we refer to as the _Logical Context_. Every other process is regressed into NodeJS (due to certain issues involving binary compilation and FFI thread issues). This layer is called the _Runtime Context_.

> Since execution of plugins is decided entirely by the runtime context, they also belong to the same context.

## Installation
Packem is distrubuted as npm package, you can install packem globally by running the following:

```bash
# Default installation method (with npm)
npm install -g packem

# For Yarn, run
yarn add --global packem
```

Checkout the [Getting Started](docs/getting-started.md) guide for more details.

## Plugins

Packem uses a comprehensive _class-based_ event system. Based off of this, plugins are instantiated in order of definition in the configuration during build time. Built-in events are also rehydrated into the plugins which they can hook onto using the `PackemEventDispatcher` API. More details on this can be found in the [Plugins API](docs/the-plugin-system.md).

Most of the common plugins are not included with a single installation of Packem and will require you to install them manually. Some of these common plugins include:

- [dev-plugin](https://github.com/packem/packem-plugins/tree/master/dev-plugin) - An abstraction of the Packem's development toolkit i.e. the development server, watcher and other development utilities. This means, in essence, Packem doesn't include development tools by default.
- [file-plugin](https://github.com/packem/packem-plugins/tree/master/file-plugin) - Loads common structural and text-based file formats to their appropriate equivalents in JavaScript like _txt_ to string & _YAML_ to a JSON object.
- [minify-plugin](https://github.com/packem/packem-plugins/tree/master/minify-plugin) - Uses [terserjs](https://github.com/terser-js/terser) to crunch and optimize your JavaScript into tiny obfuscated files and write it to the output path.
- [style-plugin](https://github.com/packem/packem-plugins/tree/master/style-plugin) - Responsible for bundling SASS/SCSS, LESS & PostCSS to plain CSS which is then injected into the webpage at runtime.
- [image-plugin](https://github.com/packem/packem-plugins/tree/master/image-plugin) - Processes a PNG, JPG/JPEG, GIF, WebP or SVG file, compresses it with a few options like `quality`, `compressionRatio` and `dithering` to create efficiently optimized images that still retain fidelity.
- [bundle-stats-plugin](https://github.com/packem/packem-plugins/tree/master/bundle-stats-plugin) - Checks if your bundles exceed a certain custom constraint/limit and issues tabular diagnostics with details like bundle size vs the pre-defined limit.
- [markdown-plugin](https://github.com/packem/packem-plugins/tree/master/markdown-plugin) - Transforms a Markdown file into escaped HTML and then returns the result into the bundling pipeline.
- [coffeescript-plugin](https://github.com/packem/packem-plugins/tree/master/coffeescript-plugin) - Compiles CoffeeScript to JavaScript then appends it to the mainstream bundle.

## Further Reading

- [Code Splitting](docs/code-splitting.md)
- [Common Plugins](docs/common-plugins.md)


## Contributing

Packem is a community-led project. We depend on your contributions to sustain this project through financial support, filing issues and presenting PRs. Check the [contribution guidelines](CONTRIBUTING.md) for more details.

## FAQ

Check the [FAQs](FAQ.md) page to get help on some common caveats.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
