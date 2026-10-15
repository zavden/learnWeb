---
example_description: "Ejercicio: <stock-badge quantity=\"3\"> pinta «3 en existencia» solo al conectarse; si cambia el atributo no se entera, y la propiedad quantity es un campo suelto que no toca el atributo. Haz que observe el atributo y que la propiedad lo refleje, también antes de entrar en la página"
example_tags: "javascript|web-components|observedattributes|attributechangedcallback|reflejar-atributos|ejercicio"
exercise: true
exercise_title: "Una insignia de existencias que refleja su atributo"
exercise_instructions: "<stock-badge> muestra «N en existencia», «Últimas N» (1 o 2) o «Agotado» según su atributo quantity || Declara static observedAttributes = ['quantity'] y pinta también en attributeChangedCallback || Sustituye el campo quantity por un getter que lea el atributo (como número, 0 si falta) y un setter que lo escriba con setAttribute || Comprueba que una insignia creada con createElement y con quantity asignado ANTES de añadirla a la página sale bien || Ejecuta hasta que las seis comprobaciones salgan ✓"
exercise_hints: "static observedAttributes = ['quantity']; dentro de la clase || get quantity() { return Number(this.getAttribute('quantity') ?? 0); } || set quantity(value) { this.setAttribute('quantity', String(value)); } || attributeChangedCallback puede llamar al mismo render() que connectedCallback"
exercise_solution_example: 07-ej-reflejar-atributo-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cafés de origen</h1>
  <ul class="products">
    <li>Café de Chiapas 500 g <stock-badge id="chiapas" quantity="3"></stock-badge></li>
    <li>Café de Veracruz 500 g <stock-badge id="veracruz" quantity="12"></stock-badge></li>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.products {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.products li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: #ffffff;
}
stock-badge {
  padding: 0 0.5rem;
  border-radius: 1rem;
  background: #dcfce7;
}
stock-badge[quantity="0"] {
  background: #fee2e2;
}
```

# JavaScript

```javascript
class StockBadge extends HTMLElement {
  // TODO: static observedAttributes = ['quantity'];

  // TODO: sustituye este campo por un getter y un setter que reflejen el atributo
  quantity = Number(this.getAttribute('quantity') ?? 0);

  connectedCallback() {
    this.render();
  }

  // TODO: attributeChangedCallback() { this.render(); }

  render() {
    const quantity = this.quantity;
    if (quantity === 0) this.textContent = 'Agotado';
    else if (quantity <= 2) this.textContent = `Últimas ${quantity}`;
    else this.textContent = `${quantity} en existencia`;
  }
}
customElements.define('stock-badge', StockBadge);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
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
const chiapas = document.querySelector('#chiapas');
const veracruz = document.querySelector('#veracruz');

check('desde el HTML: quantity="3" → «3 en existencia»', () => chiapas.textContent, '3 en existencia');
check('setAttribute("quantity", "0") → «Agotado»', () => {
  chiapas.setAttribute('quantity', '0');
  return chiapas.textContent;
}, 'Agotado');
check('la propiedad lee el atributo: quantity es el número 0', () => chiapas.quantity, 0);
check('veracruz.quantity = 2 → atributo "2" y «Últimas 2»', () => {
  veracruz.quantity = 2;
  return `${veracruz.getAttribute('quantity')} · ${veracruz.textContent}`;
}, '2 · Últimas 2');
check('createElement + quantity = 7 antes de añadirla → atributo "7" y «7 en existencia»', () => {
  const badge = document.createElement('stock-badge');
  badge.quantity = 7;
  document.querySelector('.products li').append(badge);
  const text = `${badge.getAttribute('quantity')} · ${badge.textContent}`;
  badge.remove();
  return text;
}, '7 · 7 en existencia');
check('sin atributo → quantity es 0 y dice «Agotado»', () => {
  const badge = document.createElement('stock-badge');
  document.body.append(badge);
  const text = `${badge.quantity} · ${badge.textContent}`;
  badge.remove();
  return text;
}, '0 · Agotado');
```
