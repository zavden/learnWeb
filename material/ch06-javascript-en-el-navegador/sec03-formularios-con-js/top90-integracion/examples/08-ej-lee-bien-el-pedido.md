---
example_description: "Ejercicio: readOrder lee un pedido con cinco errores de la lección «Leer y escribir controles» (value como string, value de una casilla, el primer radio, value de un select multiple y valueAsDate leído en hora local). Las comprobaciones rellenan el formulario desde JavaScript y miran el resultado"
example_tags: "javascript|formularios|ejercicio|value|valueasnumber|checked|radionodelist|selectedoptions|valueasdate"
exercise: true
exercise_title: "Lee bien el pedido"
exercise_instructions: "readOrder(form) devuelve un objeto con los datos del pedido, pero tiene cinco errores, uno por línea marcada con TODO || bags debe ser un número (las comprobaciones esperan 3, no '3') || gift debe ser true o false según la casilla || size debe ser el radio MARCADO || extras debe ser un array con TODAS las opciones elegidas || deliveryDay debe ser el día del calendario que eligió el usuario (20), también en Ciudad de México || Ejecuta hasta que las cinco comprobaciones salgan ✓"
exercise_hints: "valueAsNumber || La propiedad que cambia al marcar es checked || form.elements.size es el grupo entero || [...select.selectedOptions].map(…) || valueAsDate es medianoche UTC: getUTCDate()"
exercise_solution_example: 08-ej-lee-bien-el-pedido-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido de café para la oficina</h1>
  <form id="order" action="/pedidos" method="post">
    <label>Bolsas de 500 g <input name="bags" type="number" min="1" max="20" value="1"></label>
    <label><input type="checkbox" name="gift"> Envolver para regalo</label>
    <fieldset>
      <legend>Tamaño de molienda</legend>
      <label><input type="radio" name="size" value="fine"> Fina</label>
      <label><input type="radio" name="size" value="medium" checked> Media</label>
      <label><input type="radio" name="size" value="coarse"> Gruesa</label>
    </fieldset>
    <label>Extras
      <select name="extras" multiple size="3">
        <option value="cinnamon">Canela</option>
        <option value="piloncillo">Piloncillo</option>
        <option value="clove">Clavo</option>
      </select>
    </label>
    <label>Entrega <input name="delivery" type="date" value="2026-11-10"></label>
  </form>
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
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
fieldset {
  display: flex;
  gap: 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"], [type="radio"]),
select {
  font: inherit;
  color: #1f2933;
  padding: 0.25rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// EJERCICIO: corrige las cinco líneas marcadas con TODO.
const form = document.querySelector('#order');

function readOrder(orderForm) {
  const { bags, gift, extras, delivery } = orderForm.elements;
  return {
    bags: bags.value, // TODO 1: un número, no un string
    gift: Boolean(gift.value), // TODO 2: ¿está marcada?
    size: orderForm.querySelector('[name="size"]').value, // TODO 3: el radio marcado
    extras: [extras.value], // TODO 4: todas las opciones elegidas
    deliveryDay: delivery.valueAsDate.getDate(), // TODO 5: el día que eligió el usuario
  };
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Rellenan el formulario desde JavaScript, como si lo hubiera hecho el usuario.
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
form.elements.bags.value = '3';
form.elements.gift.checked = false;
form.elements.size.value = 'coarse';
for (const option of form.elements.extras.options) option.selected = option.value !== 'piloncillo';
form.elements.delivery.value = '2026-11-20';
const order = readOrder(form);

check('bags es el número 3', () => order.bags, 3);
check('gift es false con la casilla sin marcar', () => order.gift, false);
check('size es el radio marcado («coarse»)', () => order.size, 'coarse');
check('extras tiene las dos opciones elegidas', () => JSON.stringify(order.extras), '["cinnamon","clove"]');
check('deliveryDay es 20 (el día elegido, en cualquier zona horaria)', () => order.deliveryDay, 20);
```
