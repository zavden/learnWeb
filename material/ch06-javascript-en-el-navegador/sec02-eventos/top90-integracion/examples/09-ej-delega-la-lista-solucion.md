---
example_description: "Solución: un único listener de click en la lista que encuentra el botón con closest, comprueba que está dentro de la lista y actúa sobre su <li>; funciona al pulsar el icono y con los productos añadidos después"
example_tags: "javascript|eventos|ejercicio|delegacion|closest|elementos-dinamicos"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Lista de la compra (<output id="count">3</output>)</h1>
  <ul id="shopping" class="shopping">
    <li data-name="Tortillas"><span class="name">Tortillas</span>
      <button type="button" data-action="toggle" aria-label="Tortillas: comprado"><span aria-hidden="true">✓</span></button>
      <button type="button" data-action="remove" aria-label="Quitar tortillas"><span aria-hidden="true">🗑</span></button></li>
    <li data-name="Aguacates"><span class="name">Aguacates</span>
      <button type="button" data-action="toggle" aria-label="Aguacates: comprado"><span aria-hidden="true">✓</span></button>
      <button type="button" data-action="remove" aria-label="Quitar aguacates"><span aria-hidden="true">🗑</span></button></li>
    <li data-name="Queso Oaxaca"><span class="name">Queso Oaxaca</span>
      <button type="button" data-action="toggle" aria-label="Queso Oaxaca: comprado"><span aria-hidden="true">✓</span></button>
      <button type="button" data-action="remove" aria-label="Quitar queso Oaxaca"><span aria-hidden="true">🗑</span></button></li>
  </ul>
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
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.shopping {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
}
.shopping li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: 0.5rem;
  background: #ffffff;
}
.shopping .name {
  flex: 1;
}
.shopping li.bought .name {
  color: #52606d;
  text-decoration: line-through;
}
button {
  font: inherit;
  padding: 0.2rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
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
// SOLUCIÓN: un único listener delegado en la lista.
const list = document.querySelector('#shopping');
const countOutput = document.querySelector('#count');

function updateCount() {
  countOutput.textContent = list.children.length;
}

function createItem(name) {
  const item = document.createElement('li');
  item.dataset.name = name;
  const label = document.createElement('span');
  label.className = 'name';
  label.textContent = name;
  const actions = [['toggle', '✓', `${name}: comprado`], ['remove', '🗑', `Quitar ${name.toLowerCase()}`]];
  const buttons = actions.map(([action, icon, ariaLabel]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    button.setAttribute('aria-label', ariaLabel);
    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = icon;
    button.append(iconSpan);
    return button;
  });
  item.append(label, ...buttons);
  return item;
}

function addItem(name) {
  list.append(createItem(name)); // sin registrar nada: la lista ya escucha
  updateCount();
}

function handleItemClick(event) {
  // ✅ Del icono (o de donde sea) hasta el botón; y el botón, de ESTA lista.
  const button = event.target.closest('button[data-action]');
  if (!button || !list.contains(button)) return;
  const item = button.closest('li');
  if (button.dataset.action === 'remove') {
    item.remove();
    updateCount();
  }
  if (button.dataset.action === 'toggle') item.classList.toggle('bought');
}

// ✅ UN listener en la lista: vale para los productos de hoy y de mañana.
list.addEventListener('click', handleItemClick);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Simulan los clics con dispatchEvent, como si pulsaras el icono o el botón.
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
const itemNamed = (name) => list.querySelector(`[data-name="${name}"]`);

check('pulsar el icono ✓ de «Aguacates» lo marca como comprado', () => {
  click(itemNamed('Aguacates').querySelector('[data-action="toggle"] span'));
  return itemNamed('Aguacates').classList.contains('bought');
}, true);
check('pulsar el icono 🗑 de «Tortillas» lo quita', () => {
  click(itemNamed('Tortillas').querySelector('[data-action="remove"] span'));
  return itemNamed('Tortillas');
}, null);
check('«Comprado» funciona en un producto añadido después', () => {
  addItem('Chiles poblanos');
  click(itemNamed('Chiles poblanos').querySelector('[data-action="toggle"]'));
  return itemNamed('Chiles poblanos').classList.contains('bought');
}, true);
check('«Quitar» funciona en un producto añadido después', () => {
  addItem('Limones');
  click(itemNamed('Limones').querySelector('[data-action="remove"]'));
  return itemNamed('Limones');
}, null);
check('quedan 3 productos y el contador lo dice', () => `${list.children.length}/${countOutput.textContent}`, '3/3');
```
