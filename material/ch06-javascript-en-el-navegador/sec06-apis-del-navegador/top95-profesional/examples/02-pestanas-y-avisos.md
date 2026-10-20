---
example_description: "Dos componentes de un sistema de diseño: <app-tabs>, pestañas accesibles con slots (las pestañas y los paneles viven en el light DOM para que las referencias ARIA funcionen), roving tabindex, flechas/Inicio/Fin, atributo selected reflejado y un evento tab-change composed; y <app-toast>, avisos en una región role=\"status\" de su Shadow DOM que se cierran solos, se pausan con el puntero, el foco o la pestaña oculta y no se deslizan si se pide menos movimiento"
example_tags: "javascript|web-components|shadow-dom|slots|tabs|aria|toast|visibilitychange|prefers-reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Café de Chiapas: cómo prepararlo</h1>
  <app-tabs id="methods" label="Métodos de preparación" selected="0">
    <h2 slot="tab">Espresso</h2>
    <div slot="panel">
      <p>18 g de café molido fino, 36 g de bebida en 25 a 30 segundos. Notas de chocolate amargo y mucho cuerpo.</p>
    </div>
    <h2 slot="tab">Prensa francesa</h2>
    <div slot="panel">
      <p>Molido grueso, 60 g por litro de agua a 93 °C. Cuatro minutos, remueve, y baja el émbolo despacio.</p>
    </div>
    <h2 slot="tab">De olla</h2>
    <div slot="panel">
      <p>Agua con piloncillo y una raja de canela; al hervir, apaga, añade el café y deja reposar cinco minutos tapado.</p>
    </div>
  </app-tabs>
  <p><button id="save" type="button">♡ Guardar en mis recetas</button></p>
  <app-toast id="toasts"></app-toast>
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
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}
/* El tema de los componentes, desde la página: variables y ::part. */
app-tabs {
  --tabs-accent: #92400e;
}
app-tabs::part(tablist) {
  border-bottom-color: #cbd2d9;
}
app-tabs [slot="panel"] {
  padding: 0.25rem 0.25rem 0.5rem;
  line-height: 1.5;
}
app-toast {
  --toast-success: #15803d;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
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
// PESTAÑAS Y AVISOS: DOS COMPONENTES DE UN SISTEMA DE DISEÑO.
//
// Decisiones de diseño:
// - <app-tabs> deja las pestañas (slot="tab") y los paneles (slot="panel") en
//   el light DOM: aria-controls y aria-labelledby son referencias por id, y
//   un id no se ve a través de la frontera del Shadow DOM. El componente solo
//   pone roles, ids, aria-selected, tabindex y hidden; la página escribe el
//   contenido y lo estiliza. slotchange vuelve a preparar las pestañas si
//   cambian.
// - Teclado del patrón «tabs» de ARIA: un solo Tab entra en la pestaña
//   activa (roving tabindex); flechas, Inicio y Fin se mueven y activan.
// - selected se refleja como atributo; tab-change sale del host con
//   composed: true para que también lo oiga una página que meta las pestañas
//   dentro de otro componente.
// - <app-toast> guarda los avisos en una región role="status" de su Shadow
//   DOM. Cada aviso tiene botón de cerrar y una cuenta atrás que se pausa con
//   el puntero encima, con el foco dentro o con la pestaña oculta
//   (visibilitychange): nadie se pierde un aviso que no ha podido leer. La
//   entrada se anima con element.animate solo sin prefers-reduced-motion.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let uid = 0;
const nextId = (prefix) => `${prefix}-${uid += 1}`;

// ── <app-tabs> ───────────────────────────────────────────────────────────
const TABS_CSS = `
  :host { display: block; }
  [part="tablist"] { display: flex; flex-wrap: wrap; gap: 0.25rem; border-bottom: 2px solid #e4e7eb; margin-bottom: 0.5rem; }
  ::slotted([slot="tab"]) { margin: 0; padding: 0.4rem 0.75rem; font-size: 0.95rem; border-radius: 0.375rem 0.375rem 0 0; cursor: pointer; }
  ::slotted([aria-selected="true"]) { color: var(--tabs-accent, #1d4ed8); box-shadow: inset 0 -3px 0 currentColor; }
  ::slotted([slot="tab"]:focus-visible) { outline: 3px solid #1d4ed8; outline-offset: 2px; }
  ::slotted([hidden]) { display: none !important; }
`;
class AppTabs extends HTMLElement {
  static observedAttributes = ['selected'];
  #tabs = [];
  #panels = [];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = TABS_CSS;
    const tablist = document.createElement('div');
    tablist.setAttribute('part', 'tablist');
    tablist.setAttribute('role', 'tablist');
    const tabSlot = document.createElement('slot');
    tabSlot.name = 'tab';
    tablist.append(tabSlot);
    const panelSlot = document.createElement('slot');
    panelSlot.name = 'panel';
    root.append(style, tablist, panelSlot);
    root.addEventListener('slotchange', () => this.#setUp());
    this.addEventListener('click', (event) => {
      const tab = event.target.closest('[slot="tab"]');
      if (tab) this.select(this.#tabs.indexOf(tab), { focus: true });
    });
    this.addEventListener('keydown', (event) => this.#onKeydown(event));
  }

  get selected() { return Number(this.getAttribute('selected') ?? 0); }
  set selected(index) { this.setAttribute('selected', String(index)); }

  connectedCallback() {
    this.shadowRoot.querySelector('[role="tablist"]').setAttribute('aria-label', this.getAttribute('label') ?? '');
    this.#setUp();
  }
  attributeChangedCallback() {
    this.#update();
  }

  select(index, { focus = false } = {}) {
    const count = this.#tabs.length;
    const next = ((index % count) + count) % count; // de la última a la primera, y al revés
    const changed = next !== this.selected;
    this.selected = next;
    if (focus) this.#tabs[next].focus();
    if (changed) {
      this.dispatchEvent(new CustomEvent('tab-change', {
        bubbles: true,
        composed: true,
        detail: { index: next, label: this.#tabs[next].textContent },
      }));
    }
  }

  #setUp() {
    this.#tabs = [...this.querySelectorAll(':scope > [slot="tab"]')];
    this.#panels = [...this.querySelectorAll(':scope > [slot="panel"]')];
    this.#tabs.forEach((tab, index) => {
      const panel = this.#panels[index];
      tab.id ||= nextId('tab');
      panel.id ||= nextId('panel');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
    });
    this.#update();
  }
  #update() {
    this.#tabs.forEach((tab, index) => {
      const active = index === this.selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1; // roving tabindex
      this.#panels[index].hidden = !active;
    });
  }
  #onKeydown(event) {
    const index = this.#tabs.indexOf(event.target);
    if (index === -1) return;
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: this.#tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    this.select(moves[event.key], { focus: true });
  }
}
customElements.define('app-tabs', AppTabs);

