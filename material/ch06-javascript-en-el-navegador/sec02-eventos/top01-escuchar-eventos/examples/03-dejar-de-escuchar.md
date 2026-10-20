---
example_description: "Dejar de escuchar: removeEventListener con la MISMA función que se registró (un cupón que solo se aplica una vez) y la opción { once: true }, que lo quita sola tras la primera llamada"
example_tags: "javascript|eventos|removeeventlistener|once|listener"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tu primer pedido</h1>
  <p class="actions">
    <button id="coupon" type="button">Aplicar cupón BIENVENIDA</button>
    <button id="gift" type="button">🎁 Reclamar muestra gratis</button>
  </p>
  <p>Descuento: <output id="discount">0</output>% · Muestras: <output id="samples">0</output></p>
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
  margin-top: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
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
const couponButton = document.querySelector('#coupon');
const giftButton = document.querySelector('#gift');
const logList = document.querySelector('#log');
let samples = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 1. removeEventListener(tipo, función): quita el listener que se registró con
//    ESA función. Por eso necesita un nombre (o una variable) que la recuerde.
function applyCoupon() {
  document.querySelector('#discount').textContent = 10;
  logLine('🏷️ cupón aplicado: 10 %');
  couponButton.removeEventListener('click', applyCoupon); // se quita a sí misma
}
couponButton.addEventListener('click', applyCoupon);

// 2. { once: true }: el navegador lo quita solo después de la primera llamada.
giftButton.addEventListener('click', () => {
  samples += 1;
  document.querySelector('#samples').textContent = samples;
  logLine('🎁 muestra añadida');
}, { once: true });

// Un testigo que no se quita nunca: demuestra que los clics siguen llegando.
for (const button of [couponButton, giftButton]) {
  button.addEventListener('click', () => logLine(`   (clic en #${button.id})`));
}
logLine('Listo: pulsa cada botón DOS veces');
```
