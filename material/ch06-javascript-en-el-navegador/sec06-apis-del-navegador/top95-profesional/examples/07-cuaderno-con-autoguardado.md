---
example_description: "Un cuaderno de catas editable (contenteditable) que se guarda solo: un MutationObserver detecta cualquier cambio (al escribir o desde los botones), espera 800 ms sin cambios para guardar en localStorage, guarda en el acto cuando la pestaña se oculta (visibilitychange) o se cierra (pagehide), y al volver restaura el HTML pasándolo por setHTML para que no entre nada peligroso"
example_tags: "javascript|mutationobserver|contenteditable|autoguardado|localstorage|visibilitychange|sethtml|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1 id="notebook-title">Cuaderno de catas</h1>
  <p class="toolbar">
    <button id="add-tasting" type="button">＋ Plantilla de cata</button>
    <button id="clear" type="button">Borrar lo guardado</button>
    <span class="meta"><output id="words">0</output> palabras · <output id="save-state" role="status">—</output></span>
  </p>
  <div id="editor" class="editor" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="notebook-title" spellcheck="true"></div>
  <p class="hint">Se guarda solo en este navegador (clave <code>lw-apis-cuaderno</code>). Escribe, cambia de pestaña y vuelve, o pulsa ⟳.</p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
}
.meta {
  margin-inline-start: auto;
  font-size: 0.85rem;
  color: #52606d;
}
.editor {
  min-height: 12rem;
  padding: 0.75rem 1rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  line-height: 1.55;
}
.editor:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.editor h2 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.05rem;
}
.editor ul {
  margin: 0;
}
.hint {
  font-size: 0.85rem;
  color: #52606d;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// CUADERNO DE CATAS CON AUTOGUARDADO.
//
// Decisiones de diseño:
// - Un MutationObserver (childList, characterData, attributes, subtree) ve
//   TODOS los cambios del editor: lo que se escribe y lo que insertan los
//   botones. El evento input solo vería lo primero.
// - Guardado con «debounce»: cada cambio reinicia una espera de 800 ms; se
//   guarda una vez cuando dejas de escribir. Al ocultarse la pestaña
//   (visibilitychange → hidden, el último momento fiable en un móvil) o al
//   cerrarla (pagehide), se guarda en el acto lo pendiente.
// - Se guarda un objeto con versión: { version, html, savedAt }. Al leerlo se
//   valida y el HTML pasa por setHTML(), que quita <script>, onerror="…" y
//   compañía (en Chrome 155, también las imágenes): lo guardado lo puede haber
//   tocado cualquiera.
// - Todo el autoguardado vive en createAutosave(), que se puede probar con
//   otro editor y otra clave (las comprobaciones lo hacen y luego la borran).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y
// almacenamiento, y este módulo.

const KEY = 'lw-apis-cuaderno';
const editor = document.querySelector('#editor');
const wordsOutput = document.querySelector('#words');
const saveState = document.querySelector('#save-state');
const timeFormat = new Intl.DateTimeFormat('es-MX', { timeStyle: 'short', timeZone: 'America/Mexico_City' });
const countWords = (element) => element.textContent.trim().split(/\s+/).filter(Boolean).length;

// HTML ajeno → setHTML (limpia) o, si no existe, solo texto.
function putHTML(element, html) {
  if (typeof element.setHTML === 'function') element.setHTML(html);
  else element.textContent = html;
}

function restore(element, key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.version === 1 && typeof saved.html === 'string') {
      putHTML(element, saved.html);
      return saved;
    }
  } catch {
    // JSON roto: se ignora y se empieza de cero
  }
  return null;
}

function createAutosave(element, key, { delay = 800, onChange = () => {}, onSave = () => {} } = {}) {
  let timer = null;
  let dirty = false;
  let saves = 0;
  function save() {
    clearTimeout(timer);
    timer = null;
    if (!dirty) return false;
    const record = { version: 1, html: element.innerHTML, savedAt: Date.now() };
    try {
      localStorage.setItem(key, JSON.stringify(record));
      dirty = false;
      saves += 1;
      onSave(record);
      return true;
    } catch (error) {
      onChange(`no se pudo guardar (${error.name})`);
      return false;
    }
  }
  const observer = new MutationObserver(() => {
    dirty = true;
    onChange('cambios sin guardar');
    clearTimeout(timer);
    timer = setTimeout(save, delay);
  });
  observer.observe(element, { childList: true, characterData: true, attributes: true, subtree: true });
  const controller = new AbortController();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  }, { signal: controller.signal });
  window.addEventListener('pagehide', save, { signal: controller.signal });
  return {
    flush: save,
    // Un cambio hecho por la propia app que NO debe guardarse: los registros
    // se descartan con takeRecords() (lección «Observers»).
    withoutSaving(change) {
      change();
      observer.takeRecords();
      clearTimeout(timer);
      timer = null;
      dirty = false;
    },
    get dirty() { return dirty; },
    get saves() { return saves; },
    stop() {
      save();
      observer.disconnect();
      controller.abort();
    },
  };
}

