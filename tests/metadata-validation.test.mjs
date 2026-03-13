import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFrameworkFileTemplate, getFrameworkFileTemplateOptions } from '../src/config/fileTemplates.js';
import {
    createExampleDocumentFromPreset,
    createDocumentFile,
    duplicateDocumentFile,
    getExerciseConfig,
    getExampleStage,
    parseExampleDocument,
    removeDocumentFile,
    setDocumentEntryPath,
    updateDocumentFileDetails,
} from '../src/utils/markdown.js';
import { createCompileCacheKey } from '../src/utils/compileCache.js';
import { compileExampleDocument } from '../src/utils/exampleCompiler.js';
import { resolveExerciseComparison } from '../src/utils/exerciseComparison.js';
import { renderCompiledExampleDocument } from '../src/utils/exampleRenderer.js';

function getDiagnosticCodes(documentModel) {
    return (documentModel.diagnostics || []).map((diagnostic) => diagnostic.code);
}

test('normalizes known metadata keys and warns on duplicate frontmatter keys', () => {
    const documentModel = parseExampleDocument(`---
Framework: React
Console: "true"
console: false
---

# JSX

\`\`\`jsx
function App() {
  return <main>Hello</main>;
}
\`\`\``);

    assert.equal(documentModel.metadata.framework, 'react');
    assert.equal(documentModel.metadata.console, false);
    assert.ok(getDiagnosticCodes(documentModel).includes('duplicate-frontmatter-key'));
});

test('exercise metadata is parsed into a guided exercise config', () => {
    const documentModel = parseExampleDocument(`---
exercise: true
exercise_title: "Build a card"
exercise_instructions: "Update the heading || Add another item"
exercise_hints: "Edit index.html first || styles.css is locked"
exercise_compare_pairs: "index.html=>solution/index.html"
exercise_locked_files: styles.css
exercise_reference_files: data/reference.json|data/checklist.json
exercise_solution_example: exercise-card-solution.md
exercise_solution_files: solution/App.jsx
---

# HTML

\`\`\`html
<main>Hello</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const exercise = getExerciseConfig(documentModel);

    assert.equal(exercise.enabled, true);
    assert.equal(exercise.title, 'Build a card');
    assert.deepEqual(exercise.instructions, ['Update the heading', 'Add another item']);
    assert.deepEqual(exercise.hints, ['Edit index.html first', 'styles.css is locked']);
    assert.deepEqual(exercise.comparePairs, [{ attemptPath: 'index.html', solutionPath: 'solution/index.html' }]);
    assert.deepEqual(exercise.lockedFiles, ['styles.css']);
    assert.deepEqual(exercise.referenceFiles, ['data/reference.json', 'data/checklist.json']);
    assert.equal(exercise.solutionExample, 'exercise-card-solution.md');
    assert.deepEqual(exercise.solutionFiles, ['solution/App.jsx']);
});

test('compile cache keys stay stable for equal documents and change with content', () => {
    const firstDocument = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\``);
    const secondDocument = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\``);
    const thirdDocument = parseExampleDocument(`# HTML

\`\`\`html
<main>Different</main>
\`\`\``);

    assert.equal(
        createCompileCacheKey({ document: firstDocument }),
        createCompileCacheKey({ document: secondDocument })
    );
    assert.notEqual(
        createCompileCacheKey({ document: firstDocument }),
        createCompileCacheKey({ document: thirdDocument })
    );
});

test('example_stage is normalized and exposed for gallery progression', () => {
    const documentModel = parseExampleDocument(`---
example_stage: FINAL-SOLUTION
---

# HTML

\`\`\`html
<main>Done</main>
\`\`\``);

    assert.equal(getExampleStage(documentModel), 'final-solution');
});

