---
example_description: "Un DocumentFragment es un contenedor sin padre donde se montan varios nodos fuera de la página; al insertarlo, entran sus hijos y el fragmento se queda vacío. Hoy append(...nodos) hace lo mismo sin fragmento"
example_tags: "javascript|dom|documentfragment|append|rendimiento"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<h2>Horario de la cafetería</h2>
<ul id="hours"></ul>
<h2>Métodos de pago</h2>
<ul id="payments"></ul>
```

# JavaScript

```javascript
const schedule = [
  ['Lunes a viernes', '7:00 a 20:00'],
  ['Sábados', '8:00 a 21:00'],
  ['Domingos', '9:00 a 14:00'],
];

// Un fragmento: un nodo contenedor que no está en la página ni lo estará.
const fragment = document.createDocumentFragment();
for (const [days, time] of schedule) {
  const item = document.createElement('li');
  const label = document.createElement('strong');
  label.textContent = days;
  item.append(label, `: ${time}`);
  fragment.append(item); // se monta fuera de la página
}
console.log('fragment →', fragment);
console.log('nodeType →', fragment.nodeType, '| hijos →', fragment.childNodes.length);

// Al insertar el fragmento entran SUS HIJOS, todos de una vez…
const hours = document.querySelector('#hours');
hours.append(fragment);
console.log('<li> en la lista →', hours.children.length);
console.log('primer hijo de la lista →', hours.firstChild.nodeName); // ningún fragmento en el árbol
// …y el fragmento se queda vacío (sus nodos se han MOVIDO).
console.log('hijos del fragmento →', fragment.childNodes.length);

// Hoy, append acepta varios nodos: un array y el spread hacen lo mismo.
const payments = ['Tarjeta', 'Efectivo en OXXO', 'Transferencia SPEI'].map((name) => {
  const item = document.createElement('li');
  item.textContent = name;
  return item;
});
document.querySelector('#payments').append(...payments);
console.log('métodos de pago →', document.querySelector('#payments').children.length);
```
