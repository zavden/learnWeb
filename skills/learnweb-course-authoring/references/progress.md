# Course progress and hand-off notes

Last updated: 2026-10-12 (session paused by the user's usage budget; module-2 lessons completed by the coordinator).

Read this first when resuming the course work. The syllabus is in [plan.md](plan.md), the authoring
rules in [../SKILL.md](../SKILL.md), runtime capabilities in [runtime.md](runtime.md).

## Status by module

Legend: ✅ complete and verified (checker 0/0 + browser harness) · 🟡 partial · ⬜ not started.

| Module | Lessons | top90 | top95 | Notes |
|---|---|---|---|---|
| ch02-html/sec01-la-web-y-el-documento | ✅ 5/5 | ✅ 7 ex + 3 exercises | ✅ 12 | 67 examples |
| ch02-html/sec02-contenido-y-semantica | ✅ 7/7 | ⬜ | ⬜ | 54 examples; not yet browser-verified |
| ch02-html/sec03-formularios | ⬜ | ⬜ | ⬜ | |
| ch02-html/sec04-multimedia-y-embebidos | ⬜ | ⬜ | ⬜ | |
| ch03-css/sec01-fundamentos-y-cascada | ✅ 10/10 | ✅ 7 + 3 exercises | ✅ 11 | 112 examples |
| ch03-css/sec02-modelo-de-cajas | ✅ 6/6 | ⬜ | ⬜ | 45 examples; not yet browser-verified |
| ch03-css/sec03 … sec10 | ⬜ | ⬜ | ⬜ | |
| ch04-sass/sec01 | ⬜ | ⬜ | ⬜ | |
| ch05-javascript/sec01-primeros-pasos | ✅ 7/7 | ✅ 7 + 3 exercises | ✅ 12 | 89 examples |
| ch05-javascript/sec02-datos | ✅ 7/7 | ⬜ | ⬜ | 63 examples; outputs verified with node (TZ=Europe/Madrid) |
| ch05-javascript/sec03 … sec08 | ⬜ | ⬜ | ⬜ | |
| ch06 … ch08 | ⬜ | ⬜ | ⬜ | |

Modules with lessons done but top90/top95 pending (all checker-clean; lessons written by agents and, for the
last ones, by the coordinator; NONE of these 162 examples has been run through the browser harness yet):

- **ch02-html/sec02-contenido-y-semantica** — top01-texto, top02-listas, top03-enlaces, top04-imagenes,
  top05-tablas, top06-estructura-semantica, top07-accesibilidad. Conventions: tiny JS only to make facts
  visible, labeled "Adelanto: JavaScript se explica en su capítulo"; inline `onclick` with a "events come
  later" note; CSS only for readability (some examples use position/grid with a forward-reference comment).
  To check in Chrome: top01/07 `<q>` quotes per language, top01/04 `wbr`/`&shy;`, top03/03 (↗ then
  `window.opener`), top03/04 download, top04/04-06 `currentSrc` choices (resize / ↗ + device mode),
  top07/07 Tab order, top07/08 skip link on Tab.
- **ch03-css/sec02-modelo-de-cajas** — top01-la-caja, top02-display, top03-margenes, top04-tamanos,
  top05-overflow, top06-bordes-sombras-y-fondos (assets dots.svg, leaf.svg, photo.svg). DevTools colour
  convention (content #bfdbfe, padding #bbf7d0, border #facc15, margin #fed7aa). All promises from earlier
  lessons are fulfilled (margin collapsing, auto centring, box-shadow, background under the border, body
  background → canvas). Forward references only: gradients, filters (sec07), floats/position (sec03),
  flex/grid gap. To check: top05/02 computed overflow-y, top05/05 scrollbar-gutter (macOS overlay
  scrollbars hide the effect), top06/04 body canvas propagation, top06/07 focus rings.
- **ch05-javascript/sec02-datos** — top01-numeros … top07-fechas-e-intl. Arrow functions explained once in
  the arrays main.md (examples add a one-line comment); Intl always with explicit locale/timeZone (es-ES
  doesn't group 4-digit numbers; outputs contain NBSP); verify outputs with `TZ=Europe/Madrid node`.
  Promise for ch05 sec03 (functions): top06-json-y-copias says immutability ("crear un objeto nuevo con lo
  que cambia") is covered in the functions module — include it in top06-funciones-de-orden-superior. Plan
  gap: no regular-expressions lesson yet (used with one-line comments); consider adding one to sec06.

Next actions when resuming:
1. `npm run dev`, then run the browser harness on the three sections above
   (`/tools/verify-examples.html?path=ch02-html/sec02-contenido-y-semantica&ms=1200`, etc.; keep each
   browser_batch under ~45 s and read `window.__verifyResults` afterwards).
2. Write top90-integracion + top95-profesional for those three modules (fresh agents: give them the module
   folder to read first, then the usual top90/top95 instructions; mark top95 `example_stage: professional`).
3. Continue the lanes in plan order: HTML sec03-formularios, CSS sec03-flujo-y-posicionamiento,
   JS sec03-funciones-y-ambito.

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
   (read `window.__verifyResults`; keep browser_batch waits under ~45 s per call).
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
- Tests: `npm test` (234 at pause time). Build: `npm run build`.

## App changes made during the course work (already in the working tree, uncommitted)

Security hardening of server.js; isolated compiler worker; TypeScript type checking; V8 syntax checks; loop
guards (script block and inline <script>); hosted preview runtime with Chrome-like console; theory sanitizing,
example links `[x](NN-x.md)`, «▶ Run» on code embeds and a console in the theory preview dialog; gallery code
previews for console-only examples, JS/TS type tags, `professional` stage; «Assets» browser; ↗ open-preview-in-tab;
labels from label.txt / main.md heading; content checker (`scripts/check-material.mjs`), contrast helper
(`scripts/contrast.mjs`) and browser harness (`tools/verify-examples.html`).
