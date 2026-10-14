# LearnWeb Hotspots

Use this file as a routing map. Read only the section relevant to the task.

## 1. Content And Material

### Theory

- `material/**/main.md`
- Rendered in the Theory viewer.
- Can embed exercises with `[[exercise:ex01.md]]`.
- See `skills/learnweb-theory-authoring/SKILL.md` for full authoring guide.

### Examples

- `material/**/examples/*.md`
- Parsed by `src/utils/markdown.js` (facade) and `src/utils/markdown/` (modules)
- Compiled by `src/utils/exampleCompiler.js` (facade) and `src/utils/compiler/` (modules)
- Rendered by `src/utils/exampleRenderer.js` (facade) and `src/utils/renderer/` (modules)
- See `skills/learnweb-example-authoring/SKILL.md` for full authoring guide.

### Topic Assets

- `material/**/assets/*`
- Used by HTML examples and shader textures

## 2. Editor UI

### Main Editor Logic

- `src/components/Editor.js` — core class, layout, panel management, workspace rendering
- `src/components/editor/diagnostics.js` — CodeMirror diagnostic markers and gutter
- `src/components/editor/sessionManager.js` — session state persistence and restore
- `src/components/editor/exercisePanel.js` — exercise config, state, hints, solutions
- `src/components/editor/theoryEditor.js` — theory document editing and saving
- `src/components/editor/shaderDialogs.js` — shader uniform and texture dialog UI
- `src/components/editor/metadataDialogs.js` — example metadata, file type, shortcuts dialogs
- `src/components/editor/fileOperations.js` — file CRUD, save, modify, rename, delete, templates
- `src/components/editor/dirtyTracker.js` — unsaved-changes snapshot, dirty indicator and navigation guard helpers
- `src/components/editor/toast.js` — toasts rendered as top-layer popovers (visible above open dialogs)

