# What the LearnWeb preview can run

Verified in Chrome (Apple M1) on 2026-10-12, after the runtime rewrite.

## How an example runs

- The main preview is a real page served by the API server on the **same hostname as the app, port 3001**
  (`http://localhost:3001/preview/<ch>/<sec>/<top>/<id>/index.html`). It is cross-origin to the app (it
  cannot touch the editor) but behaves like a normal website. Relative URLs resolve inside the topic's
  `assets/` folder (subfolders allowed): `fetch('datos.json')`, `new Worker('worker.js')`,
  `<img src="foto.webp">`, `<script type="module" src="util.js">`.
- Gallery cards, theory embeds and dialogs use a sandboxed `srcdoc` copy instead (no real storage there; an
  in-memory shim keeps storage-based examples from crashing). Shaders always use `srcdoc`.
- The page is re-run after every pause while typing. `alert/confirm/prompt` are skipped while typing (a
  notice appears) and run normally when the example is opened or ⟳ is pressed.
- The console is cleared on every run.
- Learners can read every file of a topic's `assets/` folder with the «Assets» button of the gallery header
  (code highlighted, images shown), so helper scripts and data files are part of the visible lesson material.
- The ↗ button in the preview toolbar opens the current hosted page in its own tab (useful for `meta viewport`,
  DevTools device mode, quirks mode, printing). The server keeps the last 24 rendered pages.
- Theory preview cards show the page only. The «▶ Run» button under code embeds (and clicking a card) opens a
  dialog that runs the example with a console below it (Chrome-like values that expand on click down to `[[Prototype]]`, groups, `console.table` as a table);
  for console-only examples the console fills the dialog. Gallery cards of console-only examples show code.

## The learner's browser

- Chrome on macOS, time zone **America/Mexico_City** (no daylight saving time since 2022), `navigator.language` **en-US**.
- Never let a printed result depend on the local zone or locale: pass an explicit locale and `timeZone` to `Intl`, build
  instants from ISO strings with `Z` or an offset, and when a value must be local, print the zone first and give the
  expected output for both Madrid and Ciudad de México. DST effects must be shown in a zone that has DST
  (`Europe/Madrid`) through `Intl`; they do not appear in Mexico City.
- Verify console outputs with `TZ=America/Mexico_City node` (Chrome's `Intl` output matched Node's exactly on 2026-10-12).

## Capability matrix (vanilla HTML/CSS/JS/TS examples)

| Capability | Status | Notes |
|---|---|---|
| Classic script (globals, `onclick="fn()"`) | ✅ default | Top-level `function`/`var` become globals as in a normal page |
| `import` / `export`, top-level `await` | ✅ | The script switches to `type="module"` automatically when it has top-level `import`/`export`/`await` or `import.meta` |
| Import from CDN (`https://esm.sh/...`) | ✅ | Needs network; avoid unless the lesson is about it |
| Several JS files | ✅ | One script block per example; extra modules as `.js` files in `assets/` (`import { x } from './03-tienda/util.js'`), import maps, Blob/`data:` modules and `import()`; they also work in sandboxed theory cards and dialogs. A module that fails to load (404) prints Chrome's `GET <path> net::ERR_ABORTED 404 (Not Found)` in the console; module namespaces print as `Module {…}` |
| `localStorage`, `sessionStorage`, IndexedDB, cookies | ✅ | One origin shared by all examples: namespace keys (`lw-css-tema`) and clean up in the example |
| `fetch()` of assets, JSON, text, binary | ✅ | |
| `#anchors`, `:target`, `history.pushState`, `popstate` | ✅ | |
| Forms (`submit`, validation, `method="dialog"`) | ✅ | A submit not handled with `preventDefault()` is blocked and logged with its fields: `GET <action with the form data as query>` or `POST <action> (<enctype>)`, files as `File "cv.pdf" (24 KB, application/pdf)` |
| Web Workers (classic and module), Blob workers | ✅ | |
| `SharedArrayBuffer` / `Atomics` | ❌ | Needs cross-origin isolation (COOP/COEP); explain, show the concept with `postMessage` |
| WebAssembly (`instantiate` from bytes, `instantiateStreaming` of an asset) | ✅ | `.wasm` served as `application/wasm` |
| Canvas 2D, WebGL/WebGL2 | ✅ | |
| WebGPU (`navigator.gpu`) | ✅ | Adapter and device available (Apple, metal-3) |
| alert / confirm / prompt | ✅ | Only on explicit runs (see above) |
| Popups, downloads, fullscreen, pointer lock, clipboard | ✅ | Allowed by the sandbox and `allow=` list; clipboard/fullscreen still need a user gesture |
| Infinite loops | 🛑 stopped | `RangeError: Possible infinite loop at line N` after ~1.2 s in one task, in the script block and in inline `<script>` tags of HTML/HTML-FULL/Pug; disable with `loop_protect: false` |
| JavaScript syntax errors | ✅ | Reported in the editor exactly as V8/Chrome does (classic scripts: `const x;`, duplicate `let`…); module scripts use the TypeScript parser |
| Console | ✅ | log/info/warn/error/debug/table/dir/group/groupCollapsed/count/time/timeLog/assert/trace/clear and `%s %d %i %f %o %O %c`; Chrome-like previews; objects expand down to `[[Prototype]]`; getters shown as `(...)` |
| Runtime errors | ✅ | Mapped to the editor line (JS, TS via source maps, HTML-FULL); `throw "x"` shows `Uncaught "x"` |
| TypeScript | ✅ | `strict` type checking (ES2023 + DOM libs) with errors in the editor; the JS still runs; target ES2022 (native `#private`, class fields) |
| SCSS / SASS | ✅ | Dart Sass 1.98. Built-in modules (`sass:math`, `sass:color`, `sass:map`, `sass:list`, `sass:string`, `sass:meta`, `sass:selector`); no `@use` of other files; endless loops are stopped. The generated CSS is visible: code embeds of Sass examples get a generated `compiled.css` tab right after the SCSS tab (and a `sass-output.txt` tab with `styles.scss:4 @debug: …`, `@warn: …` and `Error: …` lines when there are messages, followed by the call stack when the message comes from inside a mixin/function, and the compiler's own timeout/memory errors for endless loops); in the editor, a «CSS» button in the preview toolbar shows the compiled CSS and those messages over the preview, and the status bar lists them under «Compile». A compile error leaves the page without CSS and shows the error |
| Pug | ✅ | No `include`/`extends` |
| Browser default styles | ✅ | Plain HTML examples get no injected CSS: what you see is the real user-agent stylesheet |
| Page language | ✅ | The generated page is `<html lang="es">`; set `lang: en` (or any BCP-47 tag) in the frontmatter to change it. HTML-FULL documents use their own `<html lang>`. Note: `[lang…]` / `:lang()` selectors also match that `<html>` element — scope them (`p[lang|="es"]`) |
| Links to other sites | ↗ | Open in a new tab (the preview stays on the page) and a console note says so; same-origin links (other pages/files in `assets/`) navigate normally |
