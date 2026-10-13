# Course progress and hand-off notes

Last updated: 2026-10-13. Modules 2-5 of every lane are complete and browser-verified (1200 examples, checker 0/0).

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
| ch03-css/sec05-grid | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 13 | 70 examples; browser-verified 0 problems (rulers, overlays, dense, subgrid, reading-flow Tab order); top90/09 SKU made unbreakable so `1fr` shows the bug |
| ch03-css/sec06 … sec10 | ⬜ | ⬜ | ⬜ | |
| ch04-sass/sec01-sass-fundamentos | ✅ 8/8 | ✅ 8 + 3 exercises | ✅ 13 | 91 examples; browser-verified 0 problems (7 intentional compile errors in common-error); exercises self-check via a locked CSSOM script (❌ → ✅) |
| ch05-javascript/sec01-primeros-pasos | ✅ 7/7 | ✅ 7 + 3 exercises | ✅ 12 | 89 examples |
| ch05-javascript/sec02-datos | ✅ 7/7 | ✅ 8 + 4 exercises | ✅ 12 | 91 examples; browser-verified 0 problems; Chrome output = node output |
| ch05-javascript/sec03-funciones-y-ambito | ✅ 7/7 | ✅ 8 + 3 exercises | ✅ 12 | 87 examples; browser-verified 0 problems |
| ch05-javascript/sec04-objetos-y-prototipos | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 11 | 73 examples; browser-verified 0 problems (exercises ✗ → ✓) |
| ch05-javascript/sec05-clases-y-poo | ✅ 6/6 | ✅ 7 + 3 exercises | ✅ 12 | 79 examples; browser-verified 0 problems; Chrome console = run-example output (hash-compared; only U+202F vs space in Intl ranges) |
| ch05-javascript/sec06 … sec08 | ⬜ | ⬜ | ⬜ | |
| ch06 … ch08 | ⬜ | ⬜ | ⬜ | |

Current goal (user, 2026-10-13): «termina el módulo 4 y haz el 5» — done. Lanes: HTML lane = HTML → Sass → TS →
WASM/GPU; CSS lane; JS lane = JS → JS in the browser. Max 3 Opus agents at a time (or one Fable alone).

Next actions when resuming (pick with the user):
1. `npm run dev`; read this file; agents are fresh each module (prompts: see "Prompt template" below and the
   coordinator's messages; the scratchpad `prompts/` folder may be gone).
2. CSS lane: `ch03-css/sec06-tipografia-y-texto` (promises waiting: unitless line-height, overflow-wrap,
   writing modes turning the grid/flex axes).
3. JS lane: `ch05-javascript/sec06-iteracion-y-metaprogramacion` (promises: generators shorten hand-written
   `next()`, iterable protocol, Proxy for `obj[i]`/`__getattr__`). Consider adding a regular-expressions topic
   (no regex lesson exists yet; examples avoid them).
4. HTML lane: Sass is complete (ch04 has one section). TypeScript (ch07) comes after ch06 in the course order, so
   before starting it either write JS sec06-08 + ch06 first, or let this lane help the CSS lane (sec07+). Ask.
5. Optional tidy-ups listed in the notes below (old `href="#"` placeholders, flex-basis-in-a-column example).

Notes carried forward:
- JS: when a base/prototype object is frozen, plain `=` cannot override its properties on objects that inherit
  from it (the "override mistake": the inherited read-only property blocks the assignment, silently in sloppy
  mode); use `Object.defineProperty` or class fields (define semantics). Came up in sec04 top90/07, top95/04, 10.
- `claude_resume/run-example.mjs` prints LearnWeb-format console output (groups nested correctly); no DOM, and
  `structuredClone` results are cross-realm there (`instanceof Date` false, true in Chrome).
- Flexbox trap not yet taught as its own example: `flex: 1 1 9rem` on an item of a COLUMN container sets its
  height (flex-basis follows the main axis). Found in sec04 top95/09; candidate for a future debugging example.
- Sass facts found while writing: an unquoted map key like `green`/`white` is a colour (interpolating it warns);
  there is no `map.length` (use `list.length`); interpolation drops quotes, `meta.inspect` keeps them; Dart Sass
  1.98 deprecates the `if()` function and global functions; `@error` inside a mixin reports the `@include` line.
- Checker gotcha: `<!doctype`/`<body` inside a `srcdoc="…"` attribute trip `html-body-fragment-expected`; wrap the
  srcdoc content in a `<div>` instead of a full document.
- Learner's browser: America/Mexico_City (no DST), en-US. See runtime.md "The learner's browser".
- JS sec02 promise: immutability is taught in sec03/top06-funciones-de-orden-superior. Plan gap: no
  regular-expressions lesson yet; the sec05 agent removed regexes from its examples (string checks instead).
  Add a regex topic (e.g. to sec06 or a new JS section) before the forms-with-JS module needs it.
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

## App changes made during the course work (committed: 7c7485d, 6a129ae, 1f74d6f, afbb2fe, 0ef4f6d)

Security hardening of server.js; isolated compiler worker; TypeScript type checking; V8 syntax checks; loop
guards (script block and inline <script>); hosted preview runtime with Chrome-like console; theory sanitizing,
example links `[x](NN-x.md)`, «▶ Run» on code embeds and a console in the theory preview dialog; gallery code
previews for console-only examples, JS/TS type tags, `professional` stage; «Assets» browser; ↗ open-preview-in-tab;
labels from label.txt / main.md heading; content checker (`scripts/check-material.mjs`), contrast helper
(`scripts/contrast.mjs`) and browser harness (`tools/verify-examples.html`).

Second session (6a129ae): browser-only `let top|window|document|location` SyntaxError in the checker; faithful submit
log (real GET URL, POST enctype, files with name/size/type); expandable values in the theory «▶ Run» console;
`&logs=1` in the verify harness.

Third session (1f74d6f, afbb2fe, 0ef4f6d): Sass examples show the generated CSS (`compiled.css` tab in code embeds,
«CSS» toggle in the editor preview) and compiler messages with call stacks (`sass-output.txt`); the checker allows
Sass errors/deprecations in common-error/exercise examples; verify harness `show=1&w=&h=` keeps one example on
screen and keeps long console lines for output comparisons; module detection no longer mistakes methods named
`import…`/`export…` for module syntax.
