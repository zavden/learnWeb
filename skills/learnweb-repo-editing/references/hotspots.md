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
- `src/utils/renderer/documentRenderer.js` — iframe srcdoc generation
- `src/utils/renderer/shaderRenderer.js` — WebGL pipeline setup and rendering
- `src/utils/renderer/runtimeBridge.js` — console and error bridge for iframe
- `src/utils/renderer/diagnosticsMarkup.js` — diagnostic overlay HTML

### Compilation

- `src/utils/exampleCompiler.js` — facade re-exporting from compiler/
- `src/utils/compiler/markupCompiler.js` — Pug compilation
- `src/utils/compiler/styleCompiler.js` — SCSS/SASS compilation
- `src/utils/compiler/scriptCompiler.js` — TypeScript compilation
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
- `src/components/TheoryExerciseDialog.js` — exercise popup from theory
- `src/utils/theoryRenderer.js` — theory HTML generation
- `src/utils/theoryExerciseEmbeds.js` — `[[exercise:...]]` parsing and rendering
- `src/utils/theoryDocument.js` — theory document model

## 6. Gallery And Favorites

### Gallery

- `src/components/Gallery.js`

Use for: example cards, hover overlays, stage badges, info visibility toggles.

### Favorites

- `src/components/FavoritesDialog.js`
- `src/utils/favoritesStore.js`
- `.favorites`

## 7. Sidebar And Tree

- `src/components/Sidebar.js`
- `src/utils/materialTree.js`
- `.hiddens`

## 8. App Wiring

- `src/main.js` — component composition, topic selection, session persistence, zoom, layout

## 9. Backend

- `server.js` — Express API: tree, examples CRUD, compile, theory, favorites, assets, defaults
- `src/utils/api.js` — frontend API client

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
- `tests/favorites-store.test.mjs`
- `tests/example-editorial.test.mjs`
- `tests/panel-navigation.test.mjs`
- `tests/file-type-change.test.mjs`
- `tests/console-history.test.mjs`
- `tests/shader-parsing.test.mjs`
- `tests/vue-smart-enter.test.mjs`

Total: 143 tests. Run with `npm test`.

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