test('exercise comparison resolves explicit internal pairs', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_compare_pairs: src/App.jsx=>src/solution/AppSolution.jsx
exercise_solution_files: src/solution/AppSolution.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Attempt</main>;
}
\`\`\`

## @file src/solution/AppSolution.jsx
## @lang jsx
## @role util

\`\`\`jsx
export function AppSolution() {
  return <main>Solution</main>;
}
\`\`\``);
    const comparison = resolveExerciseComparison({
        attemptDocument: documentModel,
        exerciseConfig: getExerciseConfig(documentModel),
    });

    assert.equal(comparison.available, true);
    assert.equal(comparison.pairs.length, 1);
    assert.equal(comparison.selectedPair?.attemptPath, 'src/App.jsx');
    assert.equal(comparison.selectedPair?.solutionPath, 'src/solution/AppSolution.jsx');
    assert.equal(comparison.selectedPair?.summary.changedCount > 0, true);
});

test('exercise comparison auto-matches external solution examples by path', () => {
    const exerciseDocument = parseExampleDocument(`---
exercise: true
exercise_solution_example: card-solution.md
---

# HTML

\`\`\`html
<main>Attempt</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const solutionDocument = parseExampleDocument(`---
example_stage: final-solution
---

# HTML

\`\`\`html
<main>Solution</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const comparison = resolveExerciseComparison({
        attemptDocument: exerciseDocument,
        solutionDocument,
        exerciseConfig: getExerciseConfig(exerciseDocument),
    });

    assert.equal(comparison.available, true);
    assert.deepEqual(
        comparison.pairs.map((pair) => pair.attemptPath),
        ['index.html', 'styles.css']
    );
});

test('HTML-B is accepted as an alias of HTML body fragments', () => {
    const documentModel = parseExampleDocument(`# HTML-B

\`\`\`html-b
<section>Hello</section>
\`\`\``);
    const presetDocument = createExampleDocumentFromPreset('html-b');

    assert.equal(documentModel.blocks[0].type, 'html');
    assert.equal(documentModel.files[0].language, 'html');
    assert.equal(presetDocument.blocks[0].type, 'html');
    assert.equal(presetDocument.files[0].language, 'html');
});

test('HTML body-fragment blocks warn when they contain full document tags', () => {
    const documentModel = parseExampleDocument(`# HTML

\`\`\`html
<!DOCTYPE html>
<html>
  <head><title>Wrong shape</title></head>
  <body><main>Hello</main></body>
</html>
\`\`\``);

    assert.ok(getDiagnosticCodes(documentModel).includes('html-body-fragment-expected'));
});

test('HTML-FULL compiles and renders as a complete standalone document', async () => {
    const documentModel = parseExampleDocument(`# HTML-FULL

\`\`\`html-full
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Standalone</title>
</head>
<body>
  <main>Hello full document</main>
</body>
</html>
\`\`\``);

    const presetDocument = createExampleDocumentFromPreset('html-full');
    const result = await compileExampleDocument(documentModel);
    const rendered = renderCompiledExampleDocument(result.compiledDocument, 'ch00-tests/sec00-test/top00-test', [], {
        consoleEnabled: true,
        renderId: 11,
    });

    assert.equal(documentModel.blocks[0].type, 'html-full');
    assert.equal(presetDocument.blocks[0].type, 'html-full');
    assert.equal(result.compiledDocument.fullDocumentHtml.includes('<title>Standalone</title>'), true);
    assert.match(rendered, /^<!DOCTYPE html>/i);
    assert.equal((rendered.match(/<!DOCTYPE html>/gi) || []).length, 1);
    assert.match(rendered, /<title>Standalone<\/title>/);
    assert.match(rendered, /learncode-preview/);
    assert.match(rendered, /<base href="\/api\/topic\/ch00-tests\/sec00-test\/top00-test\/assets\/">/);
});

