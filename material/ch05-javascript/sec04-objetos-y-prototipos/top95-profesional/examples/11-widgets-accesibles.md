---
example_description: "Un tipo base Widget hecho con prototipos (opciones por defecto que se sombrean, estado, oyentes con limpieza, render abstracto) y dos widgets que heredan de él, pestañas y acordeón, que mejoran una ficha de producto accesible"
example_tags: "javascript|profesional|herencia|widgets|accesibilidad|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <article class="product" aria-labelledby="product-title">
    <p class="eyebrow">Café · Molinillos</p>
    <h1 id="product-title">Molinillo manual Ruta</h1>
    <p class="price">49,90 € <span class="tax">IVA incluido</span></p>
    <p class="lead">Muelas cónicas de acero inoxidable y 30 posiciones de molienda: del café turco al de prensa francesa, sin enchufes.</p>

    <section class="tabs" aria-label="Información del producto">
      <div class="tab-list">
        <button type="button" data-tab="description">Descripción</button>
        <button type="button" data-tab="specs">Características</button>
        <button type="button" data-tab="reviews">Opiniones (3)</button>
      </div>
      <div class="tab-panel" id="panel-description">
        <h2 class="panel-title">Descripción</h2>
        <p>El Ruta muele 20 g de café en unos 40 segundos. El ajuste se hace con una rueda numerada bajo las muelas, así que puedes volver a tu punto favorito sin probar de nuevo.</p>
        <p>El cuerpo de aluminio y la manivela plegable caben en una mochila: pensado para viajes y acampadas.</p>
      </div>
      <div class="tab-panel" id="panel-specs">
        <h2 class="panel-title">Características</h2>
        <dl class="specs">
          <dt>Capacidad</dt><dd>25 g</dd>
          <dt>Muelas</dt><dd>Cónicas, acero inoxidable de 38 mm</dd>
          <dt>Posiciones</dt><dd>30, con rueda numerada</dd>
          <dt>Peso</dt><dd>490 g</dd>
          <dt>Medidas</dt><dd>5,2 × 17,5 cm</dd>
        </dl>
      </div>
      <div class="tab-panel" id="panel-reviews">
        <h2 class="panel-title">Opiniones</h2>
        <ul class="reviews">
          <li><strong>Marta, Valencia</strong> — Molienda muy uniforme para mi V60. Se nota la diferencia con el eléctrico de cuchillas.</li>
          <li><strong>Joaquín, Guadalajara</strong> — Lo uso cada mañana desde hace medio año. Para espresso hay que tener paciencia.</li>
          <li><strong>Leire, Bilbao</strong> — Ligero y precioso. La manivela plegable es un acierto.</li>
        </ul>
      </div>
      <p class="widget-tools">
        <button class="tool" type="button" id="toggle-tabs" aria-pressed="true">Pestañas activadas</button>
      </p>
    </section>

    <section class="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Preguntas frecuentes</h2>
      <p class="widget-tools">
        <label><input type="checkbox" id="single-open"> Abrir solo una respuesta a la vez</label>
      </p>
      <div class="accordion">
        <h3><button type="button" class="accordion-trigger">¿Cuánto tarda el envío?</button></h3>
        <div class="accordion-panel"><p>De 24 a 48 horas laborables en la península; de 3 a 5 días en Baleares y Canarias.</p></div>
        <h3><button type="button" class="accordion-trigger">¿Puedo devolverlo?</button></h3>
        <div class="accordion-panel"><p>Sí, durante 30 días, si no lo has usado con café. La recogida es gratuita.</p></div>
        <h3><button type="button" class="accordion-trigger">¿Cómo se limpia?</button></h3>
        <div class="accordion-panel"><p>Desmonta la manivela y la tuerca superior y cepilla las muelas en seco. Nunca con agua: el acero se oxidaría en las juntas.</p></div>
      </div>
    </section>
  </article>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
  --accent-soft: #eef2ff;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.55;
  color: var(--text);
  background: var(--page);
}
.app {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}
.product {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem clamp(1rem, 4vw, 2rem);
}
.eyebrow {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.6rem, 1.2rem + 2vw, 2.2rem);
}
.price {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}
.tax {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--muted);
}
.lead {
  max-width: 60ch;
}
button {
  font: inherit;
  color: inherit;
}
:where(button, input, [tabindex]):focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* Pestañas. Sin JavaScript, la lista de pestañas no sirve: se oculta y se ven todos los paneles. */
.tabs:not(.is-enhanced) .tab-list {
  display: none;
}
.tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border);
}
.tab-list button {
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
}
.tab-list [aria-selected='true'] {
  border-bottom-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
.tab-panel {
  padding: 0.5rem 0.25rem;
}
.is-enhanced .panel-title {
  /* Con pestañas, el título repite la pestaña: oculto a la vista, no a los lectores. */
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.specs {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.35rem 1.25rem;
}
.specs dt {
  font-weight: 600;
}
.specs dd {
  margin: 0;
}
.reviews {
  padding-left: 1.1rem;
}
.reviews li + li {
  margin-top: 0.5rem;
}

/* Acordeón */
.faq {
  margin-top: 1.5rem;
}
.accordion h3 {
  margin: 0;
  border-top: 1px solid var(--border);
}
.accordion-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.25rem;
  border: 0;
  background: none;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
}
.accordion-trigger[aria-expanded]::after {
  content: '+';
  color: var(--accent);
}
.accordion-trigger[aria-expanded='true']::after {
  content: '−';
}
.accordion-panel {
  padding: 0 0.25rem 0.5rem;
}
.accordion-panel p {
  margin: 0;
}
.widget-tools {
  margin: 0.75rem 0;
  color: var(--muted);
}
.tool {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent-soft);
  color: var(--accent);
  cursor: pointer;
}
```

# JavaScript

```javascript
// WIDGETS CON UN TIPO BASE: pestañas y acordeón para la ficha de un producto.
//
// Decisiones:
// - Widget es el tipo base (constructora + prototipo) con lo común a cualquier widget:
//   opciones, estado, oyentes que se limpian solos, setState → render y destroy.
// - Las opciones por defecto viven en cada prototipo como objetos CONGELADOS (valores
//   inmutables: pueden ir en el prototipo). Tabs.prototype.defaults sombrea al de Widget
//   y la constructora mezcla { ...this.defaults, ...options }.
// - render() del tipo base lanza un error: es «abstracto», cada widget escribe el suyo.
//   setup() y teardown() son ganchos que el base deja vacíos.
// - listen() guarda cómo quitar cada oyente; destroy() los quita todos y llama a
//   teardown, que devuelve el HTML a su estado original (sin roles ni atributos).
// - Mejora progresiva: el HTML se lee entero sin JavaScript (todos los paneles visibles,
//   sin pestañas); los widgets añaden los roles y atributos ARIA y el teclado de los
//   patrones «Tabs» y «Accordion» de WAI-ARIA.
// - El estado se sustituye, no se muta (setState crea un objeto nuevo) y render solo
//   cambia atributos: los botones no se recrean y el foco no se pierde.
//
// Alcance: módulos 1-4. querySelector, atributos, hidden, focus, eventos de teclado y
// addEventListener se estudian en el capítulo 6.

