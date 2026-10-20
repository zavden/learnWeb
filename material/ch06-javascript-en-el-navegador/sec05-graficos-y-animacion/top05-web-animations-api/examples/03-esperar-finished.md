---
example_description: "animation.finished es una promesa que se cumple al terminar (con la propia animación): con await, varias animaciones se encadenan en orden, como pasos de una función. finish() la cumple al momento"
example_tags: "javascript|web-animations|finished|promesas|async|await"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Taza de talavera · $320</h1>
  <div class="scene">
    <span id="product" class="product" aria-hidden="true">☕</span>
    <span class="cart" aria-hidden="true">🛒<span id="badge" class="badge">0</span></span>
  </div>
  <button id="add" type="button">Añadir al carrito</button>
  <p id="status" aria-live="polite"></p>
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
.scene {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 260px;
  height: 4rem;
  font-size: 2rem;
}
.cart {
  position: relative;
}
.badge {
  position: absolute;
  top: -0.4rem;
  right: -0.6rem;
  min-width: 1.2rem;
  border-radius: 0.6rem;
  background: #be123c;
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const product = document.querySelector('#product');
const badge = document.querySelector('#badge');
const statusLine = document.querySelector('#status');
const say = (text) => { statusLine.textContent = text; console.log(text); };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente

// 1. Sin esperar a ningún frame: finish() termina la animación y cumple su promesa
const demo = product.animate({ opacity: [1, 0] }, 1000);
demo.finished.then((result) => console.log('finished se cumple con la animación →', result === demo, '·', demo.playState));
demo.finish();
console.log('justo después de finish() → la promesa aún no ha avisado (microtarea)');

// 2. Una secuencia: cada await espera al final del paso anterior
async function addToCart() {
  say('1. la taza vuela al carrito');
  await product.animate(
    reduce
      ? { opacity: [1, 0.3, 1] }                                   // con «reducir movimiento»: un parpadeo
      : { translate: ['0 0', '220px 0'], scale: [1, 0.4], opacity: [1, 0] },
    { duration: 600, easing: 'ease-in' },
  ).finished;
  badge.textContent = Number(badge.textContent) + 1;
  say('2. el contador sube');
  await badge.animate(reduce ? { opacity: [1, 0.4, 1] } : { scale: [1, 1.6, 1] }, { duration: 300 }).finished;
  say('3. listo: la taza está en el carrito');
}

const addButton = document.querySelector('#add');
addButton.addEventListener('click', async () => {
  addButton.disabled = true;          // una secuencia cada vez
  await addToCart();
  addButton.disabled = false;
});
console.log('Listo: pulsa «Añadir al carrito»');
```