test('HTML-FULL rejects extra standalone CSS or JavaScript blocks', () => {
    const documentModel = parseExampleDocument(`# HTML-FULL

\`\`\`html-full
<!DOCTYPE html>
<html>
<body>
  <main>Hello</main>
</body>
</html>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);

    assert.ok(getDiagnosticCodes(documentModel).includes('html-full-must-stand-alone'));
});

test('React multi-file templates prefer typed scaffolds when the project already uses TSX', () => {
    const documentModel = createExampleDocumentFromPreset('react-project-tsx');
    const templateOptions = getFrameworkFileTemplateOptions(documentModel);
    const scaffold = buildFrameworkFileTemplate(documentModel, 'state');

    assert.ok(templateOptions.some((template) => template.id === 'state' && template.label === 'Context'));
    assert.equal(scaffold.files.length, 1);
    assert.equal(scaffold.files[0].language, 'tsx');
    assert.equal(scaffold.files[0].role, 'context');
    assert.match(scaffold.files[0].path, /^src\/context\/CounterContext\.tsx$/);
    assert.match(scaffold.files[0].content, /React\.createContext/);
});

test('Vue multi-file templates can scaffold a component with a paired HTML template', () => {
    const documentModel = createExampleDocumentFromPreset('vue-project-typescript');
    const templateOptions = getFrameworkFileTemplateOptions(documentModel);
    const scaffold = buildFrameworkFileTemplate(documentModel, 'component');

    assert.ok(templateOptions.some((template) => template.id === 'hook' && template.label === 'Composable'));
    assert.equal(scaffold.files.length, 2);
    assert.equal(scaffold.files[0].language, 'typescript');
    assert.equal(scaffold.files[0].role, 'component');
    assert.equal(scaffold.files[1].language, 'html');
    assert.equal(scaffold.files[1].role, 'markup');
    assert.match(scaffold.files[0].content, /import render from '\.\/NewPanel\.html';/);
    assert.match(scaffold.files[1].path, /^src\/components\/NewPanel\.html$/);
});

test('Vue SFC projects scaffold single-file components when the project already uses .vue files', () => {
    const documentModel = createExampleDocumentFromPreset('vue-project-sfc-typescript');
    const scaffold = buildFrameworkFileTemplate(documentModel, 'component');

    assert.equal(scaffold.files.length, 1);
    assert.equal(scaffold.files[0].language, 'vue');
    assert.equal(scaffold.files[0].role, 'component');
    assert.match(scaffold.files[0].path, /^src\/components\/NewPanel\.vue$/);
    assert.match(scaffold.files[0].content, /<script setup lang="ts">/);
    assert.match(scaffold.files[0].content, /<style scoped lang="scss">/);
});

test('legacy React documents with wrong mode stay on the single-file compiler path', async () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
---

# JSX

\`\`\`jsx
function App() {
  return <button type="button">Hello</button>;
}
\`\`\``);

    assert.equal(documentModel.sourceFormat, 'legacy-blocks');
    assert.ok(getDiagnosticCodes(documentModel).includes('mode-format-mismatch'));

    const result = await compileExampleDocument(documentModel);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.js, /createRoot/);
});

test('virtual React documents validate paths, roles, entry language and extension mismatches', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/styles.css
console: maybe
---

## @file ../src/App.js
## @lang tsx
## @role strange

\`\`\`tsx
export function App() {
  return <main>Hello</main>;
}
\`\`\`

## @file src/styles.css
## @lang css
## @role entry

\`\`\`css
body {
  margin: 0;
}
\`\`\``);

    const codes = getDiagnosticCodes(documentModel);

    assert.ok(codes.includes('invalid-console-metadata'));
    assert.ok(codes.includes('invalid-file-path'));
    assert.ok(codes.includes('unsupported-file-role'));
    assert.ok(codes.includes('file-extension-language-mismatch'));
    assert.ok(codes.includes('invalid-react-entry-language'));
});

test('react multi-file supports TSX files without explicit React imports for JSX-only components', async () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.tsx
---

## @file src/main.tsx
## @lang tsx
## @role entry

\`\`\`tsx
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
\`\`\`

## @file src/App.tsx
## @lang tsx
## @role app

\`\`\`tsx
import React from 'react';
import { StatusCard } from './StatusCard.tsx';

export function App() {
  return <StatusCard label="Count" value={1} />;
}
\`\`\`

## @file src/StatusCard.tsx
## @lang tsx
## @role component

\`\`\`tsx
type StatusCardProps = {
  label: string;
  value: number;
};

export function StatusCard({ label, value }: StatusCardProps) {
  return (
    <section>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}
\`\`\``);

    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.match(result.compiledDocument.js, /jsx-runtime/);
    assert.doesNotMatch(result.compiledDocument.js, /return\s+\/\*\s*@__PURE__\s*\*\/\s*React\.createElement/);
});