All editor/* modules are mixins applied via `Object.assign(Editor.prototype, ...mixins)`.

### Editor Layout And Styling

- `index.html` — app shell, toolbar, dialogs, slider controls
- `src/styles/01-base.css` through `src/styles/11-gallery.css` — modular CSS

## 3. Preview And Runtime

### Preview Coordinator

- `src/components/Preview.js` — core preview class, auto-render, theory preview bridge
- `src/components/preview/RuntimeDiagnostics.js` — runtime error overlay
- `src/components/preview/ConsoleManager.js` — runtime console panel
- `src/components/preview/ShaderControls.js` — shader uniform controls, textures, FPS

### Rendering

- `src/utils/exampleRenderer.js` — facade re-exporting from renderer/
- `src/utils/renderer/documentRenderer.js` — preview document generation (no injected styles, escaped inline code, script kind)
- `src/utils/renderer/previewHost.js` — hosted preview: documents are POSTed to `/api/preview-documents` and loaded from `http://<host>:3001/preview/...` (real origin: storage, forms, anchors, workers); falls back to srcdoc
- `src/utils/renderer/runtimeBridgeRuntime.js` — the in-page runtime (console inspector with expandable `[[Prototype]]` trees, error mapping, form-submit logging, storage shims for srcdoc)
- `src/utils/renderer/runtimeBridge.js` — builds the bridge script injected in `<head>` on a single line
- `src/utils/renderer/scriptKind.js` — classic vs module script detection
- `src/utils/renderer/sourceMap.js` — inline source-map decoding for TypeScript line mapping
- `src/utils/renderer/paths.js` — per-segment encoding of topic/asset URLs
- `src/utils/renderer/shaderRenderer.js` — WebGL pipeline setup and rendering
- `src/utils/renderer/diagnosticsMarkup.js` — diagnostic overlay HTML

### Compilation

- `src/utils/exampleCompiler.js` — facade re-exporting from compiler/
- `src/utils/compiler/markupCompiler.js` — Pug compilation
- `src/utils/compiler/styleCompiler.js` — SCSS/SASS compilation
- `src/utils/compiledStyleView.js` — generated `compiled.css` / `sass-output.txt` views of Sass examples (theory code-embed tabs and the editor preview «CSS» panel) and `compiled.js` of TypeScript examples (code-embed tab; `jsView` from `scriptCompiler.js`)
- `src/utils/compiler/scriptCompiler.js` — JavaScript syntax check + TypeScript transpile (ES2022) + loop guards
- `src/utils/compiler/syntaxCheck.js` — JavaScript syntax errors as Chrome reports them (V8 `vm.Script` for classic scripts, TS parser for modules, plus the browser-only `let top`/`window`/`document`/`location` early error)
- `src/utils/compiler/typeChecker.js` — cached TypeScript language service (`strict`, ES2023 + DOM libs); type errors are non-blocking diagnostics
- `src/utils/compiler/loopGuard.js` — same-line loop guards that stop endless loops after ~1.2 s
- `src/utils/compiler/isolatedCompiler.js` + `compileWorkerThread.js` — the server compiles in a worker thread with memory/time limits (endless Sass/Pug loops can't take the API down)
- `src/utils/compiler/reactCompiler.js` — React single and multi-file via esbuild
- `src/utils/compiler/vueCompiler.js` — Vue SFC and multi-file compilation
- `src/utils/compiler/virtualFilesPlugin.js` — esbuild plugin for virtual file resolution
- `src/utils/compiler/helpers.js` — shared compilation utilities

## 4. Markdown Model And Metadata

- `src/utils/markdown.js` — facade re-exporting from markdown/
- `src/utils/markdown/core.js` — helpers and normalization
- `src/utils/markdown/parsers.js` — fence and metadata parsing
- `src/utils/markdown/constants.js` — language, role, and framework option matrices
- `src/utils/markdown/documentApi.js` — document CRUD operations
- `src/utils/markdown/documentMeta.js` — metadata extraction
- `src/utils/markdown/mutations.js` — safe document mutations
- `src/utils/markdown/fileTypeChange.js` — file type transition validation
- `src/utils/markdown/validationDocuments.js` — document structure validation
- `src/utils/markdown/validationMetadata.js` — metadata validation
- `src/utils/markdown/shader.js` — shader-specific parsing

If a request changes example format or metadata behavior, start here.

## 5. Theory Embeds

- `src/components/TheoryViewer.js` — theory panel rendering
- `src/components/TheoryExerciseDialog.js` — example popup from theory («▶ Run» / card click): runs the hosted preview (srcdoc fallback), lists TypeScript type errors above its console
- `src/utils/theoryRenderer.js` — theory HTML generation
- `src/utils/theoryExerciseEmbeds.js` — `[[exercise:...]]` parsing and rendering
- `src/utils/theoryDocument.js` — theory document model

## 6. Gallery, Favorites And Pending

### Gallery

- `src/components/Gallery.js` (console-only examples show a code preview instead of an iframe)
- `src/components/AssetsDialog.js` — read-only browser for a topic's `assets/` files («Assets» button in the gallery header)

Use for: example cards, hover overlays, stage badges, info visibility toggles, pending badge rendering, pending entries on startup.

### Favorites

- `src/components/FavoritesDialog.js`
- `src/utils/favoritesStore.js`
- `.favorites`

### Pending

- `src/components/PendingDialog.js`
- `src/utils/pendingStore.js`
- `.pending`

Pending mirrors the Favorites architecture exactly: file-based JSON storage, server API (GET/POST/DELETE `/api/pending`), client API, dialog component, sidebar button, editor toolbar button. Pending items appear with an amber badge in the gallery and are sorted first.

## 7. Sidebar And Tree

- `src/components/Sidebar.js`
- `src/utils/materialTree.js` — natural sort; display labels: topic = first `# ` heading of `main.md` (inline-code backticks dropped), chapter/section = first line of `label.txt`
- `.hiddens`

## 8. App Wiring

- `src/main.js` — component composition, topic selection, session persistence, zoom, layout

## 9. Backend

- `server.js` — Express API (bound to 127.0.0.1): tree, examples CRUD, compile (isolated worker), theory, favorites, pending, assets (subfolders allowed), preview hosting, defaults. Every route confines paths to `material/` (`resolveInside`).
- `src/utils/api.js` — frontend API client
- `src/utils/demoApi.js` — `/api/demo/*` demo API for the network lessons (echo, slow stream, CORS modes), open to any origin; tests in `tests/server-demo-api.test.mjs`

## 10. Vim And Shortcuts

- `src/editor/vimSupport.js` — Vim extension, mode change, shift/leader key handlers
- `src/editor/vim/clipboardBridge.js` — system clipboard bridge, register controller patching
- `src/editor/vimShortcutConfig.js` — shortcut config parsing, validation, resolution
- `src/editor/vim/yamlParser.js` — simple YAML parser for shortcut config
- `vim-shortcuts.yaml` — user-facing shortcut configuration

## 11. Language Support

- `src/editor/glslLanguage.js` — GLSL highlighting and snippets
- `src/editor/learningCompletions.js` — HTML/CSS/JS learning completions
- `src/editor/vueSmartEnter.js` — Vue smart Enter behavior

## 12. Tests

### High-level suites

- `tests/framework-compilation.test.mjs`
- `tests/document-roundtrip.test.mjs`
- `tests/metadata-validation.test.mjs`

### Feature-specific suites

- `tests/vim-support.test.mjs`
- `tests/theory-document.test.mjs`
- `tests/theory-exercise-embeds.test.mjs`
- `tests/compiled-style-view.test.mjs` — compiled CSS / Sass message tabs
- `tests/favorites-store.test.mjs`
- `tests/example-editorial.test.mjs`
- `tests/panel-navigation.test.mjs`
- `tests/file-type-change.test.mjs`
- `tests/console-history.test.mjs`
- `tests/shader-parsing.test.mjs`
- `tests/vue-smart-enter.test.mjs`

- `tests/compile-script-safety.test.mjs`, `tests/compile-isolated.test.mjs` — type checking, syntax diagnostics, loop guards, isolated compiler
- `tests/data-*.test.mjs` — markdown fences/frontmatter, theory sanitizing, state stores, labels
- `tests/runtime-*.test.mjs` — preview document and in-page runtime (console inspector, errors)
- `tests/server-demo-api.test.mjs` — the course demo API
- `tests/ui-*.test.mjs` — dirty tracking and Vim shortcut config

Total: 253 tests. Run with `npm test`.

## 14. Course Content Checker
- `tools/verify-examples.html` (+ `verify-examples.js`, `verify-core.js`) — browser harness: `http://localhost:5174/tools/verify-examples.html?path=<ch>/<sec>[&ms=1500][&only=03-]` runs examples through the real hosted preview one at a time and collects runtime problems (`window.__verifyResults`).

- `scripts/check-material.mjs` — validates structure, labels, embeds, frontmatter, exercises and compiles every example of the course chapters (ch02+). Usage: `node scripts/check-material.mjs material/<chapter>/<section>`.

## 13. Typical Task Routing

### Add or fix an example

- Change `material/**/examples/*.md`
- Read `skills/learnweb-example-authoring/SKILL.md` for format reference
- Validate with `npm test` if parser/compiler-sensitive

### Add or fix theory

- Change `material/**/main.md`
- Read `skills/learnweb-theory-authoring/SKILL.md` for format reference
- If embeds are involved, inspect theory embed files above

### Add or fix a shader

- Change shader `.md` in examples
- Read `skills/learnweb-shader-authoring/SKILL.md` for format reference

### Change editor behavior

- Start in `src/components/Editor.js` and its `editor/` mixin modules
- Then inspect `index.html` and `src/styles/`

### Change preview behavior

- Start in `src/components/Preview.js` and its `preview/` modules
- Then inspect `src/utils/renderer/`

### Change example format or metadata

- Start in `src/utils/markdown/` modules

### Change Vim shortcuts

- Inspect `vim-shortcuts.yaml`
- Then `src/editor/vimShortcutConfig.js`
- Then `src/editor/vimSupport.js`
