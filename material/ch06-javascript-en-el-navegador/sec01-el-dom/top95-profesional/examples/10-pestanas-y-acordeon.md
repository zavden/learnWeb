---
example_description: "Pestañas y un acordeón de preguntas frecuentes gobernados por atributos: aria-selected y hidden en las pestañas, aria-expanded y hidden en el acordeón, enlazados con aria-controls y aria-labelledby; una auditoría recorre los atributos y comprueba que la página dice la verdad a los lectores de pantalla"
example_tags: "javascript|dom|profesional|pestanas|acordeon|aria|hidden|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="product">
  <h1>Café de Chiapas 500 g</h1>
  <div class="tabs">
    <div role="tablist" aria-label="Información del producto">
      <button type="button" role="tab" id="tab-desc" aria-controls="panel-desc" aria-selected="true">Descripción</button>
      <button type="button" role="tab" id="tab-prep" aria-controls="panel-prep" aria-selected="false">Preparación</button>
      <button type="button" role="tab" id="tab-ship" aria-controls="panel-ship" aria-selected="false">Envío</button>
    </div>
    <section role="tabpanel" id="panel-desc" aria-labelledby="tab-desc" tabindex="0">
      <p>Café de altura de la Sierra Madre de Chiapas, lavado y de tueste medio. Notas de chocolate y nuez.</p>
    </section>
    <section role="tabpanel" id="panel-prep" aria-labelledby="tab-prep" tabindex="0" hidden>
      <p>Prensa francesa: 30 g por 500 ml de agua a 94 °C, cuatro minutos.</p>
    </section>
    <section role="tabpanel" id="panel-ship" aria-labelledby="tab-ship" tabindex="0" hidden>
      <p>Envío gratis desde $500. Llega en 2 a 4 días hábiles.</p>
    </section>
  </div>

  <h2>Preguntas frecuentes</h2>
  <p><button type="button" id="expand-all">Abrir todas</button></p>
  <div class="faq">
    <h3><button type="button" aria-expanded="false" aria-controls="faq-1">¿Lo muelen al pedirlo?</button></h3>
    <div id="faq-1" hidden><p>Sí: elige la molienda al añadirlo al carrito, o pídelo en grano.</p></div>
    <h3><button type="button" aria-expanded="false" aria-controls="faq-2">¿Cuánto dura abierto?</button></h3>
    <div id="faq-2" hidden><p>Unas cuatro semanas en un frasco hermético, lejos de la luz.</p></div>
    <h3><button type="button" aria-expanded="false" aria-controls="faq-3">¿Es orgánico?</button></h3>
    <div id="faq-3" hidden><p>Sí, con certificado de la cooperativa de productores.</p></div>
  </div>