test('react multi-file can import JSON virtual files inside the same Markdown document', async () => {
    const documentModel = createExampleDocumentFromPreset('react-project-json');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.js, /React Data Snapshot/);
    assert.match(result.compiledDocument.js, /Props review/);
});

test('vue single-file compiles Composition API with setup, refs and computed state', async () => {
    const documentModel = parseExampleDocument(`---
framework: vue
---

# HTML

\`\`\`html
<main class="card">
  <h1>{{ title }}</h1>
  <p>{{ summary }}</p>
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</main>
\`\`\`

# JavaScript

\`\`\`javascript
import { computed, ref } from 'vue';

export default {
  setup() {
    const title = ref('Vue Test');
    const count = ref(0);
    const summary = computed(() => 'Count: ' + count.value);
    const increment = () => {
      count.value += 1;
    };

    return {
      count,
      increment,
      summary,
      title,
    };
  },
};
\`\`\``);

    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
    assert.match(result.compiledDocument.js, /computed/);
});

test('vue single-file rejects non-HTML markup and script blocks without default export', async () => {
    const documentModel = parseExampleDocument(`---
framework: vue
---

# SVG

\`\`\`svg
<svg viewBox="0 0 10 10"></svg>
\`\`\`

# JavaScript

\`\`\`javascript
const count = 1;
\`\`\``);

    assert.ok(getDiagnosticCodes(documentModel).includes('invalid-vue-template-block'));

    const result = await compileExampleDocument(documentModel);
    const compileCodes = (result.compileDiagnostics || []).map((diagnostic) => diagnostic.code);

    assert.ok(compileCodes.includes('invalid-vue-template-block'));
    assert.ok(compileCodes.includes('vue-single-file-default-export-required'));
});

test('vue single-file keeps Options API compatibility but warns to prefer Composition API', async () => {
    const documentModel = parseExampleDocument(`---
framework: vue
---

# HTML

\`\`\`html
<main>
  <h1>{{ title }}</h1>
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</main>
\`\`\`

# JavaScript

\`\`\`javascript
export default {
  data() {
    return {
      title: 'Options API',
      count: 0,
    };
  },
  methods: {
    increment() {
      this.count += 1;
    },
  },
};
\`\`\``);

    const result = await compileExampleDocument(documentModel);
    const warningCodes = (result.compileDiagnostics || []).map((diagnostic) => diagnostic.code);

    assert.ok(warningCodes.includes('vue-options-api-detected'));
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.js, /createApp/);
});

test('vue multi-file validates entry language and rejects unsupported virtual file languages', () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/App.html
---

## @file src/App.html
## @lang html
## @role entry

\`\`\`html
<main>{{ title }}</main>
\`\`\`

## @file src/Widget.jsx
## @lang jsx
## @role component

\`\`\`jsx
export function Widget() {
  return <div>Wrong framework</div>;
}
\`\`\``);

    const codes = getDiagnosticCodes(documentModel);

    assert.ok(codes.includes('invalid-vue-entry-language'));
    assert.ok(codes.includes('unsupported-vue-file-language'));
});

