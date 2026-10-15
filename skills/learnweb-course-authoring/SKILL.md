---
name: learnweb-course-authoring
description: How to write the Spanish "Web a fondo" course (HTML, CSS, Sass, JavaScript, TypeScript, road to WebAssembly/WebGPU) under material/ch02+ — module structure, lesson theory, atomic/combined/professional examples, exercises, conventions and verification. Use together with learnweb-example-authoring and learnweb-theory-authoring.
---

# LearnWeb Course Authoring

## Audience and goal

The learner knows basic Python and nothing about the web. The course must make them understand
**what the browser does and why**, including every surprising behavior, so they can later build
innovative designs and study WebAssembly and WebGPU. Depth over breadth: explain the mechanism,
show it running, then show where it breaks.

The full syllabus lives in [references/plan.md](references/plan.md). Follow it: chapter, section
and topic slugs, lesson scope and the 🐛 items (surprising behaviors that each need their own example).

## Language

- Prose, comments inside code, UI text in examples, `label.txt`, headings, descriptions: **Spanish**
  (neutral, `tú`, correct accents and `¿¡`).
- Identifiers (variables, functions, classes, CSS classes, ids, file names inside examples): **English**,
  as in industry code. Example: `const totalPrice = …; // precio total con IVA`.
- Folder and example file names: ASCII slugs in Spanish (`top03-elementos-y-atributos`, `04-atributos-booleanos.md`).

## Module structure (one section = one module)

```
material/chNN-slug/label.txt                 # "HTML", "CSS", "JavaScript: el lenguaje", …
material/chNN-slug/secNN-slug/label.txt      # "Formularios", …
material/chNN-slug/secNN-slug/top01-…/main.md + examples/*.md (+ assets/)
…
material/chNN-slug/secNN-slug/top90-integracion/   # combined examples + exercises
material/chNN-slug/secNN-slug/top95-profesional/   # professional examples
```

- Lessons (`top01`…): `main.md` + **5-10 atomic examples**. Atomic = one idea, ≤ ~60 lines total,
  readable in 30 seconds, observable result (visible UI or console output).
- `top90-integracion`: `main.md` (what is combined and why) + **5-10 combined examples** mixing several
  ideas of the module + **2-4 exercises** (`exercise: true`) each with a `…-solucion.md`.
- `top95-profesional`: `main.md` (one paragraph per example: goal, techniques, what to look at) +
  **10-15 professional examples** that use everything taught *up to that point in the course*:
  production quality, accessible, responsive, semantic, well-structured code, no hacks, realistic content
  (no lorem ipsum). These can be long (150-400 lines).
- Never use a feature before it is taught. If unavoidable, say so in a comment
  (`// addEventListener se explica en el módulo de eventos; aquí solo escucha el clic`).
  HTML and CSS chapters use no JS, or a tiny clearly-labeled snippet when the lesson needs it
  (e.g. printing `document.compatMode`).

## Theory (`main.md`)

First line: `# <Título con tildes>` — it is the label shown in the sidebar. Suggested outline:

1. `## Por qué importa` — the problem this solves; 2-4 sentences.
2. Concept sections (`##`): explanation in short paragraphs, small inline snippets in fenced code
   (`html`, `css`, `scss`, `js`, `ts`, `text`), diagrams in ASCII when useful, tables for comparisons.
3. `> **Desde Python:** …` blockquotes whenever the JS/TS behavior differs from Python.
4. Embed the lesson's examples where they belong:
   - `[[exercise:03-colapso-de-margenes.md]]` → interactive preview card,
   - `[[exercise:03-colapso-de-margenes.md-]]` → the example's code with tabs,
   - `[[exercise:03-colapso-de-margenes.md-(index.html|styles.css)]]` → only some files.
   Each embed on its own line, with one line of framing text before it. Embed every example of the lesson
   at least once (preview or code).
