# LearnWeb Hotspots

Use this file as a routing map. Read only the section relevant to the task.

## 1. Content And Material

### Theory

- `material/**/main.md`
- Rendered in the Theory viewer.
- Can embed exercises with `[[exercise:ex01.md]]`.

### Examples

- `material/**/examples/*.md`
- Parsed by `src/utils/markdown.js`
- Compiled by `src/utils/exampleCompiler.js`
- Rendered by `src/utils/exampleRenderer.js`

### Topic Assets

- `material/**/assets/*`
- Used by HTML examples and shader textures

## 2. Editor UI

### Main Editor Logic

- `src/components/Editor.js`

Use for:

- tabs vs panels
- CodeMirror setup
- Vim integration
- file dialogs
- metadata dialogs
- theory editor mode
- shortcut help popup

### Editor Layout And Styling

- `index.html`
- `src/style.css`

Use for:

- toolbar buttons
- dialogs
- panel structure
- gallery/favorites/theory popup layout

## 3. Preview And Runtime

### Preview Coordinator

- `src/components/Preview.js`

Use for:

- console panel
- shader panel
- preview toolbar
- zoom
- viewport width
- theory preview bridge

### Rendering

- `src/utils/exampleRenderer.js`

Use for:

- iframe `srcdoc`
- shader WebGL runtime
- gallery static previews
- SVG special rendering

### Compilation

- `src/utils/exampleCompiler.js`

Use for:

- Pug, SCSS, Sass, TypeScript
- React single-file and multi-file
- Vue single-file, multi-file, and SFC
- compile diagnostics

## 4. Markdown Model And Metadata

- `src/utils/markdown.js`

Use for:

- frontmatter parsing
- example editorial metadata
- shader metadata
- virtual files
- hidden files in editor
- serialization helpers

If a request changes example format or metadata behavior, start here.

## 5. Theory Embeds

- `src/components/TheoryViewer.js`
- `src/components/TheoryExerciseDialog.js`
- `src/utils/theoryRenderer.js`
- `src/utils/theoryExerciseEmbeds.js`
- `src/utils/theoryDocument.js`

Use for:

- editing `main.md` in the editor
- inline exercise previews in theory
- larger exercise popup from theory

## 6. Gallery And Favorites

### Gallery

- `src/components/Gallery.js`

Use for:

- example cards
- hover overlays
- stage badges
- info visibility toggles

### Favorites

- `src/components/FavoritesDialog.js`
- `src/utils/favoritesStore.js`
- `.favorites`

Use for:

- add/remove favorite
- missing favorite cards
- preview inside favorites dialog

## 7. Sidebar And Tree

- `src/components/Sidebar.js`
- `src/utils/materialTree.js`
- `.hiddens`

Use for:

- chapter tree
- hidden chapters
- tree buttons
- sidebar actions like favorites and preview-info toggle

## 8. App Wiring

- `src/main.js`

Use for:

- component composition
- topic selection
- session persistence
- loading defaults and shortcut config
- bridging editor, theory, gallery, preview, and favorites

## 9. Backend

- `server.js`
- `src/utils/api.js`

Use for:

- reading/writing `material/`
- `main.md` save
- examples CRUD
- favorites API
- editor defaults API
- vim shortcut config API
- asset serving

## 10. Vim And Shortcuts

- `src/editor/vimSupport.js`
- `src/editor/vimShortcutConfig.js`
- `vim-shortcuts.yaml`

Use for:

- leader actions
- shift shortcuts
- runtime shortcut resolution
- shortcut help content

## 11. Language Support

- `src/editor/glslLanguage.js`
- `src/editor/learningCompletions.js`
- `src/editor/vueSmartEnter.js`

Use for:

- GLSL highlighting and snippets
- HTML/CSS/JS learning completions
- Vue smart Enter behavior

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

## 13. Typical Task Routing

### Add or fix an example

- change `material/**/examples/*.md`
- maybe validate with `npm test` if parser/compiler-sensitive

### Add or fix theory

- change `material/**/main.md`
- if embeds are involved, also inspect theory embed files above

### Change editor behavior

- start in `src/components/Editor.js`
- then inspect `index.html` and `src/style.css`

### Change preview behavior

- start in `src/components/Preview.js`
- then inspect `src/utils/exampleRenderer.js`

### Change example format or metadata

- start in `src/utils/markdown.js`

### Change Vim shortcuts

- inspect `vim-shortcuts.yaml`
- then `src/editor/vimShortcutConfig.js`
- then `src/editor/vimSupport.js`

### Change gallery or favorites

- inspect `src/components/Gallery.js` or `src/components/FavoritesDialog.js`
- check `.favorites` and `src/utils/favoritesStore.js` if persistence is involved