test('vue multi-file compiles HTML templates imported as render modules', async () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/main.ts
---

## @file src/main.ts
## @lang typescript
## @role entry

\`\`\`typescript
import { createApp } from 'vue';
import App from './App.ts';
import './styles.scss';

createApp(App).mount('#app');
\`\`\`

## @file src/App.ts
## @lang typescript
## @role app

\`\`\`typescript
import { defineComponent, ref } from 'vue';
import CounterPanel from './components/CounterPanel.ts';
import render from './App.html';

export default defineComponent({
  name: 'App',
  components: {
    CounterPanel,
  },
  setup() {
    const title = ref('Vue Project');

    return {
      title,
    };
  },
  render,
});
\`\`\`

## @file src/App.html
## @lang html
## @role markup

\`\`\`html
<main class="playground">
  <h1>{{ title }}</h1>
  <CounterPanel />
</main>
\`\`\`

## @file src/components/CounterPanel.ts
## @lang typescript
## @role component

\`\`\`typescript
import { defineComponent, ref } from 'vue';
import render from './CounterPanel.html';

export default defineComponent({
  name: 'CounterPanel',
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value += 1;
    };

    return {
      count,
      increment,
    };
  },
  render,
});
\`\`\`

## @file src/components/CounterPanel.html
## @lang html
## @role markup

\`\`\`html
<section class="card">
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</section>
\`\`\`

## @file src/styles.scss
## @lang scss
## @role style

\`\`\`scss
$accent: #38bdf8;

.playground {
  display: grid;
  gap: 12px;
}

.card button {
  border: 0;
  background: $accent;
}
\`\`\``);

    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
    assert.match(result.compiledDocument.js, /CounterPanel/);
    assert.match(result.compiledDocument.css, /background:\s*#38bdf8/);
});

test('vue multi-file compiles controlled .vue SFC files with script setup and scoped styles', async () => {
    const documentModel = createExampleDocumentFromPreset('vue-project-sfc-typescript');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
    assert.match(result.compiledDocument.js, /defineComponent/);
    assert.match(result.compiledDocument.js, /data-v-/);
    assert.match(result.compiledDocument.css, /\.status-card\[data-v-/);
    assert.match(result.compiledDocument.css, /background:\s*rgba\(15,\s*23,\s*42,\s*0\.88\)/);
});

test('vue multi-file can import JSON virtual files inside the same Markdown document', async () => {
    const documentModel = createExampleDocumentFromPreset('vue-project-json');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(result.compileDiagnostics, []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.js, /Vue Data Snapshot/);
    assert.match(result.compiledDocument.js, /Composables/);
});

test('vue multi-file reports diagnostics for unsupported SFC features', async () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

\`\`\`javascript
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
\`\`\`

## @file src/App.vue
## @lang vue
## @role app

\`\`\`vue
<template src="./App.html"></template>

<script setup src="./script.ts"></script>

<style module>
.app {
  color: red;
}
</style>
\`\`\``);

    const result = await compileExampleDocument(documentModel);
    const codes = result.compileDiagnostics.map((diagnostic) => diagnostic.code);

    assert.ok(codes.includes('vue-sfc-template-src-not-supported'));
    assert.ok(codes.includes('vue-sfc-script-src-not-supported'));
    assert.ok(codes.includes('vue-sfc-style-module-not-supported'));
});

test('virtual binary assets are rejected with a clear diagnostic', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export function App() {
  return <img src="./logo.png" alt="logo" />;
}
\`\`\`

## @file src/logo.png
## @lang png
## @role asset

\`\`\`png
binary-placeholder
\`\`\``);

    const codes = getDiagnosticCodes(documentModel);

    assert.ok(codes.includes('virtual-asset-files-not-supported'));
});

test('exercise metadata warns when it references files that do not exist', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_solution_files: src/solution/AppSolution.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\``);

    assert.ok(getDiagnosticCodes(documentModel).includes('exercise-file-not-found'));
});

