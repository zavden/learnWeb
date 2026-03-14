# LearnCode

Local application for studying web technologies from material organized in folders and Markdown files.

The app combines:

- a Vite frontend with vanilla JavaScript
- an Express backend
- code editing with CodeMirror 6
- Markdown theory rendering
- live preview inside an `iframe`
- local compilation for `Pug`, `SCSS`, `SASS`, `TypeScript`, React, and Vue
- local WebGL shader preview for `Vertex + Fragment` documents
- opt-in runtime console, exercise mode, and attempt-vs-solution comparison

The core idea is simple: content does not live in a database. It lives on disk inside the `material/` folder. The backend only reads and writes those files, while the frontend acts as explorer, editor, and viewer.

## Table of Contents

- [Summary](#summary)
- [AI Guide](#ai-guide)
- [Technologies](#technologies)
- [Overall Architecture](#overall-architecture)
- [How Content Is Organized](#how-content-is-organized)
- [File Format](#file-format)
- [App Workflow](#app-workflow)
- [Installation](#installation)
- [Development Run](#development-run)
- [Available Commands](#available-commands)
- [License](#license)
- [Backend API](#backend-api)
- [Project Structure](#project-structure)
- [Important Behavior Details](#important-behavior-details)
- [Current Limitations](#current-limitations)
- [Troubleshooting](#troubleshooting)

## Summary

This project works as a small local learning environment, similar to a mini CodePen plus a theory viewer.

It lets you:

- navigate a tree of chapters, sections, and topics
- read theory for each topic from a `main.md` file
- browse a gallery of saved examples for each topic
- open an example and edit only the panels it actually uses
- see a live preview of the result
- work with classic examples (`HTML`, `SVG`, `CSS`, `JavaScript`)
- treat `HTML` as a body fragment, with `HTML-B` as an explicit alias
- work with `HTML-FULL` when you need a full HTML document
- work with compiled examples (`Pug`, `SCSS`, `SASS`, `TypeScript`)
- work with React `single-file` and `multi-file`
- work with Vue `single-file`, `multi-file`, and controlled `.vue` SFCs
- work with `Vertex + Fragment` shader documents
- switch between vertical panels or tabs
- use an opt-in runtime console per example
- use a shader panel with FPS, resolution, pause, and reset
- use exercise mode with hints, hidden files, and solution comparison
- create, save, modify, rename, and delete examples
- create new chapters, sections, topics, and examples

## AI Guide

If an AI needs to learn how to edit this project, this is the recommended reading order:

1. Read [AGENTS.md](AGENTS.md).
   It contains the general routing rule for the repo and which file types to touch for each kind of task.
2. Read [skills/learnweb-repo-editing/SKILL.md](skills/learnweb-repo-editing/SKILL.md).
   This is the general local guide for the repository.
3. Read [skills/learnweb-repo-editing/references/hotspots.md](skills/learnweb-repo-editing/references/hotspots.md).
   That file is the detailed hotspot map for editor, preview, gallery, theory, shaders, backend, tests, and content.
4. If the task is specific, read only the matching specialized skill:
   - Markdown examples: [`.codex/skills/learnweb-example-authoring/SKILL.md`](.codex/skills/learnweb-example-authoring/SKILL.md)
   - theory `main.md`: [`.codex/skills/learnweb-theory-authoring/SKILL.md`](.codex/skills/learnweb-theory-authoring/SKILL.md)
   - shaders: [`.codex/skills/learnweb-shader-authoring/SKILL.md`](.codex/skills/learnweb-shader-authoring/SKILL.md)
5. Only after that should the AI open the exact hotspot files relevant to the task.

Practical rule:

- to understand the repo: `AGENTS.md` -> `skills/learnweb-repo-editing/SKILL.md` -> `hotspots.md`
- to edit content: then jump to `material/**`
- to edit app code: then jump to `src/**`, `index.html`, `server.js`, or `tests/**` depending on the hotspot

Recommended validation for an AI:

- content-only changes: targeted validation
- parser, editor, preview, backend, or metadata changes: `npm test`
- UI or runtime changes: `npm run build`

## Technologies

### Frontend

- Vite
- vanilla JavaScript with ES modules
- CodeMirror 6
- `marked` for Markdown rendering
- WebGL for shader preview
- React and ReactDOM for React modes
- Vue runtime and Vue compilers for Vue modes
- `Web Worker` for client-side compilation orchestration and caching

### Backend

- Node.js
- Express
- CORS
- Node runtime `fs` and `path` to operate on the filesystem
- `pug` to compile `Pug` examples
- `sass` to compile `SCSS` and `SASS`
- `typescript` to transpile `TypeScript`
- `esbuild` to compile `JSX`, `TSX`, and multi-file bundles
- `@vue/compiler-dom` and `@vue/compiler-sfc` for Vue templates and SFC support

## Overall Architecture

The app is split into two processes:

### 1. Frontend

Served by Vite at `http://localhost:5174`.

Responsibilities:

- draw the UI
- load the navigation tree
- load theory and examples
- show the gallery
- mount dynamic editor panels
- update the live preview
- orchestrate compilation with cache from a `Web Worker`
- show the runtime console and exercise panel
- call the backend API

### 2. Backend

Served by Express at `http://localhost:3001`.

Responsibilities:

- read the folder structure inside `material/`
- expose that structure as JSON
- read theory and examples
- create new folders and files
- modify, rename, and delete examples
- serve local topic assets
- compile examples before sending them to the preview
- cache repeated compilation results

### Communication Between Both

During development, Vite proxies `/api` routes to `http://localhost:3001`.

That means the frontend makes requests like:

```txt
/api/tree
/api/topic/chNN-chapter/secNN-section/topNN-topic/main
```

and Vite forwards them to the backend.

## How Content Is Organized

All content lives inside `material/`.

The hierarchy is:

```txt
material/
  chNN-chapter-name/
    secNN-section-name/
      topNN-topic-name/
        main.md
        examples/
          example-1.md
          example-2.md
        assets/
          topic-images-or-resources
```

### Naming Conventions

The backend expects these prefixes:

- `ch` for chapters
- `sec` for sections
- `top` for topics

Valid examples:

- `chNN-my-chapter`
- `sec01-selectors`
- `top01-class-selector`

The number is used for ordering and logical numbering. The rest of the name becomes the visible label in the UI, with dashes converted to spaces.

## File Format

### 1. Theory: `main.md`

Each topic has a `main.md` file with Markdown content.

Example:

```md
# Topic 01 - Class Selector

Topic explanation.

- Idea 1
- Idea 2
```

Theory is rendered with `marked` and appears in the side theory panel.

It can also be edited from the UI:

- the Theory header has a button that opens `main.md` in the editor
- if needed, the app switches to `Tabs` layout
- the right preview shows the rendered Markdown live
- `Save`, `Modify`, `Ctrl+S`, `Shift+S`, and `:w` save back to the real topic `main.md`

`main.md` also supports embedding exercises from the same topic with this syntax:

```md
[[exercise:ex01.md]]
```

That shortcode generates an inline card with a small preview, a larger popup, and a button that opens the real exercise.

### 2. Examples: `.md` files inside `examples/`

Each example is stored as structured Markdown. The parser does not work with arbitrary free text: it expects fenced code blocks with supported languages and, optionally, a simple frontmatter block at the top.

#### Classic Format

~~~~md
# HTML

```html
<h1>Hello</h1>
```

# CSS

```css
h1 {
  color: red;
}
```

# JavaScript

```javascript
console.log('Hello');
```
~~~~

#### Dynamic Sessions

The system supports combinations such as:

- only `HTML`
- only `HTML-B`
- only `HTML-FULL`
- `HTML + CSS`
- `HTML + CSS + JavaScript`
- `SVG + CSS`
- `Pug + SCSS`
- `Pug + TypeScript`
- `HTML + SASS + TypeScript`
- `Vertex + Fragment` with `renderer: shader`

The visible editor panels depend on the blocks actually present in the file.

`HTML` and `HTML-B` mean the same thing: content injected inside the generated `<body>`. You should not write `<!DOCTYPE html>`, `<html>`, `<head>`, or `<body>` inside those blocks.

`HTML-FULL` is different: it represents a full HTML document and the preview does not wrap it in another `<!DOCTYPE html><html>...</html>`. In that mode, styles and scripts must live inside the document itself; separate `CSS` or `JavaScript` blocks must not be mixed in.

#### Shader Documents

The system also supports shader documents based on two required blocks:

~~~~md
---
renderer: shader
resolution: 800x600
---

# Vertex

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

# Fragment

```fragment
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
```
~~~~

Shader mode rules:

- the canonical format is `Vertex + Fragment`
- `renderer: shader` is the recommended explicit path
- if there is exactly one `vertex` block and one `fragment` block, the parser also auto-detects the document as a shader
- `resolution: WIDTHxHEIGHT` defines the base canvas resolution
- `shader_textures` lets you declare samplers loaded from the topic `assets/`
- `HTML`, `CSS`, or `JavaScript` blocks are not mixed with shaders
- the runtime console is not used: the preview shows a dedicated shader panel

#### Simple Frontmatter

The file can start with simple metadata:

~~~~md
---
framework: react
mode: multi-file
entry: src/main.jsx
console: true
---
~~~~

Notes:

- the current parser supports simple `key: value` pairs
- it is not a full YAML parser
- it is used for framework, mode, entry, console, exercises, and progression

Most important supported keys:

- `framework: react | vue`
- `renderer: shader | web`
- `resolution: 800x600`
- `shader_uniforms: intensity:float=0.8[0,1.5,0.01]|invert:bool=false|focus:vec2=0.5,0.5`
- `shader_textures: u_checker=checker.svg|u_spot=spotlight.svg`
- `mode: multi-file`
- `entry: path/to/entry`
- `console: true | false`
- `exercise: true`
- `exercise_title`
- `exercise_instructions`
- `exercise_hints`
- `exercise_locked_files`
- `exercise_reference_files`
- `exercise_solution_files`
- `exercise_compare_pairs`
- `exercise_solution_example`
- `example_stage: minimal | intermediate | common-error | exercise | final-solution`
- `example_description: short text`
- `example_tags: html|css|svg`
- `example_rating: 1..5`
- `example_importance: trivial | useful | important | critical`

#### Editorial Metadata for Examples

Each example can also include editorial metadata to better describe its teaching value.

Example:

~~~~md
---
example_description: "Small responsive card with hover states"
example_tags: "html|css|layout"
example_rating: 4
example_importance: important
---
~~~~

Rules:

- `example_description` is a short sentence for overlays and compact summaries
- `example_tags` uses `|` as separator
- `example_rating` must be an integer between `1` and `5`
- `example_importance` accepts `trivial`, `useful`, `important`, or `critical`

From the UI, the `Meta` button in the editor opens a popup to create or edit these fields. If the example already exists on disk, `Apply` automatically runs `Modify`.

#### Multi-file Format

When a document uses virtual files, each file lives inside the same Markdown with `@file` headings.

Example:

~~~~md
---
framework: react
mode: multi-file
entry: src/main.jsx
console: true
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
export function App() {
  return <main>Hello</main>;
}
```

## @file src/styles.css
## @lang css
## @role style

```css
main { color: red; }
```
~~~~

Important fields:

- `@file`: virtual file path
- `@lang`: real file language
- `@role`: semantic role (`entry`, `app`, `component`, `style`, etc.)

#### React `single-file`

For React, the file uses `framework: react` and a `JSX` or `TSX` block.

Example:

~~~~md
---
framework: react
---

# JSX

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

# CSS

```css
button {
  padding: 10px 14px;
}
```
~~~~

In this mode:

- you do not write the base `HTML` manually
- you do not write `div#root`
- you do not write `ReactDOM.createRoot(...)`
- the platform generates the shell and mounts `App` automatically

When you save again, the system rebuilds the Markdown while preserving metadata and active blocks.

#### React and Vue Multi-file

The app already supports small multi-file projects inside a single `.md`:

- React multi-file with `jsx`, `tsx`, `js`, `ts`, `css`, `scss`, `sass`, and `json`
- Vue multi-file with `html`, `js`, `ts`, `css`, `scss`, `sass`, `json`, and `.vue`
- controlled Vue SFC support with `<template>`, `<script>`, `<script setup>`, `lang="ts"`, `<style scoped>`, `scss`, and `sass`

The editor can show them as:

- `Panels`: multiple files at once in a vertical stack
- `Tabs`: one active file at a time with tabs and a selector

### 3. Assets per Topic

Each topic can have an `assets/` folder.

That folder is used to store local topic resources, for example:

- images
- SVGs
- fonts
- helper files

The main preview injects a `<base>` tag so example HTML can reference those files using relative paths.

Example:

```html
<img src="diagram.png" alt="Diagram" />
```

If `diagram.png` exists in `assets/`, the main preview can resolve it from:

```txt
/api/topic/:ch/:sec/:top/assets/diagram.png
```

For multi-file `React` and `Vue` projects, the current policy is:

- virtual `JSON` inside the same Markdown: supported
- virtual images, fonts, or binary assets inside the same Markdown: not supported
- simple local resources in the topic `assets/`: supported by relative URL

### 4. External Favorites

Favorites do not live in the example frontmatter. They are stored separately in [`.favorites`](./.favorites), at the root of the project.

Characteristics:

- they store Markdown paths, not copies of the content
- they do not modify the original file
- they work across different topics
- if a favorite stops existing, it still appears as a `missing` card

From the UI:

- the star in the editor adds or removes the current example
- the `Favorites` button in the tree opens a popup with all favorites
- each favorite card allows `Open` or `Remove`

## App Workflow

### 1. Initial Load

On startup:

- the main frontend components are built
- the editor, preview, gallery, and theory viewer are created
- `/api/tree` is called
- the sidebar is populated with the chapter, section, and topic tree

### 2. Topic Selection

When you click a topic:

- the app stores the current topic path
- the editor and preview become bound to that topic
- `main.md` is loaded as theory
- the topic examples are loaded
- the gallery is shown instead of the editor

### 3. Opening an Example

When you choose an example from the gallery, from `Open File`, or from `Favorites`:

- the Markdown file is requested from the backend
- blocks and metadata are parsed
- each visible block is loaded into its editor
- the preview updates automatically

### 4. Editing and Preview

Every time you change code:

- the editor triggers a callback
- the preview waits 300 ms
- a compilation client with `Web Worker` cache reuse calls the backend if needed
- a full HTML document is rebuilt inside the preview `iframe`
- the compiled output is injected

The top area of the preview can also show a compact editorial summary for the active example:

- short description
- tags
- star rating
- importance

That block can be shown or hidden with the `Show Info / Hide Info` toggle in the tree.

If `console: true` is active in the example:

- a console appears below the preview
- it captures `console.log/info/warn/error`
- it captures `window.onerror` and `unhandledrejection`
- it allows manual command execution
- it keeps per-example history and supports filters, zoom, and resize

If the document uses `renderer: shader`:

- the preview switches to the WebGL pipeline
- it renders a fullscreen quad with `Vertex + Fragment`
- the console is replaced by a shader panel
- the panel shows `FPS`, effective resolution, built-in uniforms, custom uniforms, and texture status
- editable controls live in a collapsible drawer on the editor side
- the shader starts paused by default

The gallery also uses editorial metadata:

- hovering a card shows an overlay with description, tags, rating, and importance
- that overlay can be hidden globally with `Hide Info / Show Info` in the gallery itself

#### Custom Uniforms in Shaders

Shader V1 also supports metadata-defined uniforms:

~~~~md
---
renderer: shader
resolution: 960x540
shader_uniforms: intensity:float=0.8|invert:bool=false|focus:vec2=0.5,0.5
---
~~~~

Current format:

- `name:type=value`
- or `name:type=value[min,max,step]` for `float` and `int`
- uniforms are separated by `|`
- supported types:
  - `float`
  - `int`
  - `bool`
  - `vec2`
  - `vec3`
  - `vec4`

Rules:

- you cannot redefine built-ins such as `u_time` or `u_resolution`
- if a declaration is invalid, a diagnostic is shown and the uniform is ignored
- the shader panel creates controls automatically for those uniforms
- the runtime applies them only if the shader actually declares those uniforms
- `float` and `int` can declare an optional range and the panel will show a slider
- `vec3` and `vec4` are edited as grouped numeric values

#### Local Shader Textures

Shader V1 also supports metadata-defined samplers loaded from the current topic `assets/` folder:

~~~~md
---
renderer: shader
resolution: 960x540
shader_textures: u_checker=checker.svg|u_spot=spotlight.svg
---
~~~~

Current format:

- `uniformName=asset-file`
- textures are separated by `|`
- supported extensions:
  - `.png`
  - `.jpg`
  - `.jpeg`
  - `.gif`
  - `.webp`
  - `.avif`
  - `.bmp`
  - `.svg`

Rules:

- the file must exist in the current topic `assets/`
- currently only files in the root of `assets/` are supported, not subfolders
- the shader panel shows load state and dimensions when the texture is ready
- the runtime assigns one texture unit per declaration and connects it to the uniform with the same name
- if the shader does not declare that sampler, the texture still loads but does not affect the program

### 5. Saving

There are two different flows:

#### `Save`

`Save` creates a new file inside `examples/`.

The backend generates the filename with a timestamp, for example:

```txt
mar-12-2026-23:10:45.md
```

This is useful to create a new version or a new example from the current editor state.

#### `Modify`

`Modify` overwrites the file currently loaded.

It is only enabled if you already opened or just created/saved a file.

Useful notes:

- if you are editing `main.md` from Theory, `Modify` saves the current topic theory
- if you apply changes from the `Meta` popup and the example already exists, the app automatically runs `Modify`

### 6. Rename and Remove

- `Rename` changes the current filename
- `Remove` deletes it from the filesystem

### 7. Create

The creation dialog can create:

- `Chapter`
- `Section`
- `Topic`
- `Example`

Rules:

- a `Chapter` is created directly inside `material/`
- a `Section` is created inside a chapter
- a `Topic` is created inside a section
- an `Example` is created as a `.md` file inside `examples/`

When you create a `Topic`, the backend also creates:

- `examples/`
- `assets/`
- `main.md`

When you create an `Example`, the backend generates a minimal template according to the chosen preset.

Current presets include:

- classic sessions
- shaders (`shader-basic`, `shader-time`, `shader-mouse`, `shader-frame`, `shader-custom-uniforms`, `shader-vector-uniforms`, `shader-ranged-uniforms`, `shader-textures`)
- sessions with `SCSS`, `SASS`, and `TypeScript`
- React `single-file`
- React `multi-file`
- Vue `single-file`
- Vue `multi-file`
- Vue SFC

## Installation

### Requirements

- Node.js 18 or newer recommended
- npm

### 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd learnWeb
```

### 2. Install Dependencies

```bash
npm install
```

This installs both frontend and backend dependencies defined in `package.json`.

### 3. Verify That `material/` Exists

The project depends on `material/` as the source of content. It must exist at the root of the repo.

If you delete it, the backend will not be able to build the navigation tree.

## Development Run

The normal way to use the project is:

```bash
npm run dev
```

That command starts, at the same time:

- Vite at `http://localhost:5174`
- Express at `http://localhost:3001`

Then open:

```txt
http://localhost:5174
```

## Available Commands

### `npm run dev`

Runs the frontend and backend in parallel for development.

### `npm run build`

Generates the frontend production build with Vite.

Important:

- this command does not package or deploy the backend
- the project does not include a full production deployment strategy out of the box

### `npm test`

Runs the full automated suite with `node --test`.

### `npm run test:watch`

Runs the suite in watch mode.

### `npm run preview`

Runs the static preview of the frontend generated by Vite.

Important:

- it does not start `server.js`
- it does not replace the full development workflow
- to use the app normally, you still need the backend

## License

This project is published under `AGPL-3.0-only`. The full text is in [LICENSE](./LICENSE).

I chose it because it is the closest standard license to this goal:

- anyone can read, use, and modify the code
- if someone distributes a modified version, they must keep the license and notices
- if someone runs a modified version as a network service, they must offer the corresponding source code

Important:

- this is closer to your goal than plain `GPL`
- by itself it does not force visible credit in every UI or final product
- if later you want stronger visible attribution, you would need additional terms

## Backend API

### `GET /api/tree`

Returns the full navigation tree.

### `GET /api/topic/:ch/:sec/:top/main`

Returns the content of `main.md`.

### `PATCH /api/topic/:ch/:sec/:top/main`

Overwrites the current topic `main.md`.

Body:

```json
{
  "content": "# Theory\n\nUpdated text"
}
```

### `GET /api/topic/:ch/:sec/:top/examples`

Returns the list of `.md` files inside `examples/`.

### `GET /api/topic/:ch/:sec/:top/examples/:file`

Returns the content of a specific example.

### `POST /api/topic/:ch/:sec/:top/examples`

Creates a new example using the content received in the request body:

```json
{
  "content": "..."
}
```

The backend assigns a timestamp-based filename.

### `PATCH /api/topic/:ch/:sec/:top/examples/*`

Overwrites the content of an existing example.

Body:

```json
{
  "content": "..."
}
```

### `DELETE /api/topic/:ch/:sec/:top/examples/*`

Deletes an existing example.

### `PUT /api/topic/:ch/:sec/:top/examples/*`

Renames an example.

Body:

```json
{
  "newFilename": "new-name.md"
}
```

### `POST /api/create`

Creates chapters, sections, topics, or examples.

Body:

```json
{
  "type": "chapter | section | topic | example",
  "name": "name",
  "parentPath": "optional/path",
  "sessionPreset": "optional"
}
```

### `POST /api/compile`

Compiles a source document and returns:

- `document`
- `compiledDocument`
- `compileDiagnostics`

This is the route used by the preview to support:

- `Pug`
- `SCSS`
- `SASS`
- `TypeScript`
- React `single-file` and `multi-file`
- Vue `single-file`, `multi-file`, and `.vue`

It also returns `compileMeta` with cache information when applicable.

### `GET /api/topic/:ch/:sec/:top/assets/:file`

Serves a file inside the current topic `assets/` folder.

### `GET /api/favorites`

Returns the current state of [`.favorites`](./.favorites):

- `items`: stored paths exactly as they live in the file
- `entries`: resolved cards, including `exists`, `topicPath`, and `filename` when applicable

### `POST /api/favorites`

Adds an example to favorites.

Body:

```json
{
  "path": "material/chNN-chapter/secNN-section/topNN-topic/examples/exNN.md"
}
```

### `DELETE /api/favorites`

Removes an example from favorites.

Body:

```json
{
  "path": "material/chNN-chapter/secNN-section/topNN-topic/examples/exNN.md"
}
```

### `GET /api/editor/vim-shortcuts`

Returns the effective configuration of [vim-shortcuts.yaml](./vim-shortcuts.yaml), including fallback to the default map when the file is missing or invalid.

## Project Structure

```txt
learnWeb/
  index.html
  .favorites
  package.json
  package-lock.json
  vite.config.js
  server.js
  material/
  src/
    main.js
    style.css
    config/
      exampleBlocks.js
      fileTemplates.js
    components/
      Sidebar.js
      TheoryViewer.js
      Editor.js
      ExercisePanel.js
      Preview.js
      Gallery.js
      CreateDialog.js
    utils/
      api.js
      compileCache.js
      compileClient.js
      exerciseComparison.js
      exampleEditorial.js
      markdown.js
      exampleCompiler.js
      exampleRenderer.js
      theoryExerciseEmbeds.js
    workers/
      compileWorker.js
  tests/
    metadata-validation.test.mjs
    document-roundtrip.test.mjs
    framework-compilation.test.mjs
    example-editorial.test.mjs
    favorites-store.test.mjs
    theory-document.test.mjs
    theory-exercise-embeds.test.mjs
```

### Important File Descriptions

#### `server.js`

Express backend. Reads and writes the filesystem, builds the tree, creates content, compiles documents, and serves assets.

#### `src/main.js`

Frontend entry point. Instantiates and coordinates all components.

#### `src/components/Sidebar.js`

Builds the side tree with chapters, sections, and topics.

#### `src/components/TheoryViewer.js`

Fetches `main.md`, renders it as HTML from Markdown, and resolves inline exercise embeds.

#### `src/components/Editor.js`

Configures dynamic CodeMirror panels, supports `Panels/Tabs` layout, exercise mode, virtual files, GLSL highlighting for `vertex` and `fragment`, and handles save, load, modify, rename, and delete.

#### `src/components/ExercisePanel.js`

Top panel for exercise mode: instructions, hints, comparison, and reveal controls.

#### `src/components/Preview.js`

Coordinates compilation, the runtime console, the shader panel, and builds the final document injected into the preview `iframe`.

#### `src/components/Gallery.js`

Shows cards with mini previews for topic examples, editorial overlays, and progression states.

#### `src/components/CreateDialog.js`

Handles the dialog to create new content nodes.

#### `src/utils/api.js`

Client-side access layer for the backend API.

#### `src/utils/exampleEditorial.js`

Formatting helpers for description, rating, and importance in editorial metadata.

#### `src/utils/compileClient.js`

Frontend compilation client. Uses `Web Worker` plus direct backend fallback.

#### `src/utils/compileCache.js`

Helpers for stable keys and serializable cloning of compilation results.

#### `src/utils/exerciseComparison.js`

Resolves attempt/solution pairs and generates line-level comparisons for exercise mode.

#### `src/utils/markdown.js`

Parser and generator for the Markdown format used by examples, including simple metadata.

#### `src/utils/exampleCompiler.js`

Compilation pipeline for `Pug`, `SCSS`, `SASS`, `TypeScript`, React, and Vue.

#### `src/utils/exampleRenderer.js`

Converts a compiled document into the final `srcdoc` for the preview `iframe`.

#### `src/utils/theoryExerciseEmbeds.js`

Extracts `[[exercise:...]]`, generates inline embeds, and prepares small previews for Theory.

#### `src/workers/compileWorker.js`

Frontend worker used to cache and deduplicate repeated compilations.

## Important Behavior Details

### Difference Between Theory and Examples

- theory lives in `main.md`
- examples live in `examples/*.md`

Theory can now be edited from the UI:

- the Theory panel has a button that opens `main.md` inside the editor
- when you finish, a checkmark in the preview closes that session and restores the previous example or gallery
- `main.md` can also embed topic exercises with `[[exercise:file.md]]`

### Content Is Editable Directly on Disk

Because there is no database:

- you can version `material/` with Git
- you can create or modify files manually outside the app
- when the app reloads, the tree is rebuilt from the filesystem

### The Gallery Is Not Just a List

Each card tries to load the example, compile it if needed, and render a mini preview in an `iframe`.

Also:

- it can show editorial metadata on hover
- it can hide that overlay without disabling normal card clicks
- favorites reuse the same preview model

### Editors Are Dynamic

The interface no longer assumes three fixed panels.

Depending on the loaded example, it can show:

- `HTML`
- `SVG`
- `Pug`
- `CSS`
- `SCSS`
- `SASS`
- `JavaScript`
- `TypeScript`
- `JSX`
- `TSX`

It also includes:

- vertical resize between panels
- switching between `Panels` and `Tabs`
- panel collapse
- panel maximize
- increase and decrease font size
- panel auto-fit based on content
- GLSL highlighting for `Vertex` and `Fragment`

### Vim Mode

The editor can work in Vim mode and starts enabled by default if `.vim_enable` is `true`.

Current behavior:

- Vim works in both `Tabs` and `Panels`
- the top Vim toggle lets you disable it temporarily for the current session
- the sidebar has a global `Vim Default` switch persisted in `.vim_enable`
- the system clipboard also has a global mode in `.clipboard_default`
- the shortcut map can be overridden from [vim-shortcuts.yaml](./vim-shortcuts.yaml)
- there is a floating mode indicator (`NORMAL`, `INSERT`, `VISUAL`, `VISUAL BLOCK`, etc.)

`vim-shortcuts.yaml` uses the contexts `global`, `tabs`, `panels`, and `shaders`, with the buckets `shift`, `leader`, and `leader2`. If the file is missing or invalid, the app automatically falls back to the default map.

Project-specific Vim shortcuts:

- `Shift+H`: previous tab in `Tabs`, or open `Open File` in `Panels`
- `Shift+L`: next tab in `Tabs`, or toggle auto-render in `Panels`
- `Shift+J`: open `Open File` in `Tabs`, or move to the next panel in `Panels`
- `Shift+K`: toggle auto-render in `Tabs`, or move to the previous panel in `Panels`
- `Shift+X`: show or hide the preview top bar
- `Shift+C`: show or hide the preview console in web examples
- `Space` then `e`: show or hide the tree
- `Space` then `m`: collapse the tree and set editor/preview to `50/50`
- `Space` then `h`: run `:noh`
- `Space` then `c`: collapse or expand the active panel in `Panels`
- `Space` then `x`: maximize or restore the active panel in `Panels`
- `Space` then `a`: run `auto-fit` in `Panels`
- `Space` then `v`: normalize `Panels` and make windows evenly sized
- `Space` then `Space` then `v`: toggle between `Tabs` and `Panels`
- `Space` then `Space` then `n`: open the contextual shortcut list

Notes for `Panels`:

- the active panel is highlighted and drives the global Vim mode indicator
- if you are in `Panels` and a panel is maximized, `Shift+J/K` transfer that maximize to the next or previous panel
- `Shift+J/K` work with normal, collapsed, and maximized panels
- `Shift+J/K` cycle vertically: from the last panel they jump back to the first, and vice versa
- `Space x` remains the explicit way out of maximize mode

Additional shader shortcuts:

- `Space` then `Space` then `p`: pause or resume the shader
- `Space` then `Space` then `c`: show or hide `Shader Controls`
- `Space` then `Space` then `u`: open the `Shader Uniforms` dialog
- `Space` then `Space` then `t`: open the `Shader Textures` dialog
- `Space` then `Space` then `s`: open the preview shader panel and adjust its height
- `Space` then `Space` then `r`: reset the shader runtime

The system clipboard can be enabled or disabled from the blue toggle in the toolbar. When enabled, Vim yanks and pastes are synced with the system clipboard; when disabled, Vim uses a local shadow clipboard.

### Exercise Mode

When `exercise: true` is present:

- a top panel with instructions appears
- progressive hints can exist
- locked, reference, or solution files may be hidden
- you can compare attempt vs solution
- the comparison can come from the same Markdown or from another linked example

The gallery also supports `example_stage` to order and label examples as didactic progression.

### Runtime Console

The console does not always appear. It only activates if the example defines:

```md
---
console: true
---
```

Current capabilities:

- logs, warnings, and errors
- rejected promises
- manual command execution
- level filters
- font zoom
- collapse and resize
- more readable runtime stacks
- deduplication of repeated errors

### Shader Mode

When the document is a shader:

- the preview uses WebGL instead of the usual HTML pipeline
- the bottom panel changes from `Console` to `Shader`
- editable controls live in a collapsible drawer at the bottom of the editor
- the shader starts paused by default
- the runtime exposes these built-in uniforms:
  - `u_time`
  - `u_delta`
  - `u_resolution`
  - `u_mouse`
  - `u_mouse_pressed`
  - `u_frame`
- the editor drawer allows:
  - changing `width` and `height` with sliders or numeric inputs
  - editing custom uniforms
  - inspecting local texture state
- the bottom panel allows:
  - viewing `FPS`, effective resolution, and `frame`
  - choosing resolution presets
  - pausing, resuming, and resetting the runtime
  - inspecting built-in uniforms
- if you save or use `Ctrl+S`, the current shader resolution is persisted in `resolution: WIDTHxHEIGHT`

Ready-to-test examples:

- [ex01.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex01.md)
- [ex02.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex02.md)
- [ex03.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex03.md)
- [ex04.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex04.md)
- [ex05.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex05.md)
- [ex06.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex06.md)
- [ex07.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex07.md)
- [ex08.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex08.md)

### Responsive Preview

The preview panel has two width layers:

- the overall preview panel width, controlled by the editor/preview splitter
- the internal `iframe` width, controlled by presets or a manual slider

If the internal viewport is narrower than the overall panel, a black background is shown behind it.

### React and Vue

The project already covers two pedagogical levels:

- atomic `single-file` examples
- small `multi-file` projects inside a single Markdown file

Ready-to-test examples:

- [react-jsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-jsx.md)
- [react-jsx-css.md](material/ch00-tests/sec00-test/top00-test/examples/react-jsx-css.md)
- [react-tsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-tsx.md)
- [react-tsx-css.md](material/ch00-tests/sec00-test/top00-test/examples/react-tsx-css.md)
- [vue-javascript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-javascript.md)
- [vue-typescript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-typescript.md)
- [react-project-jsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-project-jsx.md)
- [react-project-tsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-project-tsx.md)
- [vue-project-javascript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-project-javascript.md)
- [vue-project-sfc-typescript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-project-sfc-typescript.md)

#### React Limitations

- React `single-file` only uses one `JSX` or `TSX` block
- React `single-file` does not support `import` or `export`
- React `single-file` requires a top-level component named `App`
- React `single-file` does not use separate `HTML`, `JavaScript`, or `TypeScript` blocks; the HTML shell and mounting are generated automatically
- React `multi-file` supports virtual `json`, but not virtual binary assets inside the same Markdown

#### Vue Limitations

- Vue `single-file` does not use `.vue`; it uses an `HTML` block as template and a `JavaScript` or `TypeScript` block with `export default`
- Vue `single-file` does not support relative imports
- Vue `single-file` only accepts `HTML` as template; `SVG`, `Pug`, or `HTML-FULL` do not apply to that mode
- Vue `multi-file` requires a valid `entry` in `JavaScript` or `TypeScript`
- `.vue` SFC files only exist in `multi-file` mode
- Vue SFC support is controlled: normal HTML `<template>`, `<script>` or `<script setup>` in JS/TS, and normal styles or `scss`/`sass`
- Vue SFC does not support `template src`, `script src`, `style src`, CSS modules, or custom blocks
- Vue `multi-file` supports virtual `json`, but not virtual binary assets inside the same Markdown

## Current Limitations

- there is no authentication or permission system
- there is no database
- `npm run preview` does not represent a full production deployment

Current technical limitations:

- frontmatter is not full YAML; it only supports simple `key: value` pairs
- React `single-file` only supports one `JSX` or `TSX` block
- React `single-file` does not support `import` or `export`
- React `single-file` requires a top-level `App` function or component
- Vue `single-file` does not use `.vue` and requires `HTML` as template
- Vue `single-file` does not support relative imports
- Vue `multi-file` requires a valid `entry` in `JavaScript` or `TypeScript`
- multi-file `React` and `Vue` projects do support virtual `json` files
- multi-file projects still do not support virtual binary assets such as `png`, `jpg`, `woff`, or `mp4`
- shader documents are V1: one canvas and one pass
- shader mode still does not support multipass, ping-pong framebuffers, or audio-reactive shaders
- shader mode does not support virtual files or multi-file shader projects
- shaders only support simple metadata-defined uniforms (`float`, `int`, `bool`, `vec2`, `vec3`, `vec4`)
- metadata sliders only apply to `float` and `int` uniforms
- metadata-driven shader textures only support files from the current topic and do not support subfolders inside `assets/`
- shaders do not yet support arrays or structs as metadata-defined uniforms
- Vue SFC support is controlled: no `template src`, `script src`, `style src`, CSS modules, or custom blocks
- for images and local resources, you must use the topic `assets/` folder
- the React preview bundle is large because it packages runtime code into each example
- some API routes encode filenames and some do not, so exotic names can still cause issues
- compilation still really happens in the backend; the current `Web Worker` orchestrates cache and deduplication, but does not replace the server compiler yet

## Troubleshooting

### The App Opens but Does Not Load Data

Check:

- that `npm run dev` is running
- that Vite is on `5174`
- that Express is on `3001`
- that the `material/` folder exists

### The Sidebar Appears Empty

Possible causes:

- `material/` does not exist
- the folder structure does not respect the `ch`, `sec`, `top` prefixes
- the backend is not running

### The Preview Does Not Show Images or Resources

Check:

- that the file exists in `assets/`
- that the current topic is correct
- that you use a valid relative path from the example HTML

### A React Example Does Not Render

Check:

- that the file has `framework: react` in frontmatter
- that there is exactly one `JSX` or `TSX` block
- that the file defines a top-level `App` component
- that you do not use `import` or `export` in `single-file`
- that compile errors are not shown in the editor status bar

### A Vue Example Does Not Render

Check:

- that the file has `framework: vue` when needed
- that `single-file` mode uses `HTML` as template
- that `single-file` mode exports `default`
- that `multi-file` mode has a valid `entry`
- that a `.vue` file is not using unsupported features

### The Console Does Not Appear

Check:

- that the example has `console: true`
- that you are in the editor, not only in the gallery
- that the console is not collapsed

### `Modify`, `Rename`, or `Remove` Are Disabled

That is expected if no active file has been loaded yet. You must first:

- load an existing example
- or save a new one with `Save`

### I Want to Create Content Manually

You can do it directly on disk while respecting this structure:

```txt
material/chNN-my-chapter/secNN-my-section/topNN-my-topic/
  main.md
  examples/
    ex01.md
  assets/
```

Then reload the app so the backend reads the tree again.

## Current Repository State

The repository already includes ready-to-use content under `material/`, especially test material and templates, so you can open the app and exercise the workflow without creating everything from scratch.

The current automated suite covers:

- parser and metadata
- serialization round-trip
- representative compilation for legacy, React, and Vue modes
- exercises, console, and basic rendering
