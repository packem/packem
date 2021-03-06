## 0.2.0

- LC precompiled for Unix and Win32 systems.
- The module graph is implemented as a map in the form `Map<string, ModuleInterface>`.
- New dynamic imports implementation.
- `onAfterTransform` event takes `mod` as a parameter and not `transformedContent`.
- Deprecate `onSuccess` event in favor of `onBundleComplete`.
- `onBundleComplete` event takes `config` and `moduleGraph` as parameters.
- `onEnd` event has been deprecated for `onBundleComplete`.
- `packem.config.yml` deprecated for `.packemrc`.
- `.packemrc` now takes `mode` and `format` fields.
- Codesplit duplicate modules into a seperate bundle `bundle.commons.js`
- Fail on requiring built-in Node modules in a non-CommonJS mode.
- **Serializer**:
  - Multiple output formats support for:
    - `iife`: A self-executing function, suitable for inclusion into a browser env as a `<script>` tag.
    - `cjs`: CommonJS, suitable for Node and other bundlers to consume.
- Default `config.outputPath` setting is `"./build"`.
- Multiple inputs support.
- Fix Packem runtime. Main input should load common dependencies.
- Multiple runtimes
  - CommonJS runtime (for NodeJS target).
