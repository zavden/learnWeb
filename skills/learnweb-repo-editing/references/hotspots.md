# LearnWeb Hotspots

Use this file as a routing map. Read only the section relevant to the task.

Every app module is TypeScript (`.ts`). For how the pieces fit together (flows, data model, preview security)
read `docs/ARCHITECTURE.md`; for scripts, conventions, testing and extension recipes read `docs/DEVELOPMENT.md`.

## 1. Content And Material

### Theory

- `material/**/main.md`
- Rendered in the Theory viewer.
- Can embed exercises with `[[exercise:ex01.md]]`, their code with `[[exercise:ex01.md-]]`, and link examples with `[text](ex01.md)`.
- See `skills/learnweb-theory-authoring/SKILL.md` for full authoring guide.

### Examples

- `material/**/examples/*.md`
- Parsed by `src/utils/markdown.ts` (facade) and `src/utils/markdown/` (modules)
- Compiled by `src/utils/exampleCompiler.ts` (dispatcher) and `src/utils/compiler/` (modules)
- Rendered by `src/utils/exampleRenderer.ts` (facade) and `src/utils/renderer/` (modules)
- See `skills/learnweb-example-authoring/SKILL.md` for full authoring guide.

### Topic Assets

- `material/**/assets/*`
- Used by HTML examples and shader textures

## 2. Shared Types

- `src/types/document.ts` — example document model (`ExampleDocument`, blocks, files, metadata) and its derived views; closed sets derived from `src/config/exampleBlocks.ts` and `src/utils/markdown/constants.ts`
- `src/types/diagnostics.ts` — the `Diagnostic` shape (structural, compile and runtime problems)
- `src/types/compile.ts` — compile input/output and `/api/compile` payloads
- `src/types/runtime.ts` — preview iframe ↔ app protocol (bridge config, console/error messages, REPL and inspector commands, shader messages)
- `src/types/api.ts` — request/response payloads of every JSON route of `server.ts`
- `src/types/material.ts` — material tree and the shapes of `.hiddens`, `.favorites`, `.pending`
- `src/types/theory.ts` — theory pseudo-document (`main.md` in the editor), `[[exercise:…]]` embeds, theory render options
- `src/types/utility.ts` — type-level helpers

Types only (no runtime code). Add a shape here when more than one area uses it.

## 3. Editor UI

### Main Editor Logic

- `src/components/Editor.ts` — core class, layout, panel management, workspace rendering
- `src/components/editor/diagnostics.ts` — CodeMirror diagnostic markers and gutter
- `src/components/editor/sessionManager.ts` — session state persistence and restore
- `src/components/editor/exercisePanel.ts` — exercise config, state, hints, solutions
- `src/components/editor/theoryEditor.ts` — theory document editing and saving
- `src/components/editor/shaderDialogs.ts` — shader uniform and texture dialog UI
- `src/components/editor/metadataDialogs.ts` — example metadata, file type, shortcuts dialogs
- `src/components/editor/fileOperations.ts` — file CRUD, save, modify, rename, delete, templates
- `src/components/editor/lineHighlightExtension.ts` + `lineHighlightsMixin.ts` — author line highlights (`highlights` metadata)
- `src/components/editor/dirtyTracker.ts` — unsaved-changes snapshot, dirty indicator and navigation guard helpers
- `src/components/editor/toast.ts` — toasts rendered as top-layer popovers (visible above open dialogs)

