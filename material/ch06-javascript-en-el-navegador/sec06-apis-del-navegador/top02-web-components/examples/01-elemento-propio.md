---
example_description: "Un custom element es una clase que hereda de HTMLElement registrada con customElements.define: las etiquetas <price-tag> que ya estaban en la página se «mejoran» al registrarla (connectedCallback pinta cada precio), :defined las distingue y whenDefined avisa cuando ya existen"
example_tags: "javascript|web-components|custom-elements|customelements-define|upgrade|defined"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Café de especialidad</h1>
  <ul id="products" class="products">
    <li>Café de Chiapas 500 g <price-tag amount="210"></price-tag></li>
    <li>Café de Veracruz 500 g <price-tag amount="185.5"></price-tag></li>
    <li>Café de Oaxaca 250 g <price-tag amount="120" old-amount="140"></price-tag></li>
  </ul>
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
/* Un elemento propio es inline (como <span>) mientras no le des estilo. */
price-tag {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
price-tag s {
  margin-right: 0.4rem;
  font-weight: 400;
  color: #52606d;
}
/* Antes de registrarse, la etiqueta existe pero está vacía: se reserva el
   hueco sin enseñar nada raro. */
price-tag:not(:defined) {
  display: inline-block;
  min-width: 4rem;
  visibility: hidden;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class PriceTag extends HTMLElement {
  // Se ejecuta cada vez que el elemento entra en la página.
  connectedCallback() {
    const amount = money.format(Number(this.getAttribute('amount')));
    const oldAmount = this.getAttribute('old-amount');
    if (oldAmount === null) {
      this.textContent = amount;
      logLine(`connectedCallback → ${amount}`);
      return;
    }
    const struck = document.createElement('s'); // precio anterior, tachado
    struck.textContent = money.format(Number(oldAmount));
    this.replaceChildren(struck, amount);
    logLine(`connectedCallback → ${amount} (antes ${struck.textContent})`);
  }
}

const tags = document.querySelectorAll('price-tag');
const definedCount = () => document.querySelectorAll('price-tag:defined').length;
logLine(`antes de define → definidos: ${definedCount()} de ${tags.length} · instanceof PriceTag: ${tags[0] instanceof PriceTag}`);

customElements.whenDefined('price-tag').then(() => logLine("whenDefined('price-tag') → resuelta"));

// Registrar: nombre con guion + clase. Las etiquetas que ya existen se
// «mejoran» (upgrade) en este mismo momento, antes de que define vuelva.
customElements.define('price-tag', PriceTag);

logLine(`después de define → definidos: ${definedCount()} de ${tags.length} · instanceof PriceTag: ${tags[0] instanceof PriceTag}`);
logLine(`customElements.get('price-tag') === PriceTag → ${customElements.get('price-tag') === PriceTag}`);

// También se crean desde JS, como cualquier elemento.
const extra = document.createElement('li');
const tag = document.createElement('price-tag');
tag.setAttribute('amount', '95');
extra.append('Café de Guerrero 250 g ', tag);
document.querySelector('#products').append(extra); // ← aquí corre connectedCallback
```