5. `## Bestiario` — every 🐛 of the lesson: **síntoma → causa → solución**, each linked to its
   `common-error` example with a Markdown link to the file name: `[ver ejemplo](04-margen-del-body.md)`.
   Links to `.md` files of the same topic open that example's preview dialog (they can be used anywhere
   in the prose).
6. `## Resumen` — 4-8 bullets.
7. `## Para profundizar` — 2-5 links (MDN, web.dev, specs, javascript.info).

Theory rules:
- Write literal tags in backticks (`` `<p>` ``); only `details/summary/kbd/mark/sub/sup/br/small/abbr` render as HTML.
- **One line per paragraph**: the renderer turns single line breaks into `<br>`, so never hard-wrap prose
  (lists, tables and code blocks are fine).
- Relative image paths resolve to the topic's `assets/`. Length: 150-400 lines.
- This guide overrides the theory skill's "3-5 embeds" advice: embed every example of the lesson.
- Choosing the embed type: preview cards render a sandboxed `srcdoc` copy with **no console**, where
  `location` is `about:srcdoc` and quirks mode cannot happen. For console-driven examples and for
  document-level examples (doctype/quirks, charset, `location`, storage), use the code embed (`.md-`): it has
  «▶ Run» (dialog with page + console) and «Open in editor» buttons. Show the expected output right after it
  in a ```` ```text ```` block when it matters for the explanation. Use preview cards for visual results.
- The preview toolbar has a ↗ button that opens the running example as a real page in a new tab (DevTools
  device mode, `meta viewport`, printing…). Mention it when a lesson needs it.

## Examples

### File naming and frontmatter

`examples/NN-slug.md` with two-digit order prefix (`01-…`, `02-…`); exercises `NN-ej-slug.md` and
`NN-ej-slug-solucion.md`.

```yaml
---
example_description: "Una línea en español: qué demuestra"
example_tags: "css|cascada|especificidad"
example_stage: minimal            # minimal | intermediate | common-error | final-solution | exercise | professional
example_importance: important     # trivial | useful | important | critical
console: true                     # whenever the example prints to the console
---
```

- Stages by place: lesson examples `minimal` (or `intermediate` for the richer ones) and `common-error`;
  `top90` combined examples `intermediate`, exercises `exercise`, their solutions `final-solution`;
  `top95` examples `professional`.
- `common-error` = examples whose point is a surprising behavior/bug (🐛). Show the bug, explain it in
  comments, and show the fix next to it (or in the following example).
- Quote frontmatter values containing `: # | " \` with JSON-style double quotes.
- Optional flags: `loop_protect: false` (only for intentional long loops), `typecheck: false` (TS examples
  that must not be type-checked — rare), `lang: en` (page language; default `es`).

### Blocks

- At most one markup block (`# HTML`, `# HTML-FULL`, `# Pug`, `# SVG`), one style block (`# CSS`, `# SCSS`,
  `# SASS`) and one script block (`# JavaScript`, `# TypeScript`). Markup is optional: console-only JS/TS
  examples are valid (use `console: true`).
- Use `# HTML-FULL` (```` ```html ````, only block) when the lesson is about the document itself (doctype,
  head, meta, quirks mode, script loading order).
- Sass examples use `# SCSS` (or `# SASS` when teaching the indented syntax). Their code embeds show the generated
  CSS in an extra `compiled.css` tab (plus `sass-output.txt` when `@debug`/`@warn`/errors print something):
  `[[exercise:03-anidar.md-(styles.scss|compiled.css)]]` shows only the source and its output. Don't paste the
  compiled CSS into comments; the tab is always up to date.
- Fences: ```` ```lang ```` at column 0, nothing after the language. If the code contains a ```` ``` ````
  line, use a longer fence (```` ```` ````) or `~~~`.
- No prose between blocks. Comments inside the code carry the explanation:
  HTML `<!-- … -->`, CSS `/* … */`, JS/TS `// …`.

### Content rules

- Every example must **show its result**: visible output in the preview and/or `console.log` with labels
  (`console.log('typeof null →', typeof null)`). Prefer printing *both* the surprising and the correct result.
- Keep the preview neutral: a small base style is fine, but in CSS lessons don't hide the behavior being
  taught (the preview no longer injects default styles: browser defaults are real).
- Accessible by default: `lang`, labels, alt text, focus styles, sufficient contrast, semantic elements.
  Check text/background pairs with `node scripts/contrast.mjs "<color>" "<color>" …` (hex, rgb, hsl, oklch;
  ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI borders).
- No external network dependencies except when the lesson is about it (`import()` from esm.sh, fonts).
  Data files go in the topic's `assets/` and are fetched with relative URLs (`fetch('data.json')`; asset
  file names are identifiers, so English).
