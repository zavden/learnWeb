---
example_description: "remove saca un elemento del árbol (el objeto sigue vivo y se puede volver a insertar), replaceWith pone otro nodo en su lugar y replaceChildren vacía un elemento o cambia todos sus hijos de una vez"
example_tags: "javascript|dom|remove|replacewith|replacechildren"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<section id="order">
  <h2>Pedido P-1024</h2>
  <p>Estado: <span id="badge">En preparación</span></p>
  <ul id="items">
    <li>Café de Chiapas 500 g</li>
    <li>Molinillo manual</li>
    <li>Filtros de papel</li>
  </ul>
  <p id="promo">🎁 Envío gratis en pedidos de más de $500</p>
</section>
```

# JavaScript

```javascript
// remove(): el elemento sale del árbol…
const promo = document.querySelector('#promo');
promo.remove();
console.log('¿la promo está en la página? →', promo.isConnected);
// …pero el objeto sigue existiendo mientras alguna variable lo apunte:
console.log('la promo sigue en memoria →', promo.textContent);

// replaceWith(nuevo): otro nodo en el mismo sitio (puede ser de otra etiqueta).
const shipped = document.createElement('strong');
shipped.textContent = 'Enviado 🚚';
document.querySelector('#badge').replaceWith(shipped);
console.log('estado →', document.querySelector('#order p').textContent);

// replaceChildren(): sin argumentos, vacía el elemento…
const items = document.querySelector('#items');
items.replaceChildren();
console.log('productos tras vaciar →', items.children.length);

// …y con argumentos, pone esos nodos en lugar de todos los hijos.
const summary = document.createElement('li');
summary.textContent = '3 productos entregados al repartidor';
items.replaceChildren(summary);
console.log('productos ahora →', items.children.length, '|', items.firstElementChild.textContent);

// Un elemento quitado se puede volver a insertar:
items.after(promo);
console.log('¿la promo ha vuelto? →', promo.isConnected);
```
