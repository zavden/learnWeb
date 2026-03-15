---
name: learnweb-example-authoring
description: Complete reference for creating and editing LearnWeb example files under material/**/examples/*.md. Covers every supported format (vanilla, React, Vue, SVG, HTML-FULL, shader, exercise), frontmatter metadata, virtual file syntax, and validation rules.
---

# LearnWeb Example Authoring

## Overview

Use this skill when creating, editing, or reviewing runnable example files stored as Markdown under `material/**/examples/*.md`. Each example is a self-contained document that the app parses, compiles, and renders in a live preview.

## Directory Structure

```
material/
  ch01-templates/
    sec01-vanilla/
      top06-html-css-javascript/
        main.md                    # theory (see theory-authoring skill)
        examples/
          ex01.md                  # example files
          ex02.md
        assets/                    # optional images, textures, etc.
          texture.png
```

- Examples MUST live inside `examples/` within a topic folder.
- Assets MUST live inside `assets/` within the same topic folder.
- Filenames are free-form `.md` files. Convention: `ex01.md`, `ex02.md`, or descriptive names like `counter-basic.md`.

## Two Architectures

LearnWeb examples use one of two markdown structures:

### 1. Legacy Blocks (single-file or few blocks)

```markdown
# HTML

```html
<div>content</div>
```

# CSS

```css
body { margin: 0; }
```

# JavaScript

```javascript
console.log('hello');
```
```

Each block is a level-1 heading (`# HTML`, `# CSS`, etc.) followed by a fenced code block.

### 2. Virtual Files (multi-file projects)

```markdown
## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import { createRoot } from 'react-dom/client';
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
export function App() { return <h1>Hello</h1>; }
```
```

Each file starts with `## @file path`, `## @lang language`, optional `## @role role`, followed by a fenced code block.

---

## Format Reference: Vanilla (Legacy Blocks)

### HTML + CSS + JavaScript

```markdown
---
console: true
---

# HTML

```html
<button id="btn" type="button">Click me</button>
```

# CSS

```css
body { margin: 0; padding: 16px; background: #f8fafc; }
```

# JavaScript

```javascript
document.getElementById('btn').addEventListener('click', () => {
  console.log('clicked');
});
```
```

All three blocks are optional. You can have HTML-only, CSS-only, JS-only, or any combination.

### Supported Legacy Block Types

| Heading | Language | Compiles To |
|---------|----------|-------------|
| `# HTML` | `html` | HTML |
| `# Pug` | `pug` | HTML (via Pug compiler) |
| `# SVG` | `svg` | SVG element |
| `# HTML-FULL` | `html` | Complete HTML document |
| `# CSS` | `css` | CSS |
| `# SCSS` | `scss` | CSS (via Sass compiler) |
| `# SASS` | `sass` | CSS (via Sass compiler) |
| `# JavaScript` | `javascript` | JavaScript |
| `# TypeScript` | `typescript` | JavaScript (via esbuild) |
| `# JSX` | `jsx` | JavaScript (React single-file) |
| `# TSX` | `tsx` | JavaScript (React single-file) |
| `# Vertex` | `vertex` | GLSL vertex shader |
| `# Fragment` | `fragment` | GLSL fragment shader |

### Valid Vanilla Combinations

- `HTML` alone, `CSS` alone, `JavaScript` alone
- `HTML` + `CSS`, `HTML` + `JavaScript`, `CSS` + `JavaScript`
- `HTML` + `CSS` + `JavaScript` (most common)
- `Pug` + `SCSS`, `Pug` + `CSS`, `HTML` + `SCSS`, etc.
- `HTML` + `CSS` + `TypeScript`
- `SVG` alone, `SVG` + `CSS`, `SVG` + `CSS` + `JavaScript`
- `HTML-FULL` alone (complete document, no other blocks)

---

## Format Reference: HTML-FULL

A complete HTML document in a single block. No other blocks allowed.

```markdown
# HTML-FULL

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Full Document</title>
  <style>body { margin: 0; }</style>
</head>
<body>
  <h1>Complete document</h1>
  <script>console.log('ready');</script>
</body>
</html>
```
```

---

## Format Reference: SVG

Standalone SVG element. Rendered on black background with white SVG area.

```markdown
# SVG

```svg
<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="80" cy="60" r="40" fill="#58a6ff" />
</svg>
```
```

Can optionally include `# CSS` and `# JavaScript` blocks for styling and interactivity.

---

## Format Reference: React Single-File

```markdown
---
framework: react
---

# JSX

```jsx
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```
```

- Frontmatter: `framework: react` (required).
- `React` is globally available. No import needed for `React.useState`, etc.
- Can add optional `# CSS` or `# SCSS` block.
- Can use `# TSX` instead of `# JSX`.

---

## Format Reference: React Multi-File

```markdown
---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
import React from 'react';

export function App() {
  return <h1>Hello from React multi-file</h1>;
}
```

## @file src/styles.css
## @lang css
## @role style

```css
body { margin: 0; padding: 16px; }
```
```

**Required frontmatter**: `framework: react`, `mode: multi-file`, `entry: src/main.jsx`.

**Allowed languages**: `jsx`, `tsx`, `javascript`, `typescript`, `css`, `scss`, `sass`, `json`.

**Entry languages**: `jsx`, `tsx`, `javascript`, `typescript`.

**Allowed roles**: `entry`, `app`, `component`, `page`, `util`, `hook`, `reducer`, `context`, `config`, `style`, `script`, or omitted.

**Import rules**:
- `import React from 'react'` and `import { createRoot } from 'react-dom/client'` are provided by the runtime.
- Relative imports between files use `./path.ext` with full extension.
- JSON files can be imported directly: `import data from './data.json'`.

---

## Format Reference: Vue Single-File

```markdown
---
framework: vue
---

# HTML

```html
<section>
  <h1>{{ title }}</h1>
  <button @click="count++">Count: {{ count }}</button>
</section>
```

# JavaScript

```javascript
import { ref } from 'vue';

export default {
  setup() {
    const title = ref('Vue Counter');
    const count = ref(0);
    return { title, count };
  },
};
```

# CSS

```css
body { margin: 0; padding: 16px; }
```
```

- Frontmatter: `framework: vue` (required).
- `# HTML` block contains the Vue template.
- `# JavaScript` block contains the component definition (Composition API).
- Optional `# CSS` block.
- Can use `# TypeScript` instead of `# JavaScript`.

---

## Format Reference: Vue Multi-File

```markdown
---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

createApp(App).mount('#app');
```

## @file src/App.vue
## @lang vue
## @role app

```vue
<template>
  <main>
    <h1>{{ title }}</h1>
  </main>
</template>

<script setup>
const title = 'Vue Multi-File';
</script>

<style scoped>
main { padding: 16px; }
</style>
```

## @file src/styles.css
## @lang css
## @role style

```css
body { margin: 0; }
```
```

**Required frontmatter**: `framework: vue`, `mode: multi-file`, `entry: src/main.js`.

**Allowed languages**: `html`, `javascript`, `typescript`, `css`, `scss`, `sass`, `json`, `vue`.

**Entry languages**: `javascript`, `typescript`.

**Vue SFC files** (`@lang vue`): Use standard `<template>`, `<script setup>`, `<style scoped>` format.

**Non-SFC Vue files**: Can split template into `.html` files with `@role markup` and logic into `.js` files with render function import.

---

## Format Reference: Shader

```markdown
---
renderer: shader
resolution: 800x600
shader_uniforms: intensity:float=0.8[0,1.5,0.01]|color:vec3=1.0,0.5,0.2
shader_textures: u_texture=noise.png
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

uniform vec2 u_resolution;
uniform float u_time;
uniform float intensity;
uniform vec3 color;
uniform sampler2D u_texture;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv * intensity, 0.5, 1.0);
}
```
```

**Required frontmatter**: `renderer: shader`, `resolution: WIDTHxHEIGHT`.

**Blocks**: Exactly one `# Vertex` and one `# Fragment`. No other blocks.

**Built-in uniforms** (always available, do NOT redeclare in shader_uniforms):
- `u_time` (float) — elapsed seconds
- `u_delta` (float) — frame delta
- `u_resolution` (vec2) — canvas size
- `u_mouse` (vec2) — mouse position in pixels
- `u_mouse_pressed` (float) — 0.0 or 1.0
- `u_frame` (float) — frame counter

**Custom uniform syntax**: `name:type=default` or `name:type=default[min,max,step]`
- Types: `float`, `int`, `bool`, `vec2`, `vec3`, `vec4`
- Multiple uniforms separated by `|`
- Vec components separated by `,`: `center:vec2=0.5,0.5`

**Texture syntax**: `uniformName=assetFilename` separated by `|`. Assets from topic `assets/` folder.

---

## Format Reference: Exercise

Exercises use any of the formats above with additional frontmatter.

### Vanilla Exercise

```markdown
---
exercise: true
exercise_title: "Complete the card"
exercise_instructions: "Add an h2 with your name || Style the card with a border || Keep styles.css locked"
exercise_hints: "Use border-radius for rounded corners"
exercise_locked_files: styles.css
exercise_solution_example: exercise-solution.md
example_stage: exercise
---

# HTML

```html
<div class="card">
  <!-- TODO: Add your h2 here -->
</div>
```

# CSS

```css
.card { padding: 20px; }
```
```

### React Multi-File Exercise

```markdown
---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_title: "Build the profile component"
exercise_instructions: "Render the name from JSON || Add a skill list"
exercise_hints: "Import the JSON file at the top"
exercise_locked_files: src/styles.css
exercise_compare_pairs: src/App.jsx=>src/solution/AppSolution.jsx
exercise_reference_files: src/data/profile.json
exercise_solution_files: src/solution/AppSolution.jsx
example_stage: exercise
---
```

**Exercise frontmatter keys**:

| Key | Required | Format |
|-----|----------|--------|
| `exercise` | yes | `true` |
| `exercise_title` | yes | `"text"` |
| `exercise_instructions` | yes | `"step1 \|\| step2 \|\| step3"` |
| `exercise_hints` | no | `"hint1 \|\| hint2"` |
| `exercise_locked_files` | no | `file1,file2` or `file1\|file2` |
| `exercise_solution_example` | no | `filename.md` (separate solution file) |
| `exercise_compare_pairs` | no | `left=>right` (side-by-side diff) |
| `exercise_reference_files` | no | `file1,file2` (revealable references) |
| `exercise_solution_files` | no | `file1,file2` (solution files) |
| `example_stage` | yes | `exercise` |

The solution file is a separate `.md` in the same `examples/` folder, using the same format but with the completed code.

---

## Frontmatter Reference (All Types)

### Universal Metadata

| Key | Values | Purpose |
|-----|--------|---------|
| `example_description` | `"text"` | Short description for gallery |
| `example_tags` | `"tag1\|tag2\|tag3"` | Discovery tags (pipe-separated) |
| `example_rating` | `1` to `5` | Editorial quality rating |
| `example_importance` | `trivial`, `useful`, `important`, `critical` | Importance level |
| `example_stage` | `minimal`, `intermediate`, `common-error`, `final-solution`, `exercise` | Learning stage |
| `console` | `true` or `false` | Show runtime console |

### Framework/Mode

| Key | Values | When |
|-----|--------|------|
| `framework` | `react`, `vue` | Required for React/Vue |
| `mode` | `multi-file` | Required for multi-file projects |
| `entry` | `src/main.jsx` | Required for multi-file (path to entry) |
| `renderer` | `shader` | Required for shaders |
| `resolution` | `800x600` | Required for shaders |

### Hidden Files

| Key | Values | Purpose |
|-----|--------|---------|
| `editor_hidden_files` | `"*.json,*.config"` | Hide files in editor UI |

---

## Authoring Rules

1. **One idea per example.** Split complex concepts across multiple files.
2. **Keep examples scannable.** A learner should understand the example in under 30 seconds.
3. **Match the topic's teaching level.** Don't use advanced patterns in beginner topics.
4. **Use the existing format.** Read neighboring examples in the same topic before creating new ones.
5. **Keep entry files correct.** For multi-file, `entry` must point to an existing `@file` with `@role entry`.
6. **Use correct file extensions.** The language dictates the extension: `jsx` → `.jsx`, `typescript` → `.ts`, etc.
7. **Don't invent unsupported patterns.** If the compiler/runtime doesn't support something, teach the supported version.
8. **Use metadata sparingly.** Only add `example_tags`, `example_rating`, etc. when they add real discovery value.

## Validation

- Content-only changes: open the file and verify markdown structure.
- If the example uses compiled languages (Pug, SCSS, TypeScript, React, Vue): run `npm test` to verify parsing.
- For broad changes: `npm test` (143 tests covering parsing, roundtrip, metadata, compilation).
- For UI changes: `npm run build`.

## Output When Finishing

Report:
- Which example files were created or changed
- Whether editorial metadata was added
- What validation was run
- Whether visual verification in the preview is needed