- Infinite loops are stopped by LearnWeb after ~1.2 s; long-but-finite computations must be chunked or
  use `loop_protect: false`.
- Placeholder links in demos and professional pages: use plausible paths (`/blog/riego-por-goteo`) or fragments
  that point to a real `id`; `href="#"` jumps to the top of the page (the HTML links lesson teaches it as a bug).
- Classic scripts share the page's global scope: a top-level `let`/`const` named like a non-configurable
  `window` property (`top`, `window`, `document`, `location`) is a SyntaxError in the browser (Node accepts it).
  Avoid those names, or wrap the code in a block. A top-level `class`/`function` named like a DOM interface
  (`Document`, `Node`, `Text`, `Event`, `Range`, `Image`, `Scheduler`…) or a JS built-in (`Iterator`, `Proxy`,
  `Reflect`, `Symbol`) does not throw but replaces that global for every script on the page (LearnWeb's console
  bridge included; a top-level `class Iterator` breaks the iterator helpers): pick another name (`Doc`,
  `TreeNode`, `CoopScheduler`…). Top-level `var` names that are `window` properties collide with them (checked in
  Chrome: `var name = 42` and `var status = 7` read back as strings, `var history = []` silently stays the
  browser's History object, `var alert = 'x'` replaces `alert`): avoid them too. The same goes for top-level
  functions named like `window` methods (`blur`, `focus`, `close`, `open`, `print`, `scroll`, `stop`): use
  `boxBlur`, `closeDialog`…
- Multi-file JavaScript (ES modules): extra modules are `.js` files in the topic's `assets/`, one subfolder per
  example or idea (`assets/03-tienda/precios.js`), imported with specifiers that start with `./`. They load in the
  hosted preview, the gallery cards and the theory cards/dialogs (sandboxed srcdoc). Say in each example which asset
  files it uses (learners read them with «Assets»). `node claude_resume/run-module.mjs` (needs
  `--experimental-vm-modules`) prints the console of examples with static imports; `run-example.mjs` can't.
- DOM values in expected output: write them in Chrome's console format, which LearnWeb shares (elements as HTML,
  `li#first.item` inside arrays/objects, `NodeList(3) […]`; arrays and lists show the length only from 2 items:
  `[x]`, `[]`); see runtime.md. Prefer logging derived strings/numbers/booleans; never log whole events, `style`,
  `getComputedStyle()` or `window`.
