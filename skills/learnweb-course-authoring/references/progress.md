# Course progress and hand-off notes

Last updated: 2026-10-14 (seventh session). HTML sec01-04, the whole CSS chapter (sec01-10), Sass sec01, the whole
JavaScript chapter (ch05 sec01-08, plus the regular-expressions topic sec02/top08), the whole ch06 (sec01-06: DOM,
events, forms, network and storage, graphics and animation, browser APIs), ch07 sec01-02 (TypeScript fundamentals and
advanced types) and ch08 sec01 (binary data) are complete and browser-verified (2391 examples, 103 exercises,
checker 0/0).

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
| ch03-css/sec06-tipografia-y-texto | ✅ 4/4 | ✅ 8 + 3 exercises | ✅ 12 | 60 examples; browser-verified 0 problems + measurements (font swap 128→189px, adjusted fallback 189px); fonts in topic assets (OFL); top90/11 base cell rule uses `:where()` so `.price` wins |
| ch03-css/sec07-efectos-visuales | ✅ 5/5 (3D split into top05) | ✅ 8 + 3 exercises | ✅ 12 | 70 examples; browser-verified 0 problems + measurements/screenshots; public-domain images (Velasco, Hokusai, NASA) per topic; top02/08 notes that blend colours differ on P3 screens |
| ch03-css/sec08-responsive | ✅ 5/5 | ✅ 7 + 3 exercises | ✅ 12 | 71 examples; browser-verified 0 problems + measurements (fluid type 16.73px at 480, mini viewports via srcdoc iframes, image-set picks 2x on Retina, scroll-state queries); public-domain images + a 480×600 Velasco crop for `<picture>` art direction |
| ch03-css/sec09-animacion | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 12 | 70 examples; browser-verified 0 problems; freeze-frame positions measured (easing 50 %: linear 114, ease 183, ease-in 72, ease-out 156 px); no infinite animation runs on load in top95; fixed top95/02 (`hidden` lost to `display: grid`) |
| ch03-css/sec10-arquitectura-css | ✅ 5/5 (`@scope` split into top03) | ✅ 8 + 3 exercises | ✅ 11 | 66 examples; browser-verified 0 problems + measurements (token fallbacks, paddings, proximity colours, `::details-content` print trick); fixed top95/02 (a container queried itself: the grid moved to an inner wrapper) |
| ch04-sass/sec01-sass-fundamentos | ✅ 8/8 | ✅ 8 + 3 exercises | ✅ 13 | 91 examples; browser-verified 0 problems (7 intentional compile errors in common-error); exercises self-check via a locked CSSOM script (❌ → ✅) |
| ch05-javascript/sec01-primeros-pasos | ✅ 7/7 | ✅ 7 + 3 exercises | ✅ 12 | 89 examples |
| ch05-javascript/sec02-datos | ✅ 8/8 (top08-expresiones-regulares added in the sixth session) | ✅ 8 + 4 exercises | ✅ 12 | 101 examples; browser-verified 0 problems; Chrome output = node output (backtracking timings ≈ 2× Node) |
| ch05-javascript/sec03-funciones-y-ambito | ✅ 7/7 | ✅ 8 + 3 exercises | ✅ 12 | 87 examples; browser-verified 0 problems |
| ch05-javascript/sec04-objetos-y-prototipos | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 11 | 73 examples; browser-verified 0 problems (exercises ✗ → ✓) |
| ch05-javascript/sec05-clases-y-poo | ✅ 6/6 | ✅ 7 + 3 exercises | ✅ 12 | 79 examples; browser-verified 0 problems; Chrome console = run-example output (hash-compared; only U+202F vs space in Intl ranges) |
| ch05-javascript/sec06-iteracion-y-metaprogramacion | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 12 | 70 examples; browser-verified 0 problems; Chrome console = run-example output for all 70 (console.table compared by count) |
| ch05-javascript/sec07-asincronia | ✅ 6/6 | ✅ 8 + 3 exercises | ✅ 12 | 78 examples; browser-verified (visible frame); console = run-example except documented Chrome-only results; top06/06 + top95/06 teach that `scheduler.yield()` starves painting |
| ch05-javascript/sec08-modulos | ✅ 4/4 (top04 rutas/import maps added to plan.md) | ✅ 7 + 3 exercises | ✅ 12 | 60 examples; written in one go (no review stop); browser-verified: console = run-module output except Chrome-only error texts (fixed in the text); asset imports work in hosted, gallery cards and theory dialogs; esm.sh example online |
| ch06-javascript-en-el-navegador/sec01-el-dom | ✅ 5/5 | ✅ 8 + 3 exercises | ✅ 12 | 67 examples; console output = every ```text block in Chrome (DOM values in the new Chrome format); exercises ✗→✓; clicked by hand (cart clamp, focus kept by moveBefore) |
| ch06-javascript-en-el-navegador/sec02-eventos | ✅ 6/6 | ✅ 8 + 3 exercises | ✅ 12 | 81 examples; load output = ```text blocks; click-throughs in Chrome (phases, real click vs el.click() microtasks, dblclick, menus, carousel); fixed top95/10 carousel (`translate` % of its own box) |
| ch06-javascript-en-el-navegador/sec03-formularios-con-js | ✅ 3/3 | ✅ 7 + 3 exercises | ✅ 12 | 51 examples; console = ```text blocks; clicked through (submit vs requestSubmit, buttons without type, beforeinput + paste, FormData to the demo API, 422 field errors, error summary); fixed two top95 audits (strength label, `document.title` trims «Error: ») |
| ch06-javascript-en-el-navegador/sec04-red-y-almacenamiento | ✅ 5/5 | ✅ 6 + 3 exercises | ✅ 12 | 70 examples; uses the demo API (`/api/demo/*`); console = ```text blocks; clicked through (stale search, history router, deep-link reload 404, `storage` between tabs, retries, downloads, XHR upload) |
| ch06-javascript-en-el-navegador/sec05-graficos-y-animacion | ✅ 5/5 | ✅ 6 + 4 exercises | ✅ 12 | 71 examples; console = ```text blocks in a visible frame (pixels, histogram, getTotalLength, freeze frames); clicked through (canvas hit test, SVG pointer + keys, WAAPI controls, persist(), view-transition skip, AbortSignal loop, physics, signature pad by real drag, eyedropper) |
| ch06-javascript-en-el-navegador/sec06-apis-del-navegador | ✅ 4/4 | ✅ 6 + 4 exercises | ✅ 12 | 66 examples; console = ```text blocks (observers with explicit roots); clicked through (scroll panels, ResizeObserver width, REAL mouse drags, DataTransfer files, Page Visibility); fixed top01/07 (RO loop from its own row height), top03/07 (types list), top95/07 (setHTML drops `<img>`), 10 (missing select option), 12 (focus audit timing), 06 (band vs window height) |
| ch07-typescript/sec01-fundamentos-de-typescript | ✅ 6/6 | ✅ 7 + 3 exercises | ✅ 11 | 79 examples; console and type errors = ```text blocks (new «// Errores de tipos» convention); clicked through (state machine, command palette); top03/03 and top06/10 updated for strict mode (seventh session) |
| ch07-typescript/sec02-tipos-avanzados | ✅ 6/6 | ✅ 6 + 3 exercises | ✅ 11 | 77 examples; console and type errors = ```text blocks; Equal/Expect type tests introduced in top02/01; clicked through (booking form, demo-API purchase incl. timeout, undo/redo) |
| ch08-rumbo-a-webassembly-y-webgpu/sec01-datos-binarios | ✅ 5/5 | ✅ 6 + 4 exercises | ✅ 12 | 74 examples; JavaScript only; generated BMP/PNG/WAV/CSV assets; console = ```text blocks incl. Chrome-only APIs (toBase64/fromHex, Float16Array, Blob.bytes, crypto.subtle); clicked through (save file with CRC, seat bitset in the URL, LEB128, colour bytes) |
| ch07 sec03, ch08 sec02-06 | ⬜ | ⬜ | ⬜ | |

Fourth session (2026-10-13/14): «los siguientes 2 módulos completos» = CSS sec06-tipografia-y-texto + JS
sec06-iteracion-y-metaprogramacion — done (two agents; the HTML lane waited). User rule: if the Chrome extension is
disconnected at a review step, tell the user and wait before continuing.
Then «continúa con otros 2» (2026-10-13): CSS sec07-efectos-visuales + JS sec07-asincronia, two agents. Public-domain
images (Velasco, Hokusai, Apollo 17, Hubble, Aldrin; 960px JPEG + credit lines) are in the gitignored
`claude_resume/images/`; `claude_resume/run-example.mjs` now runs async code (timers, queueMicrotask, MessageChannel,
AbortController, fake rAF; `type="module"` scripts wrapped in an async function; `WAIT=<ms>`).
Then «haz un módulo más, haz los commits y apaga el servidor» (2026-10-14): JS sec08-modulos, one agent writing the
whole module (lessons + top90 + top95) in one go; first course examples that import `.js` files from `assets/` —
done, committed and pushed (84ea2f1); dev server stopped. Fourth session ended here (2026-10-14). Fonts for CSS sec06 (OFL, woff2) are in the gitignored
`claude_resume/fonts/` (README lists axes). Previous goal «termina el módulo 4 y haz el 5» — done. Lanes: HTML lane = HTML → Sass → TS →
WASM/GPU; CSS lane; JS lane = JS → JS in the browser. Max 3 Opus agents at a time (or one Fable alone); the user allowed 4 in the fifth, sixth and seventh sessions — ask before going above 3.

Fifth session (2026-10-14): «continúa con 4 módulos más, puedes crear los 4 agentes» = CSS sec08-responsive,
CSS sec09-animacion, ch06 sec01-el-dom and ch06 sec02-eventos, four Opus xhigh agents in parallel (the user allowed 4
this time), lessons → Chrome review → top90/top95 → Chrome review — all done, committed and pushed; dev server stopped.
App changes this session: the console prints DOM values and browser objects like Chrome, arrays/lists show their
length only from 2 items, and uncaught-error reports come after the page's own error handlers (see below).

Sixth session (2026-10-14): «continúa con 4 módulos más, puedes crear los 4 agentes» = CSS sec10-arquitectura-css,
ch06 sec03-formularios-con-js (with the missing regular-expressions topic, placed in ch05 sec02 as top08),
ch06 sec04-red-y-almacenamiento and ch07 sec01-fundamentos-de-typescript, four Opus xhigh agents in parallel, lessons
→ Chrome review → top90/top95 → Chrome review — all done, committed and pushed; dev server stopped. App changes this
session: a local demo API for network lessons, the theory dialog runs the hosted page and lists TypeScript type
errors, `compiled.js` tabs for TS code embeds (see below). Prompts: `claude_resume/prompts/session6-common.txt` +
one assignment file per module.

Seventh session (2026-10-14): «continúa con 4 módulos más, puedes crear los 4 agentes» = ch06 sec05-graficos-y-animacion,
ch06 sec06-apis-del-navegador, ch07 sec02-tipos-avanzados and ch08 sec01-datos-binarios (first module of the last
chapter; the coordinator created its label), four Opus xhigh agents in parallel, lessons → Chrome review →
top90/top95 → Chrome review — all done, committed and pushed; dev server stopped. App changes: TypeScript scripts
compile with `alwaysStrict`; the console titles DOM errors by their name and no longer prints the ResizeObserver loop
error (see below). Prompts: `claude_resume/prompts/session7-common.txt` + one assignment file per module; facts
measured in Chrome while the agents worked were sent to them by SendMessage (listed in the notes below).

Next actions when resuming (pick with the user):
1. `npm run dev`; read this file; check the Chrome extension (tabs_context_mcp) before any review; agents are fresh
   each module (prompts: "Prompt template" below; the seventh session's shared rules (`session7-common.txt`) + per-module assignment files in
   the gitignored `claude_resume/prompts/` are the best models). Review helpers: `claude_resume/verify/`
   (`expected_from_main.py` + `cmp-main.js`, copied to `tools/_cmp.mjs` while reviewing — delete both temp files
   before committing; Vite reloads the harness page if `tools/_cmp.mjs` changes mid-run).
2. Remaining (2026-10-14): 7 of 38 modules — ch07 sec03-typescript-en-la-practica (classes with parameter
   properties, `querySelector<T>`/`HTMLElementTagNameMap`, typed events, `Promise<T>` + fetch validation against
   `/api/demo/*`, `.d.ts`/`declare global`; promised by sec02: typed fetch helpers, `HTMLElementEventMap`, form state
   bound to inputs) and ch08 sec02-06 (workers and transferables — `transfer()` detaches, promised by sec01 —,
   performance, GPU shaders/WebGL — `u_time`, `gl.bufferData`, power-of-two textures promised —, WebAssembly — LEB128,
   `encodeInto` into memory, i64 as BigInt promised —, WebGPU — `GPUBufferUsage` flags, alignment, `writeBuffer`,
   shader-f16 promised). About 2 rounds: ch07 sec03 + ch08 sec02 + sec03 (+ sec04) in parallel, then sec05-06.
3. ch08 examples are JavaScript (decided in sec01 top01); sec04 uses `renderer: shader` examples too (see the shader
   skill); WebGPU works in the preview (runtime.md).
4. HTML chapter tidy-up candidate (found 2026-10-14 by comparing every ```text block with Chrome): ~45 examples of
   HTML sec01-04 have abridged/illustrative ```text blocks (parser DOM dumps, fetch headers with dates, URLs with
   `<id>`); they were never compared line by line. Two stale array lines were fixed; the rest are fine as prose
   but could be made exact.
5. Optional tidy-ups listed in the notes below (old `href="#"` placeholders, flex-basis-in-a-column example).

Notes carried forward:
- Checked in Chrome 155 during the seventh session: tainted canvas text `SecurityError: Failed to execute 'getImageData'
  on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.` (the same asset from
  `http://127.0.0.1:3001` + path is another origin; with `crossOrigin = 'anonymous'` it works; in cards every asset
  image is cross-origin → always set `crossOrigin` before reading pixels); `animation.cancel()` rejects `finished` with
  `AbortError: The user aborted a request.`; skipTransition → `AbortError: Transition was skipped. skipTransition()
  called`; `fill: 'forwards'` beats later inline styles and replaced fills get `replaceState` `'removed'`;
  putImageData/getImageData may change RGB by 1 for semi-transparent pixels; Uint8ClampedArray rounds half to even;
  `btoa('€')` → `InvalidCharacterError: … outside of the Latin1 range.` (`btoa('ñandú')` encodes Latin-1 silently);
  Chrome has `Uint8Array.fromBase64/toBase64/toHex/fromHex`, `Float16Array`, `Math.f16round`, `Blob.bytes()`;
  `customElements.define` errors (`"card" is not a valid custom element name`, `the name "x-a" has already been used
  with this registry`, `this constructor has already been used with this registry`); IntersectionObserver in the
  preview iframes: implicit root → `rootBounds` null, `root: document` → the iframe's own viewport (use explicit roots);
  `document.fullscreenEnabled` true in the hosted page, false in cards (`TypeError: Disallowed by permissions policy`);
  `navigator.clipboard.writeText` without focus → `NotAllowedError: … Document is not focused.`, in cards blocked by
  permissions policy, from a click in the hosted page it works; the ResizeObserver loop error fires at `window` every
  frame while a callback keeps resizing, and Chrome's console never shows it; DOM errors are titled by name in the
  console (`SyntaxError: Failed to execute 'querySelector'…`); default `setHTML()` drops `<img>` too; a REAL drag adds
  `chromium/x-drag-id` to `dataTransfer.types` (at least under automation); the Chrome tool's `left_click_drag` starts
  native HTML drag and drop (real `dropEffect: move`), synthetic DragEvents leave `dropEffect` `none`; a
  `ResizeObserver` callback that fills an empty row changes the observed height (loop error) — give rows a
  `min-height`; a current-section IntersectionObserver band must not be taller than the sections (min-height +
  end padding make it window-independent).
- Tools that worked: the verify harness with `show=1` for observers/rAF; `__verifyUrls` is an object keyed by
  example path; `computer.left_click_drag` for real DnD; never click download buttons, clipboard writes,
  geolocation, share or fullscreen on the user's machine (they act on the real system).
- Checked in Chrome 155 during the sixth session: gallery/theory cards (`sandbox="allow-scripts"`, no `allow-forms`)
  fire no `submit`/`invalid` events for submit clicks, Enter or `requestSubmit()` (`checkValidity()` works), and
  `indexedDB.open`/`history.pushState` throw `SecurityError` there; the theory dialog is now the hosted page.
  `response.json()` on an empty body → `SyntaxError: Unexpected end of input` (JSON.parse says «…of JSON input»);
  an overwritten cookie moves to the END of `document.cookie`; `document.title = 'Error: '` reads back as `'Error:'`
  (titles are trimmed) — give pages without `<title>` one before prefixing it; port 9 is an unsafe port in Chrome
  (use `localhost:59999` for a refused connection); `::details-content { content-visibility: visible; block-size:
  auto }` shows closed `<details>` (print layers); the `storage` event reaches another same-site tab; CSS a container
  never matches its own `@container` rule nested inside it (sec10 top95/02 had it: put the grid on an inner wrapper).
- TypeScript in LearnWeb: TS 5.9.3, `strict`, libs ES2023 + DOM, `moduleDetection: force` (a local `interface
  Comment` doesn't merge with the DOM's), ES2024+ APIs are type errors; `run-example.mjs` runs `# TypeScript` blocks.
- Checked in Chrome 155 during the fifth session: an iframe's `prefers-color-scheme` follows the used `color-scheme`
  of its `<iframe>` element in the parent (LearnWeb sets none → the OS; the learner's macOS is DARK);
  `container-type: size/inline-size` creates NO containing block for fixed/absolute descendants and NO stacking context
  (removed the old claims from CSS sec03 top04/top05); a real click runs microtasks between listeners, `el.click()`
  doesn't; simultaneous `transitionend` events arrive in alphabetical order of property name; `display: none`
  mid-transition fires `transitioncancel`; duplicate `view-transition-name`s reject `ready` with «Transition was aborted
  because of invalid state. Snapshot capture failed»; `scroll-state(stuck: top)` container queries, `setHTML()` and
  `moveBefore()` exist; `CSS.supports('(backdrop-filter)')` is false (no value), `image-set()` rejects `w`
  descriptors, a media query mixing `and`/`or` without parentheses is `not all`. `link.href` is
  `http://localhost:3001/…` in the hosted preview and `…5174/…` in theory dialogs (relative `<base>` in srcdoc).
- Verification tricks from the fifth session: compare console output with the ```text blocks of main.md (a small
  extractor + a comparison module served from `tools/`, deleted afterwards); click-throughs on the hosted page in a
  second tab (the runtime also logs to the real console, so `read_console_messages` works); freeze frames read via
  `getComputedStyle(el).translate`; screenshots can't be taken while the main thread is blocked, so «compositor keeps
  moving while JS is busy» can't be measured with screenshots; count infinite animations on load with
  `document.getAnimations().filter(a => a.effect.getComputedTiming().iterations === Infinity)`.
- Facts checked in Chrome during CSS sec06 (keep them true in later modules): copy/paste of `text-transform`ed text
  gives the ORIGINAL HTML text (only `getSelection().toString()` returns the transformed one); `hyphens: auto` with
  `lang="en"` splits Spanish «rr» (guer-rilleros, car-retera) while `lang="es"` keeps it (guerri-lleros); Roboto
  Flex's `wdth` axis changes text width only ~15-20% at 16-24px; Chrome doesn't support `ui-serif`/`ui-monospace`;
  `font-family: monospace` alone → 13px; preload + @font-face metric overrides work without console warnings.
- Chrome 155 error texts differ from Node 24 for modules: assigning to an import → `Cannot assign to property 'x' of
  [object Module]` (Node: «read only property … of object '[object Module]'»); `import('lodash')` → `Failed to resolve
  module specifier 'lodash'` (static import: the long message with double quotes and the «Relative references…» hint).
  Always take module error texts from Chrome.
- `scheduler.yield()` (Chrome 155, measured): 400 ms of 8 ms slices → 50 slices but only ~4 painted frames (its
  continuations run ahead of rendering; Chrome paints ~every 100 ms); `setTimeout(0)` → 33 slices / 25 frames;
  rAF + setTimeout → 25 / 25. Yield to a frame every ~16 ms when a JS-driven indicator must stay smooth.
- The verify harness's `show=1` frame under-counts rAF frames during page load (top95/06 printed false there but
  true in a normal tab AND in the app's real preview): confirm frame-count checks in the app preview.
- Checked in Chrome 155 during CSS/JS sec07: rAF never fires in the verify harness's hidden frames — run rAF/timing
  examples with `&show=1&w=520&h=300` (visible frame); `mix-blend-mode` on this Mac (P3 display) does not give
  textbook CMY results (cyan×magenta looks violet, the centre maroon), so never promise exact blend colours; the
  background of a `preserve-3d` element hides children with negative `translateZ`; mask-image `url()` assets load
  in sandboxed theory cards (CORS ok); async iterator helpers don't exist yet; nested `setTimeout(0)` clamps to
  ~4 ms after 5 levels. `run-example.mjs` reports late errors as `[runtime-error]`/`[unhandled-rejection]` lines.
- JS sec06: LearnWeb's console fires Proxy traps when a proxy is logged (Chrome DevTools doesn't) — examples never
  log proxies; generator objects show as `Generator {}` and Map/Set iterators without entries (not fixable from JS).
- Exercise self-checks can be defeated by specificity: a starter base rule like `.prices td { text-align: start }`
  beats the learner's `.price { … }`; give base rules `:where()` (CSS sec06 top90/11 had this bug in its solution).
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
2. Up to 3 Opus agents in parallel (user rule; 4 when the user says so, as in the fifth, sixth and seventh sessions), one per lane: HTML→Sass→TS→WASM/GPU, CSS, JS→JS-browser.
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
- Tests: `npm test` (255). Build: `npm run build`.

## App changes made during the course work (committed: 7c7485d, 6a129ae, 1f74d6f, afbb2fe, 0ef4f6d, 9859213, 6920719, fa301f1, df25af1, dacd319, d63c9c9, b624886)

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

Fourth session (9859213): the console prints identifier keys with accents unquoted (`{café: 12}`) and generator
functions as `ƒ* name()`, like Chrome. The guide's global-name rule now lists `Iterator`/`Proxy`/`Scheduler` and
`var name/status/history/alert` collisions.
6920719: a script/module that fails to load (404, also a static import inside the graph) prints Chrome's
`GET <path> net::ERR_ABORTED 404 (Not Found)` in the console (from resource timings; asset routes send
Timing-Allow-Origin so srcdoc copies see the status); module namespaces print as `Module {…}`.
`claude_resume/run-module.mjs` (gitignored, written by the sec08 agent) runs examples with static imports, Blob/data:
modules, import maps and JSON modules: `node --experimental-vm-modules claude_resume/run-module.mjs <example.md>`.
Fifth session (fa301f1): DOM values print like Chrome DevTools (elements as HTML, `li#a.b`/`text`/`comment` short
forms, NodeList/HTMLCollection/DOMTokenList as arrays, native accessors of browser objects, `console.dir(node)` short,
`DOMException: …`); arrays/lists show the length only from 2 items (29 old ```text lines in ch05 and one in HTML sec01
updated and re-verified); the runtime's uncaught-error reporters stay last on window and honour `preventDefault()`.
Tests: 246.
Seventh session (d63c9c9, b624886): TypeScript scripts compile with `alwaysStrict` (emitted JS starts with
`"use strict";`, like `tsc --strict`; ch07 sec01 top03/03 and top06/10 updated); the console titles DOM errors by
their name like Chrome 155 (`SyntaxError: Failed to execute …`, `Uncaught (in promise) AbortError: …`) and no longer
prints the ResizeObserver loop error. Tests: 255.
Sixth session (df25af1, dacd319): local demo API `/api/demo/*` (`src/utils/demoApi.js`: echo with status/delay,
slow stream, CORS modes, 404 HTML page) and Vite's own CORS middleware off (it refused srcdoc preflights); the
theory dialog runs the hosted page (srcdoc fallback) and lists TypeScript type errors above its console; TS code
embeds get a `compiled.js` tab; sidebar labels drop inline-code backticks. Tests: 253.
