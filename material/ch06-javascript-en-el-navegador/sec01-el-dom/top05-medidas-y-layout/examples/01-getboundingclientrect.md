---
example_description: "getBoundingClientRect() da la caja de borde de un elemento (posición y tamaño) en px, relativa a la ventana: al hacer scroll su top cambia, y top + scrollY es la posición en el documento. El DOMRect es una foto del momento"
example_tags: "javascript|dom|getboundingclientrect|domrect|medidas|scroll"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<div class="card" id="card">Café de Chiapas · $210.00</div>
<div class="spacer" aria-hidden="true"></div>
```

# CSS

```css
/* Tamaños explícitos para que las medidas sean exactas. El body conserva
   su margen por defecto de 8px, así que la tarjeta empieza en (8, 8). */
.card {
  width: 200px;
  height: 50px;
  padding: 10px;
  border: 2px solid #1d4ed8;
  background: #eff6ff;
}
.spacer {
  height: 1500px; /* para que la página tenga scroll */
}
```

# JavaScript

```javascript
const card = document.querySelector('#card');

// La caja de BORDE del elemento: contenido + padding + borde, en px.
const rect = card.getBoundingClientRect();
console.log('rect →', rect);
console.log('ancho = 200 + 2×10 + 2×2 →', rect.width);
console.log('right = left + width →', rect.right === rect.left + rect.width);

// Las coordenadas son relativas a la VENTANA (la parte visible), no al documento.
window.scrollTo(0, 30); // bajamos la página 30 px
console.log('scrollY →', window.scrollY);
const afterScroll = card.getBoundingClientRect();
console.log('top tras bajar 30 px →', afterScroll.top);
// Para la posición en el DOCUMENTO, suma lo desplazado:
console.log('top en el documento = top + scrollY →', afterScroll.top + window.scrollY);
window.scrollTo(0, 0); // y volvemos arriba

// Un DOMRect es una foto: no se actualiza solo.
console.log('el rect de antes sigue diciendo top →', rect.top);
```
