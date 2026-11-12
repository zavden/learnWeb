# Developing LearnWeb

How to run, check and extend the app. Read [ARCHITECTURE.md](ARCHITECTURE.md) first for the pieces and the
flows; this document assumes them.

## Contents

- [Requirements and first run](#requirements-and-first-run)
- [npm scripts](#npm-scripts)
- [How TypeScript is used](#how-typescript-is-used)
- [Conventions](#conventions)
- [Testing](#testing)
- [Recipes](#recipes)

## Requirements and first run

- Node.js 22.18 or newer (`engines` in `package.json`): Node runs `server.ts`, the scripts and the tests
  directly from their `.ts` sources. The project is developed on Node 24.
- npm (the repository has a `package-lock.json`).

```bash
npm install
npm run dev          # Vite on http://localhost:5174 + the API (node server.ts) on 127.0.0.1:3001
```

Open `http://localhost:5174`. The app needs both processes: Vite serves the UI and proxies `/api` to the
API server.

Vite reloads browser code on save. The API server does not: after changing `server.ts` or anything it
imports (`src/utils/markdown/`, `src/utils/compiler/`, `exampleCompiler.ts`, `compileCache.ts`,
`materialTree.ts`, the stores, `demoApi.ts`, `src/editor/vimShortcutConfig.ts`), restart `npm run dev`.
Compile results are cached by document in the browser's compile worker and on the server, so after changing a
compiler, also reload the page.

The tracked content is `material/ch00-tests` (test material) and `material/ch01-templates` (one topic per
example format); the course chapters (`material/ch02+`) are gitignored and live only in local checkouts.

## npm scripts

| Script | What it runs | What it validates |
|---|---|---|
| `npm run dev` | `vite` + `node server.ts` (with `concurrently`) | Nothing: the development app. |
| `npm run build` | `vite build` → `dist/` | That the browser app bundles. It does not type-check and does not package the server. |
| `npm run preview` | `vite preview` | Serves `dist/`. It does not start the API server: run `node server.ts` next to it to load content. |
| `npm test` | `node --test "tests/**/*.test.ts"` | The unit and integration tests (255 tests, about 3 s). |
| `npm run test:watch` | the same with `--watch` | |
| `npm run typecheck` | `tsc --noEmit` | Types of the whole repository (one program, see below). |
| `npm run lint` | `eslint .` | Correctness rules (`eslint.config.js`); formatting rules are off. |
| `npm run format` / `format:check` | `prettier --write .` / `--check .` | Formatting (`.prettierrc.json`; Markdown, `index.html`, `tools/*.html` and content are ignored, see `.prettierignore`). |
| `npm run check` | `typecheck` + `lint` + `format:check` + `test` | Everything that runs without the course content or a browser. |
| `npm run check:material -- <path…>` | `node scripts/check-material.ts` | Course content (see [Testing](#testing)). |
| `npm run snapshot:material -- …` | `node scripts/snapshot-material.ts` | That a change to the app did not change what it derives from the content. |

Arguments after `--` go to the script, e.g. `npm run check:material -- material/ch03-css/sec04-flexbox --quiet`.

## How TypeScript is used

Every module is TypeScript (`.ts`), with no compile step to JavaScript on disk:

- **Node strips the types.** `node server.ts`, `node scripts/check-material.ts` and `node --test` load the
  sources as they are; Node removes the type annotations and runs the rest. There is no `ts-node`, `tsx` or
  build output for the server side.
- **Vite compiles the browser code** (`index.html` → `src/main.ts`, the compile worker,
  `tools/verify-examples.ts`) with esbuild, which also only removes types.
- **Type checking is a separate step:** `npm run typecheck` (`tsc --noEmit`). Neither Node nor Vite checks
  types, so a type error never stops the app from running; it stops `npm run check`.
- **One `tsconfig.json`** for the whole repository: `src`, `tests`, `tools`, `scripts`, `server.ts` and
  `vite.config.ts` are one program with `strict`, DOM and Node types together. Browser and Node code can
  share types (`src/types/`) and modules, which is why shared modules must not touch the DOM at import time.

Because the types are stripped, not compiled, a few TypeScript features are off limits:

- **Erasable syntax only** (`erasableSyntaxOnly`): no `enum`, no `namespace`, no constructor parameter
  properties, no decorators, no `import x = require()`. Use string-literal unions and `as const` objects.
- **Type-only imports are explicit** (`verbatimModuleSyntax`): `import type { X } from …` or
  `import { type X, y } from …`. A plain import of something that is only a type survives stripping and fails
  at runtime, because the module has no such export. ESLint enforces it (`consistent-type-imports`).
- **Imports spell the real extension:** `import { parseExampleDocument } from './markdown.ts'`
  (`allowImportingTsExtensions`, `moduleResolution: Bundler`).
- **Class fields are real properties** (`useDefineForClassFields`): a declared field exists on the instance,
  set to `undefined`, before the constructor body runs. This matters for the mixins below.
- **The preview runtime is serialized.** `learncodeRuntimeBridge` in
  `src/utils/renderer/runtimeBridgeRuntime.ts` is turned into a string with `Function.prototype.toString()`
  and evaluated inside the preview iframe. Its text must be valid JavaScript on its own both as Node strips it
  and as Vite emits it: it may import types only, may not reference anything outside its own body, and may not
  use syntax for which a compiler would emit a helper outside the function.

## Conventions

### Behaviour first

Inputs come from hand-edited files, JSON bodies, learner code and users. Keep the defensive runtime checks
(`String(value || '')`, `Array.isArray(x) ? x : []`, `doc?.metadata`) even where the types say they are
unnecessary. The course (thousands of examples) depends on the exact output of the parser, compilers and
renderers: run the material snapshot (see [Testing](#testing)) for any change to that pipeline.

### TypeScript

- **No `any`.** Use real types, `unknown` plus narrowing, or generics. The only accepted `any` is at an untyped
  third-party boundary, with a `// any: <reason>` comment on the same line. No `@ts-ignore`, no `@ts-nocheck`;
  `@ts-expect-error <reason>` only in tests that pass invalid input on purpose.
- **Signatures.** Every exported function and every method has explicit parameter types and an explicit return
  type. Option bags are `(options: FooOptions = {})` with an interface of optional properties. Type a parameter
  as its contract; add `| null | undefined` only where the function is written to tolerate a missing value
  (optional chaining on it, `x || {}`), because callers rely on that.
- **Shapes.** `interface` for object contracts, `type` for unions and aliases. A closed set that exists at
  runtime (block types, languages, roles, stages) has one source of truth: derive the union from the constant
  (`as const` + `(typeof LIST)[number]`, or `keyof typeof TABLE`) instead of repeating the strings. The tables
  of `src/config/exampleBlocks.ts` and `src/utils/markdown/constants.ts` are those sources for the document
  model.
- **Where types live.** Types shared across areas live in `src/types/*.ts` (document model, diagnostics,
  compile contract, runtime protocol, API payloads, material tree, theory pages). Types used by one area stay next to its
  code (a `types.ts` beside it when several files share them, like `src/utils/compiler/types.ts`). Import a
  type from where it is defined; never re-declare an existing shape.
- **Classes.** Declare every field with its type above the constructor, in the order the constructor assigns
  them. Never declare a field whose name is provided by the prototype or by a mixin (the declaration would
  create an own property that hides it), and do not add initializers that change a value. Keep member names,
  including the `_` prefix. `readonly` where it is obviously true; `private` only when nothing outside the
  class file uses the member (tests count as outside).
- **DOM.** For elements `index.html` always has, use `byId<T>()` / `queryRequired<T>()` from
  `src/utils/dom.ts` (unchecked casts, no runtime cost). Where the code already handles a missing element
  (`if (!el) return`, `el?.x`), keep the DOM call and its `| null`. Do not add runtime branches just to please
  the type checker (no new `instanceof` guards or early returns): where the code already assumes a type, assert
  it (`event.target as HTMLElement`). Use precise element and event types (`HTMLInputElement`,
  `KeyboardEvent`, `PointerEvent`).
- **Timers.** `ReturnType<typeof setTimeout>` for handles of bare `setTimeout`/`setInterval`; `number` for
  `window.setTimeout` and `requestAnimationFrame`.
- **Errors.** `catch (error)` is `unknown`: use `errorMessage(error)` from `src/utils/errors.ts` where the code
  reads the message, `error instanceof Error` where it needs more.
- **Non-null assertions** (`!`) are fine where an invariant guarantees the value and a guard would add a
  runtime branch; add a few words of comment when the invariant is not obvious from the line above.
- **Formatting** is Prettier's (`.prettierrc.json`: 4-space indent, single quotes, semicolons, trailing
  commas, 120 columns; 2 spaces for CSS, JSON, HTML and YAML). Do not reflow lines you are not changing.

### Mixins (`Editor` and `Preview`)

`Editor` (`src/components/Editor.ts`) and `Preview` (`src/components/Preview.ts`) spread their methods over
mixin object literals (`src/components/editor/*.ts`, `src/components/preview/*.ts`) that are copied onto the
prototype with `Object.assign(Class.prototype, …mixins)`. They are typed like this:

```ts
// mixin file
import type { Editor } from '../Editor.ts';

export const fileOperationsMixin = {
    _isShaderDocument(): boolean {
        return isShaderDocument(this.currentDocument); // `this` is Editor
    },
} satisfies ThisType<Editor>;

// class file
export class Editor { /* every field + the core methods */ }
// Declaration merging: the mixin methods become part of the Editor type.
export interface Editor extends FileOperationsMixin, SessionManagerMixin /* … */ {}
type FileOperationsMixin = typeof fileOperationsMixin;
Object.assign(Editor.prototype, fileOperationsMixin /* … */);
```

- All state lives in the class: every field a mixin reads or writes is declared in the class file. Mixins
  declare no fields.
- Members that mixins use cannot be `private`.
- Every mixin method has an explicit return type (it also prevents circular inference between mixins).

### Documentation

Comments and docs are in English.

- Each module starts with a short header comment: what it is, where it sits (who calls it, what it calls) and
  what a newcomer must know before editing it (invariants, gotchas).
- TSDoc (`/** … */`) on every exported function, class, type and constant, and on non-trivial methods: what it
  is for and what is not obvious (units, invariants, side effects, why). One or two lines is normal. Do not
  restate the signature or narrate the code; no `@param {type}` (types live in the signature); use
  `@param name` only when the name does not explain itself.
- Document the fields of exported interfaces that are not self-explanatory.
- Keep `docs/`, `README.md` / `README_ES.md` (same content in two languages) and
  `skills/learnweb-repo-editing/references/hotspots.md` in step with the code.

## Testing

| Tool | Command | Use it when |
|---|---|---|
| Unit tests | `npm test`, or `node --test tests/<file>.test.ts` | Always, for any app change. |
| Static checks | `npm run check` | Before committing app code. |
| Build | `npm run build` | After UI or runtime changes. |
| Course checker | `npm run check:material -- material/<ch>/<sec>` | After editing course content, or the parser/compilers it relies on. |
| Material snapshot | `npm run snapshot:material -- --out before.json`, then `-- --compare before.json` | Any change to parsing, metadata, serialization, compilation, rendering, the runtime, the theory renderer or the material tree that must not change the output. |
| Browser harness | `http://localhost:5174/tools/verify-examples.html?path=<ch>/<sec>` (with `npm run dev`) | Runtime behaviour of examples in a real browser: the runtime bridge, the renderers, hosted previews. |

### Unit tests (`tests/*.test.ts`)

`node:test` with `node:assert/strict`, run on the type-stripped sources (no DOM; modules that need one are
tested through their pure helpers). The tests are part of the type-checked program: when a test passes partial
or invalid input on purpose, cast at the call (`as unknown as ExampleDocument`) or use
`@ts-expect-error <reason>`; never loosen the source types for a test.

| Area | Files |
|---|---|
| Document model, frontmatter, round trip | `data-markdown`, `document-roundtrip`, `metadata-validation`, `file-type-change`, `shader-texture-metadata`, `example-editorial` |
| Compilation | `framework-compilation`, `compile-script-safety` (type checking, syntax errors, loop guards), `compile-isolated` (worker thread), `compiled-style-view` |
| Rendering and preview runtime | `runtime-document` (rendered documents), `runtime-bridge` (runs the runtime in a `vm` context and checks the posted messages) |
| Theory | `theory-document`, `data-theory` (sanitizing), `theory-exercise-embeds`, `theory-example-links` |
| Server-side state and API | `favorites-store`, `data-stores`, `tree-hidden-state`, `editor-defaults`, `server-demo-api` (mounts the demo router on an ephemeral Express app) |
| Editor helpers | `vim-support`, `ui-vim-shortcuts`, `ui-dirty-tracking`, `panel-navigation`, `file-quick-open`, `console-history`, `vue-smart-enter`, `glsl-language`, `learning-completions`, `shader-color` |
| Tools | `tools-verify` (pure parts of the browser harness) |

`server.ts` starts listening when it is imported, so it is not imported by tests: logic worth testing lives in
modules under `src/utils/` (like `materialTree.ts`, the stores and `demoApi.ts`).

### Course checker (`scripts/check-material.ts`)

Walks a chapter, section or topic folder (default: every chapter except `ch00-tests` and `ch01-templates`) and
reports structure problems (`label.txt`, `main.md` heading, `top90`/`top95` topics), broken theory embeds and
example links, frontmatter rules (`example_description`, `example_stage`, exercises and their solutions), every
parse diagnostic, and the compile diagnostics of every example (compiled in the isolated worker, like the
server). It uses the app's own modules, so what it reports is what the app would show. `--quiet` prints only
errors; the exit code is 1 when there are errors. The output lines and the summary line are read by the course
workflow, so change their format with care.

### Material snapshot (`scripts/snapshot-material.ts`)

Hashes every stage the app derives from `material/`: for each example the parse, metadata views, serialization,
compile result and rendered preview documents; for each `main.md` the embeds and the rendered theory HTML and
documents; plus the material tree when no path is given. `--out file.json` writes a snapshot, `--compare file.json` compares (exit
code 1 and a list of differing `<topic>/<file>#<stage>` keys when something changed). Take the snapshot before
your change and compare after it. Paths limit the run to chapters, sections or topics; `--filter <substring>`
plus `--dump <dir>` write the raw outputs so you can diff them. The runtime source is hashed once
(`runtime#source`), so a change to the runtime shows as one difference, not one per example. The script answers
the client modules' `fetch('/api/…')` calls itself; it does not need the server. The whole course takes about
one minute.

### Browser harness (`tools/verify-examples.html`)

A dev-only page (served by Vite, not linked from the app, needs the API server) that runs every example of
`?path=<ch>[/<sec>[/<topic>]]` through the real preview pipeline, one at a time, and lists compile diagnostics
and runtime problems. Parameters: `ms` (time per example, default 1500), `only=<prefix>`, `logs=1` (keep console
lines), `show=1&w=&h=` (keep the last frame visible at that size), `card=1` (run as gallery cards do: srcdoc,
`sandbox="allow-scripts"`). Results are published on `window.__verifyResults` (and `__verifyDone`,
`__verifyUrls`) for browser automation. Its pure logic is `tools/verify-core.ts`.

## Recipes

Each recipe names the files to touch. Run `npm run check` and, when the recipe touches the content pipeline,
the material snapshot.

### Add a block type or language

1. `src/config/exampleBlocks.ts`: add the type to `BLOCK_REGISTRY` (`slot`, canonical `heading`, `badgeLabel`,
   `badgeClass`, `enabled`) and any alternative fence names to `BLOCK_ALIASES`. `BlockType` and `BlockSlot` in
   `src/types/document.ts` follow automatically. Add a preset to `SESSION_PRESETS` if the Create dialog should
   offer it.
2. `src/utils/markdown/constants.ts`: `LANGUAGE_FILE_EXTENSIONS` (also defines `FileLanguage`),
   `LANGUAGE_LABELS`, `LEGACY_FILE_TEMPLATES` (the path and role of its legacy file), the option lists of its
   family (`LEGACY_MARKUP_LANGUAGE_OPTIONS`, `LEGACY_STYLE_LANGUAGE_OPTIONS`, `LEGACY_SCRIPT_LANGUAGE_OPTIONS`,
   `LEGACY_APP_LANGUAGE_OPTIONS`), the menus (`LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS`, the React/Vue lists) and,
   for multi-file projects, `REACT_MULTI_FILE_LANGUAGES` / `VUE_MULTI_FILE_LANGUAGES` and their `_OPTIONS`.
   The family lists drive `getLegacyLanguageFamily` / `getVirtualLanguageFamily` (`core.ts`) and the badge
   change rules (`fileTypeChange.ts`).
3. Structure rules, if the slot has any: `validateLegacyDocument` / `validateVirtualDocument` in
   `src/utils/markdown/validationDocuments.ts`.
4. Compilation: a branch in the slot's compiler (`compileMarkupSource` in `markupCompiler.ts`, `compileStyle` in
   `styleCompiler.ts`, `compileScript` in `scriptCompiler.ts`; without one the compiler reports
   `unsupported-*-compiler`). For multi-file projects: `inferLoader` and `VIRTUAL_EXTENSIONS` in
   `src/utils/compiler/helpers.ts`. If the output needs new fields, extend `CompiledDocument` in
   `src/types/compile.ts` and read them in `renderCompiledExampleDocument`.
5. Editor: CodeMirror support in `Editor._getLanguageExtensions` (`src/components/Editor.ts`) and the badge
   style `.lang-badge.<badgeClass>` in `src/styles/03-editor-surface.css`. Theory highlighting:
   `hljs.registerLanguage` at the top of `src/utils/theoryRenderer.ts`. Gallery type tag: `_getExampleType` in
   `Gallery.ts`.
6. Tests in `tests/data-markdown.test.ts`, `document-roundtrip.test.ts`, `file-type-change.test.ts` and
   `framework-compilation.test.ts`; a sample in `material/ch01-templates/`; the format in
   `skills/learnweb-example-authoring/SKILL.md` (and its copy in `.codex/skills/`).

### Add a frontmatter key

1. If the key needs normalization (case, trimming, a closed set), add it to `KNOWN_METADATA_KEYS`
   (`src/utils/markdown/constants.ts`; known keys are matched case-insensitively and stored lower-case) and a
   branch to `normalizeMetadata` (`src/utils/markdown/core.ts`). Then add a typed field to `ExampleMetadata`
   in `src/types/document.ts`: a compile-time check at the end of that file fails until every known key has
   one. Unknown keys need none of this: they are parsed (`parseMetadataValue`), kept verbatim and written back
   (`lang`, `loop_protect` and `typecheck` work that way).
2. Diagnostics for bad values in `validateMetadata` (`src/utils/markdown/validationMetadata.ts`), with a stable
   `code`.
3. Read it where it matters: a view in `src/utils/markdown/documentMeta.ts` (like `getExerciseConfig`,
   `getShaderConfig`, `getExampleEditorialMetadata`) or directly from `document.metadata` (the compilers read
   `metadata.loop_protect` in `exampleCompiler.ts`). The whole document goes to `POST /api/compile` and into the
   compile cache key, so the compilers see the key without further plumbing.
4. If the UI edits it: a mutation in `src/utils/markdown/mutations.ts` (like `updateExampleEditorialMetadata`)
   and a dialog (see below). Serialization needs nothing: `buildFrontmatter` writes every key, sorted.
5. If the course checker should enforce it: `checkExample` in `scripts/check-material.ts`.
6. Tests in `tests/metadata-validation.test.ts` and `document-roundtrip.test.ts`; the key in the frontmatter
   table of `skills/learnweb-example-authoring/SKILL.md` and in the README.

### Add an API route

1. Payload types in `src/types/api.ts`: the request body and the response, with the status codes the route can
   answer. Failures are always `ApiErrorBody` (`{ error }`).
2. The handler in `server.ts`, in the section of its endpoint family:
   `app.post('/api/…', (req: Request<Params, unknown, Partial<Body>>, res: Response) => { … })`. Treat the body
   as untrusted (every field may be missing or of another type). Every path that comes from the URL or the body
   goes through `resolveTopicDir`, `resolveExampleFile`, `resolveInside` or `assertPlainSegment`; answer path
   problems with `sendRouteError` (a `PathError` gives 400) and other failures with
   `res.status(500).json({ error: errorMessage(err) })`; end with `res.json(payload satisfies ResponseType)`.
3. The origin gate in front of all routes already limits the route to the local app; do not widen it. File
   logic worth testing goes in a Node module under `src/utils/` (as `materialTree.ts` and the stores do), since
   tests cannot import `server.ts`.
4. The client function in `src/utils/api.ts`: build the URL with `topicUrl()` / `encodeTopicPath()` (encode
   every segment), send JSON, and return `handleResponse<ResponseType>(res)`. Keep the module DOM-free (the
   compile worker imports it).
5. Restart `npm run dev`; add the route to the API list of `README.md` / `README_ES.md`.

### Add a dialog to the editor

1. Markup: a `<dialog id="…">` next to the other dialogs at the end of `index.html` (usually a
   `<form method="dialog">` with Cancel/Apply buttons), styles in `src/styles/06-dialogs.css`, and a toolbar
   button if it needs one.
2. State: in the `Editor` constructor (`src/components/Editor.ts`) assign the element references
   (`this.fooDialog = document.getElementById('foo-dialog')`, …) and a `fooDialogState` object, and declare
   them as class fields. Call `this._initFooDialog()` from the constructor's list of `_init…` calls.
3. Behaviour: methods in a mixin, an existing one (`metadataDialogs.ts` for document metadata, `shaderDialogs.ts`
   for shader settings) or a new `src/components/editor/fooDialog.ts` exporting
   `fooDialogMixin = { … } satisfies ThisType<Editor>`, added to `Object.assign(Editor.prototype, …)` and to the
   `interface Editor extends …` line. The usual shape, as in `metadataDialogs.ts`:
   - `_initFooDialog()`: wire the buttons; on `close`, reset the dialog state and call
     `this._scheduleEditorFocusRestore()`.
   - `_openFooDialog()`: `this._rememberEditorFocusTarget()`, fill the fields from `this.currentDocument`,
     `this.fooDialog.showModal()`.
   - `_applyFooDialog()`: compute the next document with a `src/utils/markdown/mutations.ts` function,
     `this._applyDocument(nextDocument)`, `this._emitSessionStateChange()`, close; optionally save with
     `this._handleModify()` as the metadata dialog does.
4. Enable or disable its button in `Editor._updateButtonStates`; show feedback with `this._showToast()`.

### Add a console feature to the preview runtime

1. Protocol first: extend `src/types/runtime.ts` (a new `ConsoleMessageMethod`, a new message `kind` in
   `RuntimeBridgeMessage`, or a new command in `ConsoleCommandMessage`). The runtime cannot import values, so
   every string literal is written by hand on both ends.
2. Runtime: `learncodeRuntimeBridge` in `src/utils/renderer/runtimeBridgeRuntime.ts`, in the matching section
   ("Console capture", "Errors", "Parent commands (REPL + inspector)"…). Build messages with
   `createMessage(kind, level, fields)` and post them with `send()`; commands are dispatched by `action` in the
   `message` listener of "Parent commands". Keep the function self-contained (see
   [How TypeScript is used](#how-typescript-is-used)), read user values through the natives the runtime captures
   before user code runs, and respect `consoleEnabled` (with the console off only errors are sent).
3. App side: `Preview._handleRuntimeMessage` (`src/components/Preview.ts`) dispatches by `kind`; console
   entries are rendered by `src/components/preview/ConsoleManager.ts` (`_appendConsoleEntry`,
   `_createConsoleEntryElement`, `_renderConsoleParts`); commands are sent from `_executeConsoleCommand` /
   `_requestConsoleInspect` with `source: 'learncode-console-command'` and the current `renderId`.
4. Other receivers of the same messages: `TheoryExerciseDialog._handleFrameMessage` (the theory dialog's
   console) and `tools/verify-examples.ts` / `tools/verify-core.ts` (`problemsFromRuntimeMessages`,
   `consoleLinesFromMessages`). Decide for each one whether it handles the new kind.
5. Tests: `tests/runtime-bridge.test.ts` (runs the runtime in a `vm` context and asserts on the posted
   messages), `tests/runtime-document.test.ts`, `tests/tools-verify.test.ts`. The material snapshot shows the
   change as a single `runtime#source` difference. Check it in a real browser with the harness and `&logs=1`.

### Add a Vim shortcut

1. `src/editor/vimShortcutConfig.ts`: add the action name to `SHORTCUT_SCHEMA` under its context (`global`,
   `tabs`, `panels`, `shaders`) and bucket (`shift` = Shift+letter, `leader` = Space then a key, `leader2` =
   Space, Space then a key), its default key to `DEFAULT_VIM_SHORTCUT_CONFIG`, a help text to
   `ACTION_DESCRIPTIONS` and an entry to the right section of `SECTION_DEFINITIONS` (the shortcut help dialog).
   The action types are derived from the schema, so the compiler points at every place still missing it.
2. `src/editor/vimSupport.ts`: a callback in `VimViewBindings` and a `case` for the action in `bindVimView` (the
   Shift handler resolves with `resolveVimShiftAction`, the leader handler with `resolveVimLeaderAction`).
3. `Editor._createEditor` (`src/components/Editor.ts`): pass the callback to `bindVimView`. App-level actions
   (sidebar, layout, preview) go through a constructor callback of `Editor` that `src/main.ts` provides, like
   `onToggleSidebar`.
4. `vim-shortcuts.yaml`: add the default key so users see it (a missing key falls back to the default).
5. Tests in `tests/vim-support.test.ts` and `tests/ui-vim-shortcuts.test.ts`; the shortcut list in the README's
   Vim section.
