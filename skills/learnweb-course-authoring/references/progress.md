# Course progress and hand-off notes

Last updated: 2026-10-12, second pause (user's usage budget). Modules 2 and 3 of every lane are complete; modules 4 are partly written.

Read this first when resuming the course work. The syllabus is in [plan.md](plan.md), the authoring
rules in [../SKILL.md](../SKILL.md), runtime capabilities in [runtime.md](runtime.md).

## Status by module

Legend: ✅ complete and verified (checker 0/0 + browser harness) · 🟡 partial · ⬜ not started.

| Module | Lessons | top90 | top95 | Notes |
|---|---|---|---|---|
| ch02-html/sec01-la-web-y-el-documento | ✅ 5/5 | ✅ 7 ex + 3 exercises | ✅ 12 | 67 examples |
| ch02-html/sec02-contenido-y-semantica | ✅ 7/7 | ✅ 8 + 4 exercises | ✅ 13 | 83 examples; browser-verified 0 problems |
| ch02-html/sec03-formularios | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 13 | 74 examples; browser-verified 0 problems (top95 form-audit all ✅); top05/05 rewritten (Escape now empties returnValue in Chrome; close() without argument keeps it) |
| ch02-html/sec04-multimedia-y-embebidos | ✅ 5/5 | ✅ 7 + 3 exercises | ✅ 12 | 68 examples; browser-verified 0 problems (exercises ❌ → ✅, top95 audits all ✅); top04/07 = autoplay WITH SOUND needs allow=autoplay in a cross-origin frame (muted always plays); media copied per topic (~3.3 MB) |
| ch03-css/sec01-fundamentos-y-cascada | ✅ 10/10 | ✅ 7 + 3 exercises | ✅ 11 | 112 examples |
| ch03-css/sec02-modelo-de-cajas | ✅ 6/6 | ✅ 8 + 4 exercises | ✅ 13 | 74 examples; browser-verified 0 problems |
| ch03-css/sec03-flujo-y-posicionamiento | ✅ 5/5 | ✅ 8 + 4 exercises | ✅ 12 | 69 examples; browser-verified 0 problems; top95/02 buy box uses a ×999 clamp switch at <40rem |
| ch03-css/sec04-flexbox | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 13 | 73 examples; browser-verified 0 problems + visual checks; top04/07 image made 64px so the stretch shows at card width; top95/09 street field wrapped in a row (flex-basis in a column is a height) |
| ch03-css/sec05-grid | ✅ 5/5 | ⬜ (in progress) | ⬜ | 43 lesson examples browser-verified (rulers, overlays, dense, subgrid) |
| ch03-css/sec06 … sec10 | ⬜ | ⬜ | ⬜ | |
| ch04-sass/sec01-sass-fundamentos | ✅ 8/8 | ⬜ (in progress) | ⬜ | 64 lesson examples browser-verified; 7 intentional compile errors (common-error); uses the compiled.css / sass-output.txt tabs |
| ch05-javascript/sec01-primeros-pasos | ✅ 7/7 | ✅ 7 + 3 exercises | ✅ 12 | 89 examples |
| ch05-javascript/sec02-datos | ✅ 7/7 | ✅ 8 + 4 exercises | ✅ 12 | 91 examples; browser-verified 0 problems; Chrome output = node output |
| ch05-javascript/sec03-funciones-y-ambito | ✅ 7/7 | ✅ 8 + 3 exercises | ✅ 12 | 87 examples; browser-verified 0 problems |
| ch05-javascript/sec04-objetos-y-prototipos | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 11 | 73 examples; browser-verified 0 problems (exercises ✗ → ✓) |
| ch05-javascript/sec05-clases-y-poo | ✅ 6/6 | ⬜ (in progress) | ⬜ | 54 lesson examples; Chrome console output = run-example output (hash-compared 53/53) |
| ch05-javascript/sec06 … sec08 | ⬜ | ⬜ | ⬜ | |
| ch06 … ch08 | ⬜ | ⬜ | ⬜ | |

Current goal (user, 2026-10-12): write modules 3 and 4 of each lane, max 3 agents at a time. Modules 3 are done;
resume with the modules 4 (fresh agents: they read the module folder first, then continue).

Next actions when resuming:
1. `npm run dev`. The paused agents' contexts are gone after compaction: use FRESH agents with the prompts in the
   coordinator's messages as templates (common head: AGENTS.md, SKILL.md, plan.md, runtime.md, example/theory
   skills; the previous module for tone; exact assignment; audience; runtime facts; quality bar; process; heat rule;
   report). Tell each one which topics already exist and must not be rewritten.