</main>
```

# CSS

```css
[hidden] {
  display: none !important;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.product {
  max-width: 36rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
[role="tablist"] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 2px solid #cbd5e1;
}
[role="tab"] {
  padding: 0.4rem 0.8rem;
  font: inherit;
  color: #1e293b;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-bottom: 0;
  border-radius: 0.375rem 0.375rem 0 0;
  cursor: pointer;
}
/* El aspecto sale del ATRIBUTO: lo que ve la persona y lo que oye el lector de
   pantalla no pueden separarse. */
[role="tab"][aria-selected="true"] {
  color: #ffffff;
  background: #1d4ed8;
  border-color: #1d4ed8;
}
[role="tabpanel"] {
  padding: 0.25rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-top: 0;
}
.faq h3 {
  margin: 0;
  font-size: 1rem;
}
.faq h3 button {
  width: 100%;
  padding: 0.5rem 0;
  font: inherit;
  font-weight: 600;
  text-align: start;
  color: #1e293b;
  background: none;
  border: 0;
  border-bottom: 1px solid #cbd5e1;
  cursor: pointer;
}
.faq h3 button::before {
  content: '▸ ';
}
.faq h3 button[aria-expanded="true"]::before {
  content: '▾ ';
}
button:focus-visible,
[role="tabpanel"]:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// PESTAÑAS Y ACORDEÓN GOBERNADOS POR ATRIBUTOS.
//
// Decisiones:
// - El estado vive en los ATRIBUTOS, no en variables: aria-selected,
//   aria-expanded y hidden. El CSS se engancha a ellos, así que lo que se ve y
//   lo que anuncia un lector de pantalla siempre coinciden.
// - aria-controls y aria-labelledby enlazan cada control con lo que controla;
//   el script los SIGUE (getElementById) en lugar de suponer un orden.
// - aria-selected y aria-expanded valen "true"/"false" (no son booleanos de
//   HTML); hidden sí lo es, y se cambia con la propiedad (lección «Atributos y
//   propiedades»). [hidden] { display: none !important } evita sorpresas.
// - Las flechas del teclado y el tabindex itinerante de las pestañas llegan en
//   el módulo de eventos (keydown); de momento cada pestaña se alcanza con Tab.
// - audit() sirve para cualquier página: recorre los roles y los atributos.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

function selectTab(selected) {
  const tablist = selected.closest('[role="tablist"]');
  for (const tab of tablist.querySelectorAll('[role="tab"]')) {
    const isSelected = tab === selected;
    tab.setAttribute('aria-selected', String(isSelected));
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  }
}

function setExpanded(button, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
}

// Clics (módulo siguiente).
for (const tab of document.querySelectorAll('[role="tab"]')) {
  tab.addEventListener('click', () => selectTab(tab));
}
const faqButtons = [...document.querySelectorAll('.faq [aria-expanded]')];
for (const button of faqButtons) {
  button.addEventListener('click', () => setExpanded(button, button.getAttribute('aria-expanded') !== 'true'));
}
document.querySelector('#expand-all').addEventListener('click', () => {
  for (const button of faqButtons) setExpanded(button, true);
});

// ── Auditoría: ¿los atributos dicen la verdad? ──────────────────────────
function report(label, ok, detail) {
  if (ok) console.log('✅', label, '→', detail);
  else console.error('❌', label, '→', detail);
}
function auditTabs(root = document) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  report('cada pestaña controla un panel que existe', panels.every((panel) => panel?.getAttribute('role') === 'tabpanel'), tabs.length);
  report('cada panel apunta a su pestaña', panels.every((panel, i) => panel?.getAttribute('aria-labelledby') === tabs[i].id), panels.length);
  const selected = tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true');
  report('una sola pestaña seleccionada', selected.length === 1, selected.map((tab) => tab.textContent).join(', '));
  const visible = panels.filter((panel) => !panel.hidden);
  report('solo se ve su panel', visible.length === 1 && visible[0].id === selected[0]?.getAttribute('aria-controls'), visible.map((panel) => panel.id).join(', '));
}
function auditDisclosures(root = document) {
  const buttons = [...root.querySelectorAll('[aria-expanded][aria-controls]')];
  const consistent = buttons.filter((button) =>
    (button.getAttribute('aria-expanded') === 'true') === !document.getElementById(button.getAttribute('aria-controls')).hidden);
  report('aria-expanded coincide con hidden', consistent.length === buttons.length, `${consistent.length} de ${buttons.length}`);
  return buttons.filter((button) => button.getAttribute('aria-expanded') === 'true').length;
}

console.log('— al cargar —');
auditTabs();
auditDisclosures();
console.log('— tras elegir «Preparación» y abrir la pregunta 2 —');
document.querySelector('#tab-prep').click();
faqButtons[1].click();
auditTabs();
console.log('preguntas abiertas →', auditDisclosures());
console.log('— tras «Abrir todas» —');
document.querySelector('#expand-all').click();
console.log('preguntas abiertas →', auditDisclosures());
// Vuelta al estado inicial para que pruebes tú.
selectTab(document.querySelector('#tab-desc'));
for (const button of faqButtons) setExpanded(button, false);
```
