---
example_description: "El ciclo de vida de un custom element en orden: constructor, attributeChangedCallback (solo para los atributos de static observedAttributes), connectedCallback y disconnectedCallback; una propiedad status que refleja el atributo hace que el componente se use igual desde HTML y desde JS"
example_tags: "javascript|web-components|ciclo-de-vida|observedattributes|attributechangedcallback|reflejar-atributos"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Seguimiento de pedidos</h1>
  <ul id="orders" class="orders">
    <li>P-2077 · 2 × Café de Chiapas <order-status status="recibido"></order-status></li>
  </ul>
  <p class="actions">
    <button type="button" data-status="preparando">Preparando</button>
    <button type="button" data-status="en-camino">En camino</button>
    <button type="button" data-status="entregado">Entregado</button>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.orders {
  margin: 0;
  padding: 0;
  list-style: none;
}
.orders li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: #ffffff;
}
/* El CSS se engancha al atributo: el aspecto no puede separarse del estado. */
order-status {
  padding: 0 0.5rem;
  border-radius: 1rem;
  background: #e4e7eb;
}
order-status[status="en-camino"] { background: #fef3c7; }
order-status[status="entregado"] { background: #dcfce7; }
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const LABELS = { recibido: '📥 Recibido', preparando: '☕ Preparando', 'en-camino': '🛵 En camino', entregado: '✅ Entregado' };
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class OrderStatus extends HTMLElement {
  // Solo estos atributos llaman a attributeChangedCallback.
  static observedAttributes = ['status'];

  constructor() {
    super(); // siempre lo primero
    logLine('constructor → el elemento existe; aún no se toca nada');
  }
  connectedCallback() {
    logLine('connectedCallback → está en la página');
    this.render();
  }
  disconnectedCallback() {
    logLine('disconnectedCallback → ha salido de la página');
  }
  attributeChangedCallback(attribute, oldValue, newValue) {
    logLine(`attributeChangedCallback → ${attribute}: ${oldValue} → ${newValue}`);
    this.render();
  }
  adoptedCallback() {
    logLine('adoptedCallback → se ha movido a otro documento'); // raro: un iframe, por ejemplo
  }

  // La propiedad refleja el atributo: leerla lee el atributo y escribirla lo
  // cambia (y eso llama a attributeChangedCallback).
  get status() {
    return this.getAttribute('status');
  }
  set status(value) {
    this.setAttribute('status', value);
  }

  render() {
    this.textContent = LABELS[this.status] ?? '…';
  }
}

logLine("— customElements.define('order-status', …) —");
customElements.define('order-status', OrderStatus);

const order = document.querySelector('order-status');
logLine("— order.status = 'preparando' —");
order.status = 'preparando';
logLine("— order.setAttribute('data-note', 'sin azúcar'): no está en observedAttributes —");
order.setAttribute('data-note', 'sin azúcar');
logLine('— order.remove() —');
const row = order.parentElement;
order.remove();
logLine('— row.append(order) —');
row.append(order);
logLine('Listo: pulsa los botones de estado');

for (const button of document.querySelectorAll('[data-status]')) {
  button.addEventListener('click', () => {
    order.status = button.dataset.status;
  });
}
```