2. **JS ch05/sec04-objetos-y-prototipos**: lessons done. Write top90 + top95. Agent's plan: top90 combined = shape
   hierarchy, inventory with accessors, plugins by delegation, polyfills with tests, hand-wired "class" factory,
   glossary with `Object.create(null)` vs `{}`, layered frozen settings, mixins (copy vs delegate); exercises =
   myNew/myInstanceOf/inherit, account model with accessors, bug hunt (template:
   sec03/top90/examples/09-ej-utilidades-de-funciones.md). top95 = library domain model, event emitter +
   observable model, money/units value objects, settings store with accessors, plugin text formatter, widget base
   "type" + 2 widgets with UI, prototype-chain inspector, polyfill bundle with tests, record type with dirty tracking,
   state machine with delegating states. No `class` yet (module 5). Exact console text can be checked with
   `node claude_resume/run-example.mjs <example.md>` (runs the real runtime bridge in a vm; no DOM).
3. **CSS ch03/sec04-flexbox**: top01-03 done (conventions: containers `2px dashed #7c3aed`, items `#e0e7ff` with
   `#4338ca` border; top03 assets `ruler-400.svg`, `free-space.svg`; containers exactly 400px with a ruler). Write
   top04-trampas-de-flex (plan: `<pre>` that won't shrink until `min-width: 0`; ellipsis that doesn't appear;
   `flex: 1` columns made unequal by a long email; `min-height: 0` in a nested column; initials avatar squashed
   by shrinking; image stretched; PROMISES from sec03: sticky failing under `align-items: stretch`, `order` vs Tab
   order with `reading-flow: flex-visual` (Chrome 137+)) and top05-patrones-flex (plan.md list + input+button and a
   panel whose body fills the remaining height, promised by sec02 top95), then top90 + top95.
   Visual checks pending: top02/09 (`safe center` needed?), rulers in top03/02-06 and 08, baseline line top02/04,
   computed table top03/07, stretched items in top01/03 column panel.
4. **HTML ch02/sec04-multimedia-y-embebidos**: top01-03 done (top01 assets: the 7 media files + 6 .vtt incl. a broken
   SRT one; tracks need `crossorigin="anonymous"` on `<video>` because cards/dialogs are opaque-origin srcdoc;
   top02 `assets/calendar.ics`). Write top04-iframes-y-embebidos (srcdoc + sandbox demos, the
   allow-scripts + allow-same-origin bug, a site that refuses framing; top01 and top03 promise top04 explains
   `sandbox` and `allow="autoplay"`) and top05-template-y-metadatos (template cloning + "template empties itself"
   bug, slot via declarative shadow DOM, Open Graph / link rel / JSON-LD as HTML-FULL), then top90 + top95.
   Checks pending in Chrome: top01/06 autoplay (blocked unmuted in theory cards; in the editor preview it may
   play with sound after a click), top01/03 canPlayType, top01/05 SRT track error event, top01/08 `#t=3,6`,
   top02/09 `<use href>` in theory cards, top03/04 blurry vs sharp canvas, top03/06 canvas fallback.
5. Media files (generated with ffmpeg) are kept in the gitignored `claude_resume/media/` in case more are needed.
6. After the modules 4: continue the plan (HTML sec05?/ch04 Sass, CSS sec05-grid, JS sec05-clases-y-poo…).

Notes carried forward:
- JS: when a base/prototype object is frozen, plain `=` cannot override its properties on objects that inherit
  from it (the "override mistake": the inherited read-only property blocks the assignment, silently in sloppy
  mode); use `Object.defineProperty` or class fields (define semantics). Came up in sec04 top90/07, top95/04, 10.
- `claude_resume/run-example.mjs` prints LearnWeb-format console output (groups nested correctly); no DOM, and
  `structuredClone` results are cross-realm there (`instanceof Date` false, true in Chrome).
- Flexbox trap not yet taught as its own example: `flex: 1 1 9rem` on an item of a COLUMN container sets its
  height (flex-basis follows the main axis). Found in sec04 top95/09; candidate for a future debugging example.
- Checker gotcha: `<!doctype`/`<body` inside a `srcdoc="…"` attribute trip `html-body-fragment-expected`; wrap the
  srcdoc content in a `<div>` instead of a full document.
- Learner's browser: America/Mexico_City (no DST), en-US. See runtime.md "The learner's browser".
- JS sec02 promise: immutability is taught in sec03/top06-funciones-de-orden-superior. Plan gap: no
  regular-expressions lesson yet (used with one-line comments); consider adding one to sec06.
- CSS sec02 top95 used `vertical-align` and overlapping badges/ribbons (negative margins) with forward
  references; sec03 explains them.
- Placeholder `href="#"` links: ~240 in CSS sec01-03 demos and HTML sec02 (top06); the guide now asks for
  plausible paths in new content. Old ones left (harmless in CSS demos); could be tidied.
