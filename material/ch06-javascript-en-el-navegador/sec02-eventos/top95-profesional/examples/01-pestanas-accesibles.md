---
example_description: "Pestañas accesibles según WAI-ARIA: roving tabindex, flechas, Inicio y Fin con activación automática, un único objeto handleEvent, y un evento cancelable tabs:beforechange que un panel con notas sin guardar usa para impedir el cambio y ofrecer guardar o descartar"
example_tags: "javascript|eventos|profesional|pestanas|tablist|roving-tabindex|customevent|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="recipe">
  <h1>Pozole rojo</h1>
  <div class="tabs" data-tabs>
    <div role="tablist" aria-label="Secciones de la receta">
      <button type="button" role="tab" id="tab-ingredients" aria-controls="panel-ingredients" aria-selected="true">Ingredientes</button>
      <button type="button" role="tab" id="tab-steps" aria-controls="panel-steps" aria-selected="false" tabindex="-1">Preparación</button>
      <button type="button" role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false" tabindex="-1">Mis notas</button>
    </div>
    <section role="tabpanel" id="panel-ingredients" aria-labelledby="tab-ingredients" tabindex="0">
      <ul>
        <li>1 kg de maíz pozolero precocido</li>
        <li>800 g de maciza y espinazo de cerdo</li>
        <li>4 chiles guajillo y 2 anchos</li>
        <li>Rábanos, lechuga, orégano y limón para servir</li>
      </ul>
    </section>
    <section role="tabpanel" id="panel-steps" aria-labelledby="tab-steps" tabindex="0" hidden>
      <ol>
        <li>Cuece la carne con ajo y cebolla durante hora y media.</li>
        <li>Hidrata los chiles, lícualos y cuela la salsa.</li>
        <li>Añade el maíz y la salsa al caldo; deja hervir 30 minutos.</li>
      </ol>
    </section>
    <section role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden>
      <label for="notes">Notas para la próxima vez</label>
      <textarea id="notes" rows="3"></textarea>
      <div id="unsaved" class="unsaved" role="alert" hidden>
        <p>Tienes notas sin guardar.</p>
        <button type="button" data-notes="save">Guardar</button>
        <button type="button" data-notes="discard">Descartar</button>
      </div>
      <p class="saved">Guardadas: <output id="saved-notes">—</output></p>
    </section>
  </div>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --accent-soft: #dbeafe;
  --warning: #b45309;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.recipe {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.3rem;
  margin-top: 0;
}
[role="tablist"] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 2px solid var(--line);
}
[role="tab"] {
  font: inherit;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 0.5rem 0.5rem 0 0;
  background: var(--page);
  color: var(--ink);
  cursor: pointer;
}
[role="tab"][aria-selected="true"] {
  border-color: var(--accent);
  background: var(--surface);
  font-weight: 700;
  box-shadow: inset 0 3px 0 var(--accent);
}
[role="tabpanel"] {
  padding: 0.75rem 1rem;
  border: 1px solid var(--line);
  border-top: 0;
  background: var(--surface);
}
textarea {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font: inherit;
  padding: 0.4rem;
}
.unsaved {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--warning);
  background: #fffbeb;
}
.unsaved p {
  margin: 0 0 0.4rem;
}
.unsaved button {
  font: inherit;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
.saved {
  color: var(--muted);
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Pestañas accesibles (patrón «Tabs» de WAI-ARIA, activación automática).
//
// Decisiones de diseño:
// - Roving tabindex: solo la pestaña activa tiene tabindex="0"; Tab entra en la
//   lista por ella y sale al panel. Dentro, las flechas mueven y activan.
// - Un objeto con handleEvent atiende click y keydown con UN registro por tipo
//   (delegación en la lista) y con this = la instancia, sin bind.
// - Antes de cambiar, la lista PREGUNTA con un evento cancelable
//   (tabs:beforechange). Quien tenga algo que proteger, como unas notas sin
//   guardar, llama a preventDefault(). Después avisa con tabs:change.
// - El foco solo se mueve si ya estaba en la lista: las autocomprobaciones del
//   final no le roban el foco a la página que contiene esta vista previa.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false; // true durante la autocomprobación: no ensucia el registro
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class Tabs {
  #root;
  #tabs;

  constructor(root) {
    this.#root = root;
    this.#tabs = [...root.querySelectorAll('[role="tab"]')];
    const tablist = root.querySelector('[role="tablist"]');
    tablist.addEventListener('click', this);
    tablist.addEventListener('keydown', this);
  }

  get selected() {
    return this.#tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  }

  handleEvent(event) {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    if (event.type === 'click') {
      this.select(tab, 'clic');
      return;
    }
    const index = this.#tabs.indexOf(tab);
    const last = this.#tabs.length - 1;
    const targets = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) return;
    event.preventDefault(); // que Inicio/Fin no desplacen la página
    this.select(this.#tabs[targets[event.key]], `tecla ${event.key}`);
  }

  select(tab, source) {
    const previous = this.selected;
    if (tab === previous) return true;
    const allowed = this.#root.dispatchEvent(new CustomEvent('tabs:beforechange', {
      bubbles: true,
      cancelable: true,
      detail: { from: previous.id, to: tab.id, source },
    }));
    if (!allowed) return false;
    const focusWasInside = this.#root.querySelector('[role="tablist"]').contains(document.activeElement);
    for (const each of this.#tabs) {
      const isSelected = each === tab;
      each.setAttribute('aria-selected', String(isSelected));
      each.tabIndex = isSelected ? 0 : -1;
      document.getElementById(each.getAttribute('aria-controls')).hidden = !isSelected;
    }
    if (focusWasInside) tab.focus();
    this.#root.dispatchEvent(new CustomEvent('tabs:change', {
      bubbles: true,
      detail: { from: previous.id, to: tab.id, source },
    }));
    return true;
  }
}