// ── El cuaderno de la página ─────────────────────────────────────────────
function tastingTemplate() {
  const fragment = document.createDocumentFragment();
  const title = document.createElement('h2');
  title.textContent = 'Café de …';
  const list = document.createElement('ul');
  for (const field of ['Aroma: ', 'Acidez: ', 'Cuerpo: ', 'Nota final: ']) {
    const item = document.createElement('li');
    item.textContent = field;
    list.append(item);
  }
  fragment.append(title, list);
  return fragment;
}
const DEFAULT_HTML = '<h2>Café de Chiapas, lavado</h2><ul><li>Aroma: chocolate y nuez</li><li>Acidez: media, cítrica</li></ul>';

const saved = restore(editor, KEY);
if (!saved) putHTML(editor, DEFAULT_HTML);
wordsOutput.textContent = countWords(editor);
saveState.textContent = saved ? `guardado a las ${timeFormat.format(saved.savedAt)}` : 'sin guardar todavía';

const autosave = createAutosave(editor, KEY, {
  onChange(text) {
    saveState.textContent = text;
    wordsOutput.textContent = countWords(editor);
  },
  onSave(record) {
    saveState.textContent = `guardado a las ${timeFormat.format(record.savedAt)}`;
  },
});
document.querySelector('#add-tasting').addEventListener('click', () => {
  editor.append(tastingTemplate()); // un cambio por código: el observer lo ve igual
});
document.querySelector('#clear').addEventListener('click', () => {
  autosave.withoutSaving(() => putHTML(editor, DEFAULT_HTML));
  localStorage.removeItem(KEY);
  wordsOutput.textContent = countWords(editor);
  saveState.textContent = 'borrado del navegador: vuelve la nota de ejemplo';
});

// ── Comprobaciones al cargar (con un editor y una clave de prueba) ───────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const TEST_KEY = 'lw-apis-cuaderno-prueba';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const testEditor = document.createElement('div');
testEditor.textContent = 'Café de Oaxaca';
const testSave = createAutosave(testEditor, TEST_KEY, { delay: 50 });

testEditor.firstChild.data = 'Café de Oaxaca, natural'; // como al escribir: characterData
await Promise.resolve(); // los registros llegan en una microtarea
audit('escribir se detecta (characterData)', testSave.dirty, true);
testEditor.append(tastingTemplate()); // como un botón: childList
testEditor.querySelector('li').append('cacao');
await wait(120);
audit('varios cambios seguidos → un solo guardado', testSave.saves, 1);
const copy = document.createElement('div');
restore(copy, TEST_KEY);
audit('lo guardado se restaura en otro editor', `${copy.querySelectorAll('li').length} líneas · ${copy.querySelector('li').textContent}`, '4 líneas · Aroma: cacao');
testEditor.append(' y panela');
await Promise.resolve();
audit('flush() (lo que hace visibilitychange → hidden) guarda en el acto', `${testSave.flush()} · ${testSave.saves}`, 'true · 2');
localStorage.setItem(TEST_KEY, JSON.stringify({ version: 1, html: '<img src="x" onerror="alert(1)"><script>alert(2)</script><p>Nota</p>' }));
restore(copy, TEST_KEY);
// (La configuración por defecto de setHTML en Chrome 155 quita también <img>.)
audit('el HTML guardado pasa por setHTML', copy.innerHTML, '<p>Nota</p>');
testSave.withoutSaving(() => testEditor.replaceChildren());
audit('withoutSaving: un cambio de la app no queda pendiente', `${testSave.dirty} · ${testSave.flush()}`, 'false · false');
testSave.stop();
localStorage.removeItem(TEST_KEY); // la clave de prueba no se queda
console.log('Listo: escribe en el cuaderno o añade una plantilla; espera a «guardado», cambia de pestaña o pulsa ⟳');
```