All editor/* mixins are applied via `Object.assign(Editor.prototype, ...mixins)`; every field they use is declared in `Editor.ts`.

### Editor Layout And Styling

- `index.html` — app shell, toolbar, dialogs, slider controls
- `src/styles/01-base.css` through `src/styles/11-gallery.css` — modular CSS

## 4. Preview And Runtime

### Preview Coordinator

- `src/components/Preview.ts` — core preview class, auto-render, theory preview bridge
- `src/components/preview/RuntimeDiagnostics.ts` — runtime error overlay
- `src/components/preview/ConsoleManager.ts` — runtime console panel
- `src/components/preview/ShaderControls.ts` — shader uniform controls, textures, FPS

### Rendering

- `src/utils/exampleRenderer.ts` — facade re-exporting from renderer/
- `src/utils/renderer/documentRenderer.ts` — preview document generation (no injected styles, escaped inline code, script kind)
- `src/utils/renderer/previewHost.ts` — hosted preview: documents are POSTed to `/api/preview-documents` and loaded from `http://<host>:3001/preview/...` (real origin: storage, forms, anchors, workers); falls back to srcdoc
- `src/utils/renderer/runtimeBridgeRuntime.ts` — the in-page runtime (console inspector with expandable `[[Prototype]]` trees, error mapping, form-submit logging, storage shims for srcdoc, a `Worker` wrapper for srcdoc that starts module workers from a `data:` URL and classic http workers through `importScripts`); errors are titled by their name like Chrome 155 (DOM errors too, never `DOMException:`) and the ResizeObserver loop error is not reported. Serialized with `Function.prototype.toString()`: it must stay self-contained (type imports only). Its protocol is `src/types/runtime.ts`.
- `src/utils/renderer/runtimeBridge.ts` — builds the bridge script injected in `<head>` on a single line
- `src/utils/renderer/scriptKind.ts` — classic vs module script detection
- `src/utils/renderer/sourceMap.ts` — inline source-map decoding for TypeScript line mapping
- `src/utils/renderer/paths.ts` — per-segment encoding of topic/asset URLs
- `src/utils/renderer/shaderRenderer.ts` — WebGL pipeline setup and rendering
- `src/utils/renderer/diagnosticsMarkup.ts` — diagnostic overlay HTML
- `src/utils/shaderPreviewDiagnostics.ts` — GLSL validation with a WebGL context before rendering a shader

### Compilation

- `src/utils/exampleCompiler.ts` — `compileExampleDocument`: dispatches to the compilers in compiler/
- `src/utils/compileClient.ts` + `src/workers/compileWorker.ts` — browser side: Web Worker with an 80-entry cache and in-flight de-duplication in front of `POST /api/compile`
- `src/utils/compileCache.ts` — cache key and deep copy shared by the server and the worker
- `src/utils/compiler/markupCompiler.ts` — Pug compilation
- `src/utils/compiler/styleCompiler.ts` — SCSS/SASS compilation
- `src/utils/compiledStyleView.ts` — generated `compiled.css` / `sass-output.txt` views of Sass examples (theory code-embed tabs and the editor preview «CSS» panel) and `compiled.js` of TypeScript examples (code-embed tab; `jsView` from `scriptCompiler.ts`)
- `src/utils/compiler/scriptCompiler.ts` — JavaScript syntax check + TypeScript transpile (ES2022, `alwaysStrict`: scripts get `"use strict"` like `tsc --strict`) + loop guards
- `src/utils/compiler/syntaxCheck.ts` — JavaScript syntax errors as Chrome reports them (V8 `vm.Script` for classic scripts, TS parser for modules, plus the browser-only `let top`/`window`/`document`/`location` early error)
- `src/utils/compiler/typeChecker.ts` — cached TypeScript language service (`strict`, ES2023 + DOM libs); type errors are non-blocking diagnostics
- `src/utils/compiler/loopGuard.ts` — same-line loop guards that stop endless loops after ~1.2 s
- `src/utils/compiler/isolatedCompiler.ts` + `compileWorkerThread.ts` — the server compiles in a worker thread with memory/time limits (endless Sass/Pug loops can't take the API down)
- `src/utils/compiler/reactCompiler.ts` — React single and multi-file via esbuild
- `src/utils/compiler/vueCompiler.ts` — Vue SFC and multi-file compilation
- `src/utils/compiler/virtualFilesPlugin.ts` — esbuild plugin for virtual file resolution
- `src/utils/compiler/helpers.ts` — shared compilation utilities
- `src/utils/compiler/types.ts` — types internal to compilation (worker-thread and compile-worker messages, esbuild modules)

## 5. Markdown Model And Metadata

- `src/utils/markdown.ts` — facade re-exporting from markdown/
- `src/utils/markdown/core.ts` — helpers and normalization
- `src/utils/markdown/parsers.ts` — fence and metadata parsing
- `src/utils/markdown/constants.ts` — language, role, and framework option matrices
- `src/utils/markdown/documentApi.ts` — document CRUD operations
- `src/utils/markdown/documentMeta.ts` — metadata extraction
- `src/utils/markdown/mutations.ts` — safe document mutations
- `src/utils/markdown/fileTypeChange.ts` — file type transition validation
- `src/utils/markdown/validationDocuments.ts` — document structure validation
- `src/utils/markdown/validationMetadata.ts` — metadata validation
- `src/utils/markdown/shader.ts` — shader-specific parsing
- `src/config/exampleBlocks.ts` — block registry, aliases, slot order, session presets
- `src/config/fileTemplates.ts` — templates for new files in React/Vue multi-file examples

If a request changes example format or metadata behavior, start here, with the types in `src/types/document.ts`.

## 6. Theory Embeds

- `src/components/TheoryViewer.ts` — theory panel rendering
- `src/components/TheoryExerciseDialog.ts` — example popup from theory («▶ Run» / card click): runs the hosted preview (srcdoc fallback), lists TypeScript type errors above its console
- `src/utils/theoryRenderer.ts` — theory HTML generation
- `src/utils/theoryExerciseEmbeds.ts` — `[[exercise:...]]` parsing and rendering
- `src/utils/theoryDocument.ts` — theory document model

## 7. Gallery, Favorites And Pending

### Gallery

- `src/components/Gallery.ts` (console-only examples show a code preview instead of an iframe; cards mount when visible and unmount when they scroll away). The gallery, favorites, pending and exercise-embed picker cards attach their iframe first and set `srcdoc` two animation frames later (`loadSrcdocWhenLaidOut` in `previewHost.ts`); the cards inside theory preview and export pages do the same in their own script (`theoryRenderer.ts`), while the Theory side panel (`TheoryViewer.ts`) sets `srcdoc` directly. A card that boots before it has a size can run its scripts with a 0×0 viewport (out-of-process frame), which once left a WebGL card drawing into a 1×1 buffer
- `src/components/AssetsDialog.ts` — read-only browser for a topic's `assets/` files («Assets» button in the gallery header)

Use for: example cards, hover overlays, stage badges, info visibility toggles, pending badge rendering, pending entries on startup.

### Favorites

- `src/components/FavoritesDialog.ts`
- `src/utils/favoritesStore.ts`
- `.favorites`

### Pending

- `src/components/PendingDialog.ts`
- `src/utils/pendingStore.ts`
- `.pending`

Pending mirrors the Favorites architecture exactly: file-based JSON storage, server API (GET/POST/DELETE `/api/pending`), client API, dialog component, sidebar button, editor toolbar button. Pending items appear with an amber badge in the gallery and are sorted first.

## 8. Sidebar And Tree

- `src/components/Sidebar.ts`
- `src/utils/materialTree.ts` — natural sort; display labels: topic = first `# ` heading of `main.md` (inline-code backticks dropped), chapter/section = first line of `label.txt`
- `.hiddens`

## 9. App Wiring

- `src/main.ts` — component composition, topic selection, session persistence, zoom, layout

## 10. Backend

- `server.ts` — Express API (bound to 127.0.0.1), run directly by Node (type stripping, no build): tree, examples CRUD, compile (isolated worker), theory, favorites, pending, assets (subfolders allowed), preview hosting, defaults. Every route confines paths to `material/` (`resolveInside`). Restart `npm run dev` after changing it or the modules it imports.
- `src/utils/api.ts` — frontend API client (payload types in `src/types/api.ts`)
- `src/utils/demoApi.ts` — `/api/demo/*` demo API for the network lessons (echo, slow stream, CORS modes), open to any origin; tests in `tests/server-demo-api.test.ts`
- `src/utils/editorDefaults.ts` — `.vim_enable` / `.clipboard_default`

## 11. Vim And Shortcuts

- `src/editor/vimSupport.ts` — Vim extension, mode change, shift/leader key handlers
- `src/editor/vim/clipboardBridge.ts` — system clipboard bridge, register controller patching
- `src/editor/vimShortcutConfig.ts` — shortcut config parsing, validation, resolution
- `src/editor/vim/yamlParser.ts` — simple YAML parser for shortcut config
- `vim-shortcuts.yaml` — user-facing shortcut configuration

## 12. Language Support

- `src/editor/glslLanguage.ts` — GLSL highlighting and snippets
- `src/editor/learningCompletions.ts` — HTML/CSS/JS learning completions
- `src/editor/vueSmartEnter.ts` — Vue smart Enter behavior

## 13. Tests

### High-level suites

- `tests/framework-compilation.test.ts`
- `tests/document-roundtrip.test.ts`
- `tests/metadata-validation.test.ts`

### Feature-specific suites

- `tests/vim-support.test.ts`
- `tests/theory-document.test.ts`
- `tests/theory-exercise-embeds.test.ts`
- `tests/theory-example-links.test.ts`
- `tests/compiled-style-view.test.ts` — compiled CSS / Sass message tabs
- `tests/favorites-store.test.ts`
- `tests/example-editorial.test.ts`
- `tests/panel-navigation.test.ts`
- `tests/file-type-change.test.ts`
- `tests/file-quick-open.test.ts`
- `tests/console-history.test.ts`
- `tests/shader-texture-metadata.test.ts`
- `tests/shader-color.test.ts`
- `tests/vue-smart-enter.test.ts`
- `tests/glsl-language.test.ts`, `tests/learning-completions.test.ts`
- `tests/editor-defaults.test.ts`, `tests/tree-hidden-state.test.ts`

- `tests/compile-script-safety.test.ts`, `tests/compile-isolated.test.ts` — type checking, syntax diagnostics, loop guards, isolated compiler
- `tests/data-*.test.ts` — markdown fences/frontmatter, theory sanitizing, state stores, labels
- `tests/runtime-*.test.ts` — preview document and in-page runtime (console inspector, errors)
- `tests/server-demo-api.test.ts` — the course demo API
- `tests/ui-*.test.ts` — dirty tracking and Vim shortcut config
- `tests/tools-verify.test.ts` — pure parts of the browser harness

Total: 255 tests. Run with `npm test` (`node --test` on the `.ts` sources, about 3 s); one file with `node --test tests/<file>.test.ts`. Types: `npm run typecheck`; everything static plus tests: `npm run check`.

## 14. Course Content Checks And Scripts

- `tools/verify-examples.html` (+ `verify-examples.ts`, `verify-core.ts`) — browser harness: `http://localhost:5174/tools/verify-examples.html?path=<ch>/<sec>[&ms=1500][&only=03-]` runs examples through the real hosted preview one at a time and collects runtime problems (`window.__verifyResults`); `&logs=1` keeps console lines, `&show=1&w=&h=` keeps the last frame visible, `&card=1` runs them as gallery cards do (srcdoc, `sandbox="allow-scripts"`).
- `scripts/check-material.ts` — validates structure, labels, embeds, frontmatter, exercises and compiles every example of the course chapters (ch02+). Usage: `node scripts/check-material.ts material/<chapter>/<section>` (or `npm run check:material -- <path>`).
- `scripts/snapshot-material.ts` — hashes every stage the app derives from `material/` (parse, metadata, serialization, compile, rendered documents, theory). `--out before.json` before an app change, `--compare before.json` after; `--filter`/`--dump` write raw outputs. About 1 minute for the whole course.
- `scripts/contrast.ts` — WCAG contrast ratio of color pairs: `node scripts/contrast.ts "#777" "#fff"`.

## 15. Typical Task Routing

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

- Start in `src/components/Editor.ts` and its `editor/` mixin modules
- Then inspect `index.html` and `src/styles/`

### Change preview behavior

- Start in `src/components/Preview.ts` and its `preview/` modules
- Then inspect `src/utils/renderer/` and the protocol in `src/types/runtime.ts`

### Change example format or metadata

- Start in `src/utils/markdown/` modules and `src/types/document.ts`

### Change Vim shortcuts

- Inspect `vim-shortcuts.yaml`
- Then `src/editor/vimShortcutConfig.ts`
- Then `src/editor/vimSupport.ts`

### Extend the app (block type, frontmatter key, API route, editor dialog, console feature, Vim shortcut)

- Follow the recipes in `docs/DEVELOPMENT.md`
