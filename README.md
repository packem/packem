<p align="center"><img src="https://raw.githubusercontent.com/packem/packem/master/resources/packem-logo.png" /></p>

<h1 align="center">Packem</h1>

Packem is an extensively _precompiled_ general-purpose JavaScript module bundler with a focus on performance, flexibility and extendibility. Its crust is built with [Rust](), a zero-cost abstraction systems programming language with guaranteed memory safety.

## How Packem Works

<p align="center"><img src="https://raw.githubusercontent.com/packem/packem/master/resources/bundle-cycle.png" /></p>

A static configuration (`packem.config.yml`) is used to outline the general flow of the process. From the root of your project, all dependencies are recursively matched, tracked then stacked into a __Module Graph__ which is essentially a giant (depending on the nature of your project) mutable flat list of interfaces which represent a _'living resource'_ in your project. Packem works with the principle that each file type is treated as a module even though the same interface is not necessarily maintained.

__ES Dynamic Imports__ could be used to create a seperate sub-graph that lives on its own, quite independant of the main graph or sibling/child graphs. Such complexity can be caused if multiple dynamic imports are nested which is not quite what one would need most of the time even though Packem can take care of it.

All the scripts are transpiled first (any Babel plugin can be included at this point as well) afterwhich plugins are instantiated to allow easy manipulation of the module graph. Under the hood, a built-in event dispatcher is used to trigger each event which a child or sibling plugin hooks onto.

Finally, the Graph Serializer concatenates all the transformed scripts which is eventually written to the output path. This defines a complete __Bundling Cycle__.

### Logical and Runtime Contexes

Since most of the bundling decisions go into the module graph generator, it is simply abstracted into Rust. The entire layer of the bundling cycle which involves Rusty OS-specific dynamic libraries _arbitrating_ the bundling process is what we refer to as the _Logical Context_. Every other process is regressed into NodeJS (due to certain issues involving binary compilation and FFI thread issues). This layer is called the _Runtime Context_.

> Since execution of plugins is decided entirely by the runtime context, they also belong to the same context.

## Plugins

Packem uses a comprehensive _class-based_ event system. Based off of this, plugins are instantiated in order of definition in the configuration during build time. Built-in events are also rehydrated into the plugins which they can hook onto using the `PackemEventDispatcher` API. More details on this can be found in the [Plugins API](/).

Most of the common plugins are not included with a single installation of Packem and will require you to install them manually. Some of these common plugins include:

- `dev-plugin` - An abstraction of the Packem's development toolkit i.e. the development server, watcher and other development utilities. This means, in essence, Packem doesn't include development tools by default.
- `file-plugin` - Loads common structural and text-based file formats to their appropriate equivalents in JavaScript like _txt_ to string & _YAML_ to a JSON object.
- `minify-plugin` - Uses [terserjs](https://github.com/terser-js/terser) to crunch and optimize your JavaScript into tiny obfuscated files and write it to the output path.
- `style-plugin` - Responsible for bundling SASS/SCSS, LESS & PostCSS to plain CSS which is then injected into the webpage at runtime.
- `image-plugin` - Processes a PNG, JPG/JPEG, GIF, WebP or SVG file, compresses it with a few options like `quality`, `compressionRatio` and `dithering` to create efficiently optimized images that still retain fidelity.
- `bundle-stats-plugin` - Checks if your bundles exceed a certain custom constraint/limit and issues tabular diagnostics with details like bundle size vs the pre-defined limit.
- `markdown-plugin` - Transforms a Markdown file into escaped HTML and then returns the result into the bundling pipeline.
- `coffeescript-plugin` - Compiles CoffeeScript to JavaScript then appends it to the mainstream bundle.

## API Reference

If you wish to get started right away, check the `docs` section for more details on configurations and the necessary API to get you started.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
