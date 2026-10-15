---
example_description: "transitionend (adelanto de JavaScript): se dispara una vez por cada propiedad que termina, y padding son cuatro (una por lado); si la transición se interrumpe o el elemento pasa a display: none, llega transitioncancel en su lugar"
example_tags: "css|transiciones|transitionend|transitioncancel|eventos|javascript|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Prueba tres cosas y mira la consola:
     1. Marca «Ampliar la tarjeta» y espera 2 s.
     2. Desmárcala y, antes de que acabe, vuelve a marcarla.
     3. Con la tarjeta creciendo, marca «Ocultar la tarjeta». -->
<p class="controls">
  <label><input type="checkbox" id="expand"> Ampliar la tarjeta</label>
  <label><input type="checkbox" id="hide"> Ocultar la tarjeta</label>
</p>
<article class="order-card">
  <h3>Pedido 1042</h3>
  <p>3 plantas · $847</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
}

.order-card {
  width: fit-content;
  padding: 8px 12px;
  border-radius: 8px;
  background: #e0f2fe;
  /* 2 s para que dé tiempo a interrumpirla. padding es un atajo: la
     transición anima sus cuatro longhands (padding-top, padding-right,
     padding-bottom y padding-left), y cada una termina por su cuenta. */
  transition: padding 2s, background-color 2s;
}

.order-card h3,
.order-card p {
  margin: 0;
}

body:has(#expand:checked) .order-card {
  padding: 24px 32px;
  background: #fde68a;
}

body:has(#hide:checked) .order-card {
  display: none;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). querySelector busca un elemento
// con un selector de CSS y addEventListener ejecuta una función cada vez que ocurre
// un evento en él. Aquí solo escribimos en la consola qué propiedad terminó.
const card = document.querySelector('.order-card');
let endCount = 0;

// 🐛 Una vez POR PROPIEDAD: con padding y background-color terminan cinco.
// Si esperabas uno solo («cuando acabe la transición, haz X»), X se hará cinco veces.
card.addEventListener('transitionend', (event) => {
  endCount += 1;
  console.log(`transitionend nº ${endCount} → ${event.propertyName}`);
});

// 🐛 Si se interrumpe (cambias de estado a mitad) o el elemento deja de tener caja
// (display: none), NO llega transitionend: llega transitioncancel.
card.addEventListener('transitioncancel', (event) => {
  console.log(`transitioncancel → ${event.propertyName}`);
});
```
