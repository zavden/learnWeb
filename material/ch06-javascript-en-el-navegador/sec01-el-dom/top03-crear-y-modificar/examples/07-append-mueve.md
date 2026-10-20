---
example_description: "append de un elemento que ya está en la página no lo copia: lo mueve, porque un nodo solo puede estar en un sitio. Para copiarlo, cloneNode(true). Mover sirve para reordenar, y en Chrome moveBefore() mueve sin sacar el nodo del documento (un iframe no se recarga)"
example_tags: "javascript|dom|append|mover|clonenode|movebefore|iframe|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h2>⭐ Destacados</h2>
<ul id="featured"></ul>
<h2>Catálogo</h2>
<ul id="catalog">
  <li id="p-chiapas">Café de Chiapas</li>
  <li>Café de Veracruz</li>
  <li>Molinillo manual</li>
</ul>
<iframe id="map" title="Dirección de la tienda" srcdoc="<p>📍 Calle 5 de Mayo 12, Puebla</p>"></iframe>
```

# CSS

```css
iframe {
  width: 100%;
  height: 4rem;
  border: 1px solid #94a3b8;
}
```

# JavaScript

```javascript
const featured = document.querySelector('#featured');
const catalog = document.querySelector('#catalog');
const chiapas = document.querySelector('#p-chiapas');

// 🐛 Queremos que el café de Chiapas salga TAMBIÉN en destacados:
featured.append(chiapas);
console.log('🐛 destacados →', featured.children.length, '| catálogo →', catalog.children.length);
console.log('🐛 padre de Chiapas →', chiapas.parentElement.id);
// Un nodo solo puede estar en un sitio: append lo SACA de donde estaba.

// ✅ Lo devolvemos a su sitio y ponemos una COPIA en destacados.
catalog.prepend(chiapas);
const copy = chiapas.cloneNode(true);
copy.removeAttribute('id'); // dos elementos no deben compartir id (ejemplo 08)
featured.append(copy);
console.log('✅ destacados →', featured.children.length, '| catálogo →', catalog.children.length);

// Mover a propósito sirve para reordenar: el último pasa a ser el primero.
catalog.prepend(catalog.lastElementChild);
console.log('reordenado →', [...catalog.children].map((item) => item.textContent));

// Mover con append = sacar + volver a meter. Para un iframe eso es recargarlo:
const map = document.querySelector('#map');
const pageBefore = map.contentWindow;
featured.before(map);
console.log('🐛 before → ¿el iframe conserva su página? →', map.contentWindow === pageBefore);

// En Chrome: parent.moveBefore(nodo, referencia) mueve SIN sacarlo del
// documento, y el nodo conserva su estado (página del iframe, foco…).
if (typeof document.body.moveBefore === 'function') {
  const pageNow = map.contentWindow;
  document.body.moveBefore(map, null); // null = al final, como append
  console.log('✅ moveBefore → ¿conserva su página? →', map.contentWindow === pageNow);
} else {
  console.log('este navegador no tiene moveBefore()');
}
```