function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
function inherit(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype);
}

// ── Widget: el tipo base ────────────────────────────────────────────────
let widgetCount = 0;
function Widget(root, options = {}) {
  if (!(this instanceof Widget)) throw new TypeError('Widget se crea con new');
  if (!root) throw new TypeError(`${this.constructor.name}: falta el elemento raíz`);
  widgetCount += 1;
  this.id = `${this.constructor.name.toLowerCase()}-${widgetCount}`;
  this.root = root;
  this.options = Object.freeze({ ...this.defaults, ...options });
  this.state = {};
  Object.defineProperty(this, '_cleanups', { value: [] });
  this.setup();
  this.render();
  console.log(`▶ ${this.id} montado con`, this.options);
}
extendPrototype(Widget, {
  defaults: Object.freeze({}),
  setup() {},
  teardown() {},
  render() {
    throw new Error(`${this.constructor.name} tiene que implementar render()`);
  },
  setState(patch) {
    const changed = Object.keys(patch).some((key) => !Object.is(this.state[key], patch[key]));
    if (!changed) return;
    this.state = { ...this.state, ...patch };
    console.log(`${this.id} →`, this.state);
    this.render();
  },
  listen(target, type, handler) {
    const listener = (event) => handler.call(this, event); // this: el widget, no el elemento
    target.addEventListener(type, listener);
    this._cleanups.push(() => target.removeEventListener(type, listener));
  },
  destroy() {
    const removed = this._cleanups.length;
    for (const cleanup of this._cleanups.splice(0)) cleanup();
    this.teardown();
    console.log(`■ ${this.id} destruido: ${removed} oyentes quitados`);
  },
});

