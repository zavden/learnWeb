---
example_description: "Solución de «Lee bien el pedido»: valueAsNumber, checked, el value del RadioNodeList, selectedOptions convertido en array y getUTCDate() para el día de un type=\"date\""
example_tags: "javascript|formularios|solucion|value|valueasnumber|checked|radionodelist|selectedoptions|valueasdate"
example_stage: final-solution
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
// SOLUCIÓN: cada control, con la propiedad que le corresponde.
const form = document.querySelector('#order');

function readOrder(orderForm) {
  const { bags, gift, size, extras, delivery } = orderForm.elements;
  return {
    bags: bags.valueAsNumber, // 1. el número (NaN si estuviera vacío)
    gift: gift.checked, // 2. value sería 'on' esté como esté
    size: size.value, // 3. el RadioNodeList: el value del radio marcado
    extras: [...extras.selectedOptions].map((option) => option.value), // 4. todas
    deliveryDay: delivery.valueAsDate.getUTCDate(), // 5. medianoche UTC: se lee en UTC
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