// ── El panel de notas: protege lo que no se ha guardado.
function createNotes({ textarea, warning, savedOutput }) {
  let saved = '';
  const isDirty = () => textarea.value !== saved;
  document.addEventListener('tabs:beforechange', (event) => {
    if (event.detail.from !== 'tab-notes' || !isDirty()) return;
    event.preventDefault();
    warning.hidden = false;
    logLine(`⛔ ${event.detail.to}: notas sin guardar (${event.detail.source})`);
  });
  warning.addEventListener('click', (event) => {
    const action = event.target.closest('[data-notes]')?.dataset.notes;
    if (!action) return;
    if (action === 'save') saved = textarea.value;
    else textarea.value = saved;
    savedOutput.textContent = saved || '—';
    warning.hidden = true;
    logLine(action === 'save' ? '💾 notas guardadas' : '↩️ cambios descartados');
  });
  return { isDirty };
}

const tabs = new Tabs(document.querySelector('[data-tabs]'));
const notes = createNotes({
  textarea: document.querySelector('#notes'),
  warning: document.querySelector('#unsaved'),
  savedOutput: document.querySelector('#saved-notes'),
});
document.addEventListener('tabs:change', (event) => {
  logLine(`📑 ${event.detail.from} → ${event.detail.to} (${event.detail.source})`);
});

// ── Autocomprobación (simulada con dispatchEvent; deja todo como estaba).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const tabsList = [...document.querySelectorAll('[role="tab"]')];
  expect('3 pestañas, cada una con su panel (aria-controls ↔ aria-labelledby)', tabsList.every((tab) =>
    document.getElementById(tab.getAttribute('aria-controls'))?.getAttribute('aria-labelledby') === tab.id));
  expect('solo la pestaña activa tiene tabindex 0', tabsList.filter((tab) => tab.tabIndex === 0).length === 1);
  const press = (key) => tabs.selected.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  press('ArrowRight');
  expect('→ activa «Preparación» y muestra solo su panel', tabs.selected.id === 'tab-steps'
    && [...document.querySelectorAll('[role="tabpanel"]')].filter((panel) => !panel.hidden).length === 1);
  press('End');
  expect('Fin activa la última', tabs.selected.id === 'tab-notes');
  const textarea = document.querySelector('#notes');
  textarea.value = 'Probar con chile de árbol';
  press('Home');
  expect('con notas sin guardar, el cambio se cancela', tabs.selected.id === 'tab-notes' && notes.isDirty());
  document.querySelector('[data-notes="discard"]').click();
  press('Home');
  expect('tras descartar, Inicio vuelve a la primera', tabs.selected.id === 'tab-ingredients' && !notes.isDirty());
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: Tab hasta las pestañas y usa ← → Inicio Fin; escribe una nota y prueba a cambiar de pestaña');
```