- HTML sec02: lesson examples top05/01 and 03 omit `<tbody>` (before the lesson introduces it) and top06 uses
  `href="#"` placeholders (top03 teaches it as a bug) — left as is, could be tidied.
- Media: ffmpeg is installed (/opt/homebrew/bin, libx264, libvpx-vp9,
  libopus, libmp3lame, lavfi testsrc2/life/aevalsrc; no drawtext). The coordinator generates them (short CPU
  burst), agents ask for them.
  Generated files, kept in the gitignored `claude_resume/media/` (already copied into sec04/top01-audio-y-video/assets/):
  `life.webm` (VP9+Opus) / `life.mp4` (H.264+AAC) — 12 s, 640×360, Conway's Game of Life (cyan cells on
  #0f172a) with a plucked 8-note melody (C E G C' A G E D, 0.5 s each, looping every 4 s); `life-poster.jpg`
  (frame at 3 s); `counter.webm` / `counter.mp4` — 8 s ffmpeg `testsrc` pattern with a running counter, no
  audio (good for subtitle timing and currentTime); `melody.mp3` / `melody.ogg` (Opus) — the 12 s melody alone.

To see the real state at any time: `node scripts/check-material.mjs material/<ch>/<sec>` (counts topics and
examples; missing top90/top95 show as warnings).

## Workflow that worked (keep it)

1. One agent per module, two tasks: (a) lessons top01…topNN; (b) when approved, resume the same agent for
   top90-integracion + top95-profesional (it knows the lessons). Spawn a FRESH agent for the next module
   (contexts reach ~500K tokens after both tasks).
2. Up to 3 Opus agents in parallel (user rule), one per lane: HTML→Sass→TS→WASM/GPU, CSS, JS→JS-browser.
   Never more than 3; a Fable agent only alone. Agents must not run heavy commands (no build, servers,
   headless browsers); they ask the coordinator.
3. After each task: `node scripts/check-material.mjs <section>` (0 errors / 0 warnings) and the browser
   harness `http://localhost:5174/tools/verify-examples.html?path=<ch>/<sec>[/<topic>]&ms=1200`
   (read `window.__verifyResults`; keep browser_batch waits under ~45 s per call). For a visual check of one example,
   `&only=NN-&show=1&w=520&h=440` keeps it on screen in a frame of that size (`window.__verifyUrls` has the hosted URL
   to open it full size). If reading results is blocked by the Chrome tool ("Cookie/query string data"), strip
   `?&=%` and URLs from the JSON before returning it. Add `&logs=1` to get each
   example's console lines in `result.logs`: exercises must print ❌/✗ for the work left to do in the starting
   state and only ✅/✓ in the solution; audits in top95 pages must print no ❌.
4. Spot-check one or two flagged examples visually; read one main.md for quality.
5. Mark top95 examples `example_stage: professional` (some agents default to final-solution).

## Prompt template for a new lessons agent

Use the prompts of the previous module agents as a template (the coordinator's messages in the session).
Essentials: read AGENTS.md, SKILL.md, plan.md, runtime.md, example/theory skills, and 2 lessons + 4 examples
of the previous approved module of the same chapter for tone; exact assignment (chapter, section, label.txt
text, lessons from plan.md, no top90/top95); audience notes (what the learner already knows; features from
later modules only with a one-line note); quality bar; process (checker per topic); constraints (only that
folder, no app code, no browser, heat rule); final report format.

## Running the app while working

- `npm run dev` (vite :5174 + API on 127.0.0.1:3001). The API must be restarted after server-side changes
  (server.js, compiler, materialTree…).
- Hosted previews are served from `http://localhost:3001/preview/...` (same hostname as the app, port 3001).
- Tests: `npm test` (241). Build: `npm run build`.

## App changes made during the course work (committed: 7c7485d, 6a129ae)

Security hardening of server.js; isolated compiler worker; TypeScript type checking; V8 syntax checks; loop
guards (script block and inline <script>); hosted preview runtime with Chrome-like console; theory sanitizing,
example links `[x](NN-x.md)`, «▶ Run» on code embeds and a console in the theory preview dialog; gallery code
previews for console-only examples, JS/TS type tags, `professional` stage; «Assets» browser; ↗ open-preview-in-tab;
labels from label.txt / main.md heading; content checker (`scripts/check-material.mjs`), contrast helper
(`scripts/contrast.mjs`) and browser harness (`tools/verify-examples.html`).

Second session (6a129ae): browser-only `let top|window|document|location` SyntaxError in the checker; faithful submit
log (real GET URL, POST enctype, files with name/size/type); expandable values in the theory «▶ Run» console;
`&logs=1` in the verify harness.
