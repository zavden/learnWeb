---
example_description: "Un componente con Shadow DOM (attachShadow + una copia de <template>): los selectores no cruzan la frontera en ningún sentido, pero sí las propiedades heredadas (font-family), las variables CSS (--accent) y ::part(); :host y :host(.featured) dan estilo al propio elemento, y la página gana a :host (el criterio «contexto» de la cascada)"
example_tags: "javascript|web-components|shadow-dom|host|part|custom-properties|cascada"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<template id="product-card-template">
  <style>
    /* :host es el propio <product-card>, visto desde dentro. */
    :host {
      display: block;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd2d9;
      border-top: 6px solid var(--accent, #7b8794);
      border-radius: 8px;
      background: #ffffff;
    }
    :host(.featured) {
      background: #fef3c7;
    }
    /* Solo afecta a los h2 de DENTRO del componente. */
    h2 {
      margin: 0;
      font-size: 1.05rem;
      color: #1d4ed8;
    }
    p {
      margin: 0.25rem 0 0;
    }
  </style>
  <h2 class="name"></h2>
  <p class="origin"></p>
  <p class="price" part="price"></p>
</template>

<main class="catalog">
  <h2>Cafés de origen</h2>
  <div class="cards">
    <product-card class="featured" name="Café de Chiapas" origin="Sierra Madre · 1,400 m" amount="210"></product-card>
    <product-card name="Café de Veracruz" origin="Coatepec · 1,200 m" amount="185.5"></product-card>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  color: #1f2933;
  background: #f5f7fa;
}
/* Propiedades heredadas: cruzan la frontera y llegan dentro. */
.catalog {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
  font-family: Georgia, serif;
}
/* Selectores de la página: NO entran en el shadow DOM. */
h2 {
  color: #b91c1c;
  text-transform: uppercase;
}
.price {
  color: #b91c1c;
}
.cards {
  display: grid;
  gap: 0.75rem;
}
/* Variables CSS: también cruzan. Es la forma de «tematizar» un componente. */
product-card {
  --accent: #15803d;
  border-radius: 0; /* compite con el border-radius de :host… y gana */
}
/* ::part(): la puerta que el componente abre a propósito (part="price"). */
product-card::part(price) {
  color: #92400e;
  font-weight: 700;
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
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const template = document.querySelector('#product-card-template');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class ProductCard extends HTMLElement {
  constructor() {
    super();
    // El shadow root sí se puede crear y llenar en el constructor: sus nodos
    // no son hijos del elemento. Cada tarjeta, su copia de la plantilla.
    const root = this.attachShadow({ mode: 'open' });
    root.append(template.content.cloneNode(true));
  }
  connectedCallback() {
    this.shadowRoot.querySelector('.name').textContent = this.getAttribute('name');
    this.shadowRoot.querySelector('.origin').textContent = this.getAttribute('origin');
    this.shadowRoot.querySelector('.price').textContent = money.format(Number(this.getAttribute('amount')));
  }
}
customElements.define('product-card', ProductCard);

const card = document.querySelector('product-card');
const innerTitle = card.shadowRoot.querySelector('h2');
const innerPrice = card.shadowRoot.querySelector('.price');
const style = (element, property) => getComputedStyle(element).getPropertyValue(property);

logLine(`shadowRoot.mode → ${card.shadowRoot.mode} · card.children.length → ${card.children.length}`);
logLine('— lo que NO cruza —');
logLine(`h2 de la página → ${style(document.querySelector('.catalog > h2'), 'color')} · h2 del componente → ${style(innerTitle, 'color')}`);
logLine(`text-transform del h2 de dentro → ${style(innerTitle, 'text-transform')}`);
logLine(`document.querySelector('.price') → ${document.querySelector('.price')}`);
logLine('— lo que SÍ cruza —');
logLine(`font-family heredada → ${style(innerTitle, 'font-family')}`);
logLine(`--accent → borde superior ${style(card, 'border-top-color')}`);
logLine(`::part(price) → ${style(innerPrice, 'color')} · ${innerPrice.textContent}`);
logLine('— :host frente a la página —');
logLine(`:host(.featured) → fondo ${style(card, 'background-color')}`);
logLine(`border-radius: :host dice 8px, la página 0 → ${style(card, 'border-radius')}`);
```