test('preview renderer injects runtime console bridge only when console is enabled', () => {
    const withConsole = renderCompiledExampleDocument(
        { html: '<main>Hello</main>', js: 'console.log("hi");' },
        '',
        [],
        { consoleEnabled: true, renderId: 7 }
    );
    const withoutConsole = renderCompiledExampleDocument(
        { html: '<main>Hello</main>', js: 'console.log("hi");' },
        '',
        [],
        { consoleEnabled: false, renderId: 8 }
    );

    assert.match(withConsole, /learncode-preview/);
    assert.match(withConsole, /learncode-console-command/);
    assert.match(withConsole, /stackFrames/);
    assert.match(withConsole, /unhandledrejection/);
    assert.match(withConsole, /const RENDER_ID = 7/);
    assert.doesNotMatch(withoutConsole, /learncode-preview/);
    assert.doesNotMatch(withoutConsole, /learncode-console-command/);
    assert.match(withoutConsole, /try \{/);
});

test('preview renderer suppresses duplicate compile diagnostics markup when console is enabled', () => {
    const rendered = renderCompiledExampleDocument(
        { html: '<main>Hello</main>', js: 'console.log("hi");' },
        '',
        [{ level: 'error', message: 'Broken build', file: 'src/App.tsx', line: 4, column: 2 }],
        { consoleEnabled: true, renderId: 9 }
    );

    assert.doesNotMatch(rendered, /Compile diagnostics/);
    assert.match(rendered, /learncode-preview/);
});

test('vanilla TypeScript output keeps inline sourcemaps and runtime source path metadata', async () => {
    const documentModel = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\`

# TypeScript

\`\`\`typescript
const message: string = 'Hello';
console.log(message);
\`\`\``);
    const result = await compileExampleDocument(documentModel);

    assert.match(result.compiledDocument.js, /sourceMappingURL=data:application\/json;base64,/);
    assert.equal(result.compiledDocument.runtimeScriptPath, 'script.ts');
});

test('React and Vue bundles keep inline sourcemaps for better runtime stacks', async () => {
    const reactDocument = createExampleDocumentFromPreset('react-project-tsx');
    const vueDocument = createExampleDocumentFromPreset('vue-project-sfc-typescript');
    const reactResult = await compileExampleDocument(reactDocument);
    const vueResult = await compileExampleDocument(vueDocument);

    assert.match(reactResult.compiledDocument.js, /sourceMappingURL=data:application\/json;base64,/);
    assert.match(vueResult.compiledDocument.js, /sourceMappingURL=data:application\/json;base64,/);
});

test('virtual file CRUD updates paths, duplicates and entry metadata consistently', () => {
    const baseDocument = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\``);

    const withUtility = createDocumentFile(baseDocument, {
        language: 'typescript',
        path: 'src/utils/math.ts',
        role: 'util',
        content: 'export const two = 2;',
    });
    const utilityFile = withUtility.files.find((file) => file.path === 'src/utils/math.ts');
    assert.ok(utilityFile);

    const duplicated = duplicateDocumentFile(withUtility, utilityFile.id);
    assert.ok(duplicated.files.some((file) => file.path === 'src/utils/math-copy.ts'));

    const entryFile = duplicated.files.find((file) => file.path === 'src/main.jsx');
    const renamedEntry = updateDocumentFileDetails(duplicated, entryFile.id, {
        language: 'jsx',
        path: 'src/bootstrap.jsx',
        role: 'entry',
    });
    assert.equal(renamedEntry.metadata.entry, 'src/bootstrap.jsx');

    const switchedEntry = setDocumentEntryPath(renamedEntry, 'src/App.jsx');
    assert.equal(switchedEntry.metadata.entry, 'src/App.jsx');

    const removedEntry = removeDocumentFile(
        switchedEntry,
        switchedEntry.files.find((file) => file.path === 'src/App.jsx').id,
    );
    assert.equal(removedEntry.metadata.entry, 'src/bootstrap.jsx');
});

test('legacy block CRUD can add, duplicate and remove blocks', () => {
    const baseDocument = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\``);

    const withStyle = createDocumentFile(baseDocument, {
        language: 'css',
        content: 'main { color: red; }',
    });
    assert.ok(withStyle.files.some((file) => file.language === 'css'));

    const htmlFile = withStyle.files.find((file) => file.language === 'html');
    const duplicatedMarkup = duplicateDocumentFile(withStyle, htmlFile.id);
    assert.equal(duplicatedMarkup.files.filter((file) => file.language === 'html').length, 2);

    const styleFile = duplicatedMarkup.files.find((file) => file.language === 'css');
    const withoutStyle = removeDocumentFile(duplicatedMarkup, styleFile.id);
    assert.equal(withoutStyle.files.some((file) => file.language === 'css'), false);
});
