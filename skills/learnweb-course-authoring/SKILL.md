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
  browser's History object, `var alert = 'x'` replaces `alert`): avoid them too.
- Multi-file JavaScript (ES modules): extra modules are `.js` files in the topic's `assets/`, one subfolder per
  example or idea (`assets/03-tienda/precios.js`), imported with specifiers that start with `./`. They load in the
  hosted preview, the gallery cards and the theory cards/dialogs (sandboxed srcdoc). Say in each example which asset
  files it uses (learners read them with «Assets»). `node claude_resume/run-module.mjs` (needs
  `--experimental-vm-modules`) prints the console of examples with static imports; `run-example.mjs` can't.
- The verify harness reports `console.error` as a problem: for errors the example handles on purpose, use
  `console.warn`/`console.log` unless the example is `common-error`.
- Sass compile errors (`@error`, undefined variables…) and deprecation warnings are allowed by the checker only in
  `common-error`/`exercise` examples; `@debug` and `@warn` output is always allowed.
- TypeScript examples are type-checked (`strict`). Type errors appear in red in the editor but the
  JavaScript still runs. Examples that *teach* a type error must say so in a comment
  (`// ❌ Error TS2322 a propósito: …`) and use `example_stage: common-error`.

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

Heat rule (fanless MacBook Air M1): no `npm run build`, no headless browsers, no extra servers, no long
loops. The checker is fine (it compiles in a memory/time-limited worker).
