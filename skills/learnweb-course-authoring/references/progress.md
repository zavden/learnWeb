# Course progress and hand-off notes

Last updated: 2026-10-12 (session paused by the user's usage budget).

Read this first when resuming the course work. The syllabus is in [plan.md](plan.md), the authoring
rules in [../SKILL.md](../SKILL.md), runtime capabilities in [runtime.md](runtime.md).

## Status by module

Legend: ✅ complete and verified (checker 0/0 + browser harness) · 🟡 partial · ⬜ not started.

| Module | Lessons | top90 | top95 | Notes |
|---|---|---|---|---|
| ch02-html/sec01-la-web-y-el-documento | ✅ 5/5 | ✅ 7 ex + 3 exercises | ✅ 12 | 67 examples |
| ch02-html/sec02-contenido-y-semantica | 🟡 3/7 | ⬜ | ⬜ | 25 examples so far |
| ch02-html/sec03-formularios | ⬜ | ⬜ | ⬜ | |
| ch02-html/sec04-multimedia-y-embebidos | ⬜ | ⬜ | ⬜ | |
| ch03-css/sec01-fundamentos-y-cascada | ✅ 10/10 | ✅ 7 + 3 exercises | ✅ 11 | 112 examples |
| ch03-css/sec02-modelo-de-cajas | 🟡 2/6 | ⬜ | ⬜ | 18 examples so far |
| ch03-css/sec03 … sec10 | ⬜ | ⬜ | ⬜ | |
| ch04-sass/sec01 | ⬜ | ⬜ | ⬜ | |
| ch05-javascript/sec01-primeros-pasos | ✅ 7/7 | ✅ 7 + 3 exercises | ✅ 12 | 89 examples |
| ch05-javascript/sec02-datos | 🟡 4/7 | ⬜ | ⬜ | 38 examples so far |
| ch05-javascript/sec03 … sec08 | ⬜ | ⬜ | ⬜ | |
| ch06 … ch08 | ⬜ | ⬜ | ⬜ | |

Paused modules (exact state at pause; all checker-clean, no half-written files):

- **ch02-html/sec02-contenido-y-semantica** — ✅ top01-texto (9), top02-listas (7), top03-enlaces (9, assets
  `pages/*.html`, `files/schedule.txt`). ⬜ top04-imagenes, top05-tablas, top06-estructura-semantica,
  top07-accesibilidad, then top90/top95. Notes: JS shown only as inline `onclick` with a "events come later"
  comment; `.md-` code embeds when the console is the point. To check in Chrome: top01/07 `<q>` quotes per
  language, top01/04 `wbr`/`&shy;`, top03/03 (↗ then `window.opener`/referrer), top03/04 download, top03/02 & 09
  fragment jumps in theory cards.
- **ch03-css/sec02-modelo-de-cajas** — ✅ top01-la-caja (9), top02-display (9). ⬜ top03-margenes, top04-tamanos,
  top05-overflow, top06-bordes-sombras-y-fondos, then top90/top95. Notes: DevTools colour convention (content
  #bfdbfe, padding #bbf7d0, border #facc15, margin #fed7aa); JS snippets start with "Adelanto: JavaScript se
  explica en su capítulo" and print `getBoundingClientRect` values on screen. Promises to keep: margin collapsing
  in lesson 3 (top02/08 points there); `margin-inline: auto` centring in lesson 3; `box-shadow` and background
  under the border in lesson 6; the body-background-to-canvas rule promised by ch03 sec01 `04-margen-del-body.md`
  belongs in top06. Gradients, `overflow-wrap`, `object-fit` only as forward references.
- **ch05-javascript/sec02-datos** — ✅ top01-numeros (10), top02-strings (9), top03-arrays (10),
  top04-objetos-literales (9). ⬜ top05-map-set-y-weak, top06-json-y-copias, top07-fechas-e-intl, then
  top90/top95. Notes: earlier lessons reference these by the names «Map, Set y WeakMap», «JSON y copias»,
  «Fechas e Intl» and «Funciones y ámbito» — keep them; promised content: shallow vs deep copy, Map keys,
  `Map.groupBy`; arrow functions are explained once in the arrays main.md (examples add a one-line comment);
  Intl needs explicit locales (es-ES doesn't group 4-digit numbers: `1234,50 €`; outputs contain NBSP); verify
  outputs with node using `TZ=Europe/Madrid`. Plan gap: no regular-expressions lesson yet (consider adding one
  to sec02 or sec06 when resuming).

Next actions when resuming: (1) run the browser harness on the three paused sections (not yet done for the
new lessons); (2) spawn fresh agents to finish each paused module's remaining lessons, then resume them for
top90/top95; (3) continue the lanes in plan order.

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