// ── Tabs ────────────────────────────────────────────────────────────────
function Tabs(root, options) {
  Widget.call(this, root, options);
}
inherit(Tabs, Widget);
extendPrototype(Tabs, {
  defaults: Object.freeze({ initial: 0 }),
  setup() {
    this.list = this.root.querySelector('.tab-list');
    this.tabs = [...this.list.querySelectorAll('button')];
    this.panels = this.tabs.map((tab) => this.root.querySelector(`#panel-${tab.dataset.tab}`));
    this.root.classList.add('is-enhanced');
    this.list.setAttribute('role', 'tablist');
    this.list.setAttribute('aria-label', this.root.getAttribute('aria-label'));
    this.tabs.forEach((tab, index) => {
      const panel = this.panels[index];
      tab.id = `tab-${tab.dataset.tab}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      this.listen(tab, 'click', () => this.select(index));
    });
    this.listen(this.list, 'keydown', this.onKeydown);
    this.state = { selected: this.options.initial };
  },
  select(index, { focus = false } = {}) {
    this.setState({ selected: index });
    if (focus) this.tabs[index].focus();
  },
  onKeydown(event) {
    const last = this.tabs.length - 1;
    const current = this.state.selected;
    let next;
    switch (event.key) {
      case 'ArrowRight': next = current === last ? 0 : current + 1; break;
      case 'ArrowLeft': next = current === 0 ? last : current - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = last; break;
      default: return;
    }
    event.preventDefault(); // que las flechas no desplacen la página
    this.select(next, { focus: true });
  },
  render() {
    this.tabs.forEach((tab, index) => {
      const selected = index === this.state.selected;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1; // «roving tabindex»: Tab entra en la pestaña activa
      this.panels[index].hidden = !selected;
    });
  },
  teardown() {
    this.root.classList.remove('is-enhanced');
    this.list.removeAttribute('role');
    this.list.removeAttribute('aria-label');
    this.tabs.forEach((tab, index) => {
      for (const name of ['role', 'aria-controls', 'aria-selected', 'tabindex']) tab.removeAttribute(name);
      for (const name of ['role', 'aria-labelledby', 'tabindex', 'hidden']) this.panels[index].removeAttribute(name);
    });
  },
});

// ── Accordion ───────────────────────────────────────────────────────────
function Accordion(root, options) {
  Widget.call(this, root, options);
}
inherit(Accordion, Widget);
extendPrototype(Accordion, {
  defaults: Object.freeze({ single: false, open: [] }),
  setup() {
    this.triggers = [...this.root.querySelectorAll('.accordion-trigger')];
    this.panels = [...this.root.querySelectorAll('.accordion-panel')];
    this.triggers.forEach((trigger, index) => {
      const panel = this.panels[index];
      trigger.id = `${this.id}-trigger-${index}`;
      panel.id = `${this.id}-panel-${index}`;
      trigger.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', trigger.id);
      this.listen(trigger, 'click', () => this.toggle(index));
    });
    this.state = { open: this.options.open };
  },
  toggle(index) {
    const isOpen = this.state.open.includes(index);
    let open;
    if (isOpen) open = this.state.open.filter((item) => item !== index);
    else open = this.options.single ? [index] : [...this.state.open, index];
    this.setState({ open });
  },
  render() {
    this.triggers.forEach((trigger, index) => {
      const expanded = this.state.open.includes(index);
      trigger.setAttribute('aria-expanded', String(expanded));
      this.panels[index].hidden = !expanded;
    });
  },
  teardown() {
    this.triggers.forEach((trigger, index) => {
      for (const name of ['id', 'aria-controls', 'aria-expanded']) trigger.removeAttribute(name);
      for (const name of ['id', 'role', 'aria-labelledby', 'hidden']) this.panels[index].removeAttribute(name);
    });
  },
});

// ── Montaje ─────────────────────────────────────────────────────────────
const tabsRoot = document.querySelector('.tabs');
const accordionRoot = document.querySelector('.accordion');
let tabs = new Tabs(tabsRoot, { initial: 0 });
let accordion = new Accordion(accordionRoot, { open: [0] });

// Activar y desactivar las pestañas: destroy deja el HTML como estaba (mejora progresiva).
const toggleTabs = document.querySelector('#toggle-tabs');
toggleTabs.addEventListener('click', () => {
  const active = toggleTabs.getAttribute('aria-pressed') === 'true';
  if (active) tabs.destroy();
  else tabs = new Tabs(tabsRoot, { initial: tabs.state.selected });
  toggleTabs.setAttribute('aria-pressed', String(!active));
  toggleTabs.textContent = active ? 'Pestañas desactivadas: se ve todo' : 'Pestañas activadas';
});

// Cambiar una opción = destruir y volver a crear con las opciones nuevas.
document.querySelector('#single-open').addEventListener('change', (event) => {
  const open = event.target.checked ? accordion.state.open.slice(0, 1) : accordion.state.open;
  accordion.destroy();
  accordion = new Accordion(accordionRoot, { single: event.target.checked, open });
});

// Comprobaciones en la consola:
console.log('cadena de tabs →', Object.getPrototypeOf(tabs) === Tabs.prototype, Object.getPrototypeOf(Tabs.prototype) === Widget.prototype);
console.log("¿defaults propio de Tabs.prototype? →", Object.hasOwn(Tabs.prototype, 'defaults'), '| Object.keys de un widget →', Object.keys(tabs));
try {
  new Widget(document.querySelector('.product')); // el base no sabe pintar
} catch (error) {
  console.warn(`⚠️ ${error.message}`);
}
```