- Interactive examples (the harness can't click): print a setup line on load (`Listo: pulsa «Añadir»…`), keep a
  visible on-page log, and write the ```text block as the load output followed by `// Tras pulsar «…»:` sections.
  Audits that simulate interaction must also check the visual result (`getBoundingClientRect()`), not only state:
  a carousel once logged «2/5» while showing slide 1 because `translate: -20%` is a percentage of the track's OWN
  width.
- Toggling `hidden` on an element whose class sets `display` does nothing (the author `display` beats the
  attribute's UA `display: none`): add `.x[hidden] { display: none; }` or a `[hidden]` rule wherever JS or HTML
  hides such elements. `:has()` cannot be nested inside another `:has()`.
- Motion in live cards (gallery and theory cards are live iframes, many at once, on a fanless laptop): no infinite
  animations by default (finite counts, or start on hover/focus/a checkbox), compositor-only properties, and
  every motion example honours `prefers-reduced-motion`. Freeze frames (`animation-play-state: paused` + a negative
  `animation-delay`) make timing results checkable without watching the motion.
- The verify harness reports `console.error` as a problem: for errors the example handles on purpose, use
  `console.warn`/`console.log` unless the example is `common-error`.
- Sass compile errors (`@error`, undefined variables…) and deprecation warnings are allowed by the checker only in
  `common-error`/`exercise` examples; `@debug` and `@warn` output is always allowed.
- TypeScript examples are type-checked (`strict`). Type errors appear in red in the editor but the
  JavaScript still runs. Examples that *teach* a type error must say so in a comment
  (`// ❌ Error TS2322 a propósito: …`) and use `example_stage: common-error`. After the embed of an example
  with type errors, the ```text block lists them first, exactly as the theory dialog's strip shows them, then the
  console (convention set by ch07 sec01):
  ```text
  // Errores de tipos (el código se ejecuta igual):
  línea 4: TS2322: Type 'string' is not assignable to type 'number'.
  // Consola:
  total → 12
  ```
  Copy the messages from the checker's output (multi-line messages keep their indented lines). Professional
  examples and exercise solutions have zero type errors; exercise starters may have them and still print ✗.
  ES2024+ library APIs (`Object.groupBy`, `Promise.withResolvers`, Set methods…) are type errors with the course's
  `ES2023` libs. Code embeds of TS examples show a generated `compiled.js` tab. Scripts compile with `alwaysStrict`
  like `tsc --strict`: the emitted JS starts with `"use strict";`, so writes to frozen objects throw and a detached
  `this` is `undefined` (catch them when the example shows them).
- Errors in expected output: Chrome 155 (and LearnWeb's console) title DOM errors by their name — `Uncaught
  NotSupportedError: …`, `Uncaught (in promise) AbortError: …`, `console.log(domError)` → `SyntaxError: Failed to
  execute …` — never `DOMException: …`. The «ResizeObserver loop completed…» error reaches `window` listeners but is
  never printed. Never print whole lists that the browser may extend (`dataTransfer.types` gets
  `chromium/x-drag-id` in real drags): print the fact you test (`types.includes(MY_TYPE)`).
- Where an example runs: the editor preview and the theory dialog (clicking a card or «▶ Run») are the real hosted
  page (`http://localhost:3001`, real storage, history, forms); gallery and inline theory cards are sandboxed
  `srcdoc` copies with origin `null` — no IndexedDB, no `pushState`, no form submission, in-memory storage shims.
  Examples that use those APIs call them from user actions or catch the `SecurityError` and say on the page
  «Esta tarjeta es un iframe aislado (origen null): ábrelo con ▶ o en el editor». Never print `location.href`
  whole (the hosted URL has a random id).
- Network examples use only the topic's `assets/` files and the local demo API `/api/demo/*` (echo, slow stream,
  CORS modes; runtime.md); `http://127.0.0.1:3001/…` is the «other origin» of a page on `localhost:3001`; a
  network error is `fetch('http://localhost:59999/')`. Storage keys are namespaced (`lw-<module>-…`) and cleaned
  up, or come with a reset button when they persist on purpose. Take error texts from Chrome, not Node:
  `response.json()` on an empty body says `Unexpected end of input`; an overwritten cookie moves to the end of
  `document.cookie`.
- Workers: worker code (asset files, Blob strings) has no loop guard and its `console` never reaches LearnWeb's
  console — post results to the page and log them there; `terminate()` every worker when its job ends. Don't build
  Blob worker code from `${someFunction}` of the page: the page's compiled code carries LearnWeb's loop-guard calls,
  which don't exist inside the worker. In cards (origin `null`) LearnWeb starts `{ type: 'module' }` workers from a
  `data:` URL (Chrome 155 refuses module workers from opaque-origin `blob:` URLs) and classic asset workers through
  `importScripts` (a 404 there reports a `NetworkError`), so pages that must work in cards prefer module workers or
  classic Blob workers. Replies from several workers arrive in any order: sort or `await` them in a fixed order.
- Timings and performance: never print a measured time as exact output. Timed lines go under
  `// Los tiempos cambian en cada ejecución; en el M1 del curso:` with `≈` and values measured in Chrome (Chrome ran
  several loops 3–8× slower than Node on the M1); a boolean that compares timings needs a wide margin in Chrome
  (≥ 5× seen there, not in Node). LearnWeb's loop guard makes hot loops 4–5× slower: timed examples whose loops all
  end use `loop_protect: false`. Benchmarks run only from buttons, ≤ 300 ms of CPU per click in Chrome.
  `performance.now()` steps are 0.1 ms in the preview; `long-animation-frame` entries arrive with an empty
  `scripts` list there.
- GPU: the checker skips `renderer: shader` documents (WebGL 1, GLSL ES 1.00), so every shader is checked by eye in
  Chrome; accents and emojis in GLSL comments are fine. Cards show a still frame (`u_time` 0, mouse at 0,0), the
  theory dialog keeps time paused (the mouse works) and the editor starts paused until ▶. A compile error reads
  `Fragment shader compile error` + `ERROR: 0:6: 'u_time' : undeclared identifier` in cards and dialogs, and
  `'u_time' : undeclared identifier` plus a diagnostic on line 6 in the editor. WebGL from JS: draw once and print
  `readPixels` of solid areas (exact); set `crossOrigin = 'anonymous'` on every image (in cards `texImage2D` throws a
  `SecurityError` for cross-origin images).

### Runtime capabilities

See the capability matrix at the end of [references/runtime.md](references/runtime.md) (forms, storage,
modules, workers, WebAssembly, WebGL, WebGPU, console features). Only teach with what works there; when the
browser feature cannot run in the preview, explain why and show the closest runnable alternative.

## Exercises

```yaml
---
exercise: true
exercise_title: "Arregla el colapso de márgenes"
exercise_instructions: "Paso 1 || Paso 2 || Paso 3"
exercise_hints: "Pista 1 || Pista 2"
exercise_solution_example: 03-ej-colapso-solucion.md
exercise_locked_files: index.html
example_stage: exercise
console: true
---
```

Steps and hints are separated by `||` only. The starting code must run and contain `TODO` comments where
the learner works. The solution file has the same blocks, the completed code, `example_stage: final-solution`
and **no** `exercise*` keys.

## Verification (mandatory before finishing a module)

1. `node scripts/check-material.mjs material/chNN-…/secNN-…` — parses, compiles and lints every file
   of the module (structure, frontmatter, embeds, labels, compile errors). Fix everything it reports.
2. Re-read each `main.md` top to bottom as the learner would.
3. List the examples that need a visual/runtime check in the browser (animations, layout, WebGL/WebGPU)
   in your final report; the coordinator checks them in Chrome.
4. Runtime check (coordinator, in Chrome): `http://localhost:5174/tools/verify-examples.html?path=<ch>/<sec>`
   runs every example of the module through the real preview, one at a time, and reports uncaught errors,
   rejections, `console.error`, failed asserts and loop-guard trips (problems in `common-error`/`exercise`
   examples are marked "expected?"). Results: `window.__verifyResults`; with `&logs=1` each result also
   has `logs` (the console lines), used to check exercise self-checks (❌ before, ✅ in the solution).
   `&card=1` runs each example the way gallery and theory cards do (a `srcdoc` copy, `sandbox="allow-scripts"`,
   origin `null`), so card-only differences (storage, history, workers, cross-origin images) show up too.

Heat rule (fanless MacBook Air M1): no `npm run build`, no headless browsers, no extra servers, no long
loops. The checker is fine (it compiles in a memory/time-limited worker).