// ── <app-toast> ──────────────────────────────────────────────────────────
const TOAST_CSS = `
  :host { position: fixed; inset: auto 1rem 1rem auto; z-index: 10; width: min(20rem, calc(100vw - 2rem)); }
  [role="status"] { display: grid; gap: 0.5rem; }
  .toast { display: flex; align-items: start; gap: 0.5rem; padding: 0.6rem 0.75rem; border-radius: 0.5rem;
    background: #1f2933; color: #f5f7fa; border-left: 5px solid var(--toast-success, #15803d); box-shadow: 0 4px 12px rgb(0 0 0 / 0.25); }
  .toast p { margin: 0; flex: 1; }
  button { font: inherit; border: 0; border-radius: 0.25rem; background: transparent; color: inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #93c5fd; outline-offset: 1px; }
`;
class AppToast extends HTMLElement {
  #region;
  #timers = new Set();
  #controller = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = TOAST_CSS;
    this.#region = document.createElement('div');
    this.#region.setAttribute('role', 'status'); // aria-live="polite" implícito
    root.append(style, this.#region);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    document.addEventListener('visibilitychange', () => {
      for (const timer of this.#timers) timer.setPaused(document.hidden);
    }, { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
    for (const timer of this.#timers) timer.stop();
  }

  get count() { return this.#region.children.length; }

  show(message, { duration = 5000 } = {}) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const text = document.createElement('p');
    text.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Cerrar aviso');
    toast.append(text, close);
    this.#region.append(toast);
    while (this.#region.children.length > 3) this.#region.firstElementChild.remove(); // como mucho 3
    if (!reduceMotion.matches) {
      toast.animate([{ opacity: 0, translate: '0 1rem' }, { opacity: 1, translate: '0 0' }], { duration: 200, easing: 'ease-out' });
    }
    const timer = this.#countdown(duration, () => dismiss());
    const dismiss = () => {
      timer.stop();
      this.#timers.delete(timer);
      toast.remove();
    };
    close.addEventListener('click', dismiss);
    // Leer lleva tiempo: con el puntero encima o el foco dentro, no se cierra.
    toast.addEventListener('pointerenter', () => timer.setPaused(true));
    toast.addEventListener('pointerleave', () => timer.setPaused(document.hidden));
    toast.addEventListener('focusin', () => timer.setPaused(true));
    toast.addEventListener('focusout', () => timer.setPaused(document.hidden));
    this.#timers.add(timer);
    if (document.hidden) timer.setPaused(true);
    return toast;
  }

  // Una cuenta atrás que se puede pausar: guarda lo que queda.
  #countdown(duration, onDone) {
    let remaining = duration;
    let startedAt = performance.now();
    let id = setTimeout(onDone, remaining);
    return {
      setPaused(paused) {
        if (paused && id !== null) {
          clearTimeout(id);
          id = null;
          remaining -= performance.now() - startedAt;
        } else if (!paused && id === null) {
          startedAt = performance.now();
          id = setTimeout(onDone, Math.max(remaining, 1000)); // al volver, al menos 1 s
        }
      },
      stop() {
        clearTimeout(id);
        id = null;
      },
    };
  }
}
customElements.define('app-toast', AppToast);

// ── La página usa los dos ────────────────────────────────────────────────
const tabs = document.querySelector('#methods');
const toasts = document.querySelector('#toasts');
document.addEventListener('tab-change', (event) => {
  console.log(`📑 tab-change → ${event.detail.label} (target: ${event.target.localName}#${event.target.id})`);
});
document.querySelector('#save').addEventListener('click', () => {
  toasts.show('Guardado en «Mis recetas»: Café de Chiapas.');
  console.log('🔔 aviso: Guardado en «Mis recetas»');
});

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const tabEls = [...tabs.querySelectorAll('[slot="tab"]')];
const panelEls = [...tabs.querySelectorAll('[slot="panel"]')];
audit('roles', `${tabEls.filter((tab) => tab.getAttribute('role') === 'tab').length} tab · ${panelEls.filter((panel) => panel.getAttribute('role') === 'tabpanel').length} tabpanel`, '3 tab · 3 tabpanel');
audit('cada pestaña controla su panel (referencias en el light DOM)', tabEls.every((tab, index) => document.getElementById(tab.getAttribute('aria-controls')) === panelEls[index]), true);
tabs.selected = 1;
audit('selected = 1 → aria-selected y tabindex', tabEls.map((tab) => `${tab.getAttribute('aria-selected')}/${tab.tabIndex}`).join(' '), 'false/-1 true/0 false/-1');
audit('solo se ve el panel elegido', panelEls.map((panel) => panel.hidden).join(' '), 'true false true');
tabEls[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
audit('→ desde la última vuelve a la primera', tabs.selected, 0);
audit('el atributo refleja la propiedad', tabs.getAttribute('selected'), '0');
toasts.show('Prueba de las comprobaciones', { duration: 50 });
audit('show() añade un aviso a la región role="status"', toasts.count, 1);
await new Promise((resolve) => setTimeout(resolve, 120));
audit('el aviso se cierra solo al acabar su tiempo', toasts.count, 0);
console.log('Listo: cambia de pestaña con el ratón o con Tab y las flechas; pulsa «♡ Guardar» y pasa el puntero por encima del aviso');
```
