---
example_description: "FLIP para animar un reordenamiento: medir dónde está cada elemento (First), cambiar el DOM de golpe (Last), calcular la diferencia (Invert) y animar translate de esa diferencia a 0 (Play). El layout cambia una sola vez y la animación solo mueve capas"
example_tags: "javascript|web-animations|flip|getboundingclientrect|reordenar|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Vivero La Biznaga</h1>
  <div class="buttons" role="group" aria-label="Ordenar">
    <button type="button" data-sort="price">Por precio</button>
    <button type="button" data-sort="name">Por nombre</button>
  </div>
  <ul id="plants" class="plants">
    <li data-price="185" data-name="Nopal en maceta">🌵 Nopal en maceta <span>$185</span></li>
    <li data-price="95" data-name="Echeveria">🪴 Echeveria <span>$95</span></li>
    <li data-price="210" data-name="Helecho de Boston">🌿 Helecho de Boston <span>$210</span></li>
    <li data-price="540" data-name="Limonero enano">🍋 Limonero enano <span>$540</span></li>
    <li data-price="120" data-name="Biznaga">🌵 Biznaga <span>$120</span></li>
  </ul>
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
.buttons {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.plants {
  display: grid;
  gap: 0.4rem;
  max-width: 20rem;
  padding: 0;
  list-style: none;
}
.plants li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #dcfce7;
}
.plants span {
  font-weight: 700;
  color: #166534;
}
```

# JavaScript

```javascript
const list = document.querySelector('#plants');
const statusLine = document.querySelector('#status');
const nameOf = (item) => item.dataset.name;
const comparers = {
  price: (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
  name: (a, b) => nameOf(a).localeCompare(nameOf(b), 'es'),
};

function reorder(key) {
  const items = [...list.children];
  // F (First): dónde está cada uno AHORA (con su translate, si una animación anterior sigue en marcha)
  const first = new Map(items.map((item) => [item, item.getBoundingClientRect()]));
  items.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
  // L (Last): el DOM cambia de golpe; el navegador recalcula el layout UNA vez
  const sorted = items.toSorted(comparers[key]);
  list.append(...sorted);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
  for (const item of sorted) {
    // I (Invert): cuánto hay que desplazarlo para que parezca que sigue donde estaba
    const dy = first.get(item).top - item.getBoundingClientRect().top;
    if (dy === 0 || reduce) continue;
    // P (Play): de «donde estaba» a «donde está», solo con translate
    item.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 450, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  }
  const text = `Por ${key === 'price' ? 'precio' : 'nombre'}: ${sorted.map(nameOf).join(', ')}`;
  statusLine.textContent = text;
  console.log(text);
}

document.querySelector('.buttons').addEventListener('click', (event) => {
  const key = event.target.closest('button')?.dataset.sort;
  if (key) reorder(key);
});
console.log('Listo: pulsa «Por precio» y luego «Por nombre»');
```
