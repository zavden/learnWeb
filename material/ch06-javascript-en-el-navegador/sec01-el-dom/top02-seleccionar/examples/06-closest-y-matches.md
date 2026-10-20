---
example_description: "closest sube desde un elemento (incluido él mismo) hasta el primer antepasado que encaja con un selector, o null; matches responde si un elemento encaja. Juntos llevan del botón pulsado a su tarjeta de producto"
example_tags: "javascript|dom|closest|matches|selectores|has"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<ul class="products">
  <li class="product" id="p-chiapas">
    <h3>Café de Chiapas</h3>
    <p>$210.00</p>
    <button type="button" class="add">Añadir</button>
  </li>
  <li class="product sold-out" id="p-nayarit">
    <h3>Café de Nayarit</h3>
    <p>$195.00</p>
    <button type="button" class="add" disabled>Agotado</button>
  </li>
</ul>
<p id="status" role="status">Pulsa «Añadir».</p>
```

# JavaScript

```javascript
const button = document.querySelector('.add');

// closest(selector): el primer antepasado que encaja, empezando por él mismo.
console.log("closest('.product') →", button.closest('.product').id);
console.log("closest('ul') →", button.closest('ul').className);
console.log("closest('button') es el propio botón →", button.closest('button') === button);
console.log("closest('form') →", button.closest('form')); // no hay ninguno: null

// matches(selector): ¿este elemento encaja con el selector?
const nayarit = document.querySelector('#p-nayarit');
console.log("#p-chiapas matches('.sold-out') →", button.closest('.product').matches('.sold-out'));
console.log("#p-nayarit matches('.sold-out') →", nayarit.matches('.sold-out'));
console.log("#p-nayarit matches(':has(button:disabled)') →", nayarit.matches(':has(button:disabled)'));

// El uso típico: desde el botón pulsado, encontrar SU tarjeta y leer sus datos.
// (Los eventos se estudian en el módulo siguiente; aquí solo escuchamos el clic.)
for (const addButton of document.querySelectorAll('.add')) {
  addButton.addEventListener('click', () => {
    const product = addButton.closest('.product');
    const name = product.querySelector('h3').textContent;
    document.querySelector('#status').textContent = `🛒 Añadido: ${name}`;
    console.log('clic en →', name);
  });
}
button.click(); // simula un clic en el primer botón; pulsa tú también
```
