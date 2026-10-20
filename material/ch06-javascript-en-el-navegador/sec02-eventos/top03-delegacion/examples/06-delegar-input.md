---
example_description: "La delegación no es solo para clics: un único listener de 'input' en la tabla del pedido recalcula el subtotal de la fila que cambió y el total, para cualquier número de filas"
example_tags: "javascript|eventos|delegacion|input|tabla|intl"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <table id="order" class="order">
    <caption>Pedido para la cafetería</caption>
    <thead>
      <tr><th scope="col">Producto</th><th scope="col">Precio</th><th scope="col">Cantidad</th><th scope="col">Subtotal</th></tr>
    </thead>
    <tbody>
      <tr data-price="210">
        <th scope="row">Café de Chiapas 500 g</th><td>$210.00</td>
        <td><input type="number" min="0" max="20" value="0" aria-label="Cantidad de café de Chiapas"></td>
        <td class="subtotal">$0.00</td>
      </tr>
      <tr data-price="145">
        <th scope="row">Cacao de Tabasco 250 g</th><td>$145.00</td>
        <td><input type="number" min="0" max="20" value="0" aria-label="Cantidad de cacao de Tabasco"></td>
        <td class="subtotal">$0.00</td>
      </tr>
      <tr data-price="98.5">
        <th scope="row">Vainilla de Papantla</th><td>$98.50</td>
        <td><input type="number" min="0" max="20" value="0" aria-label="Cantidad de vainilla de Papantla"></td>
        <td class="subtotal">$0.00</td>
      </tr>
    </tbody>
    <tfoot>
      <tr><th scope="row" colspan="3">Total</th><td id="total">$0.00</td></tr>
    </tfoot>
  </table>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
.order {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
caption {
  font-weight: 700;
  text-align: start;
  padding-bottom: 0.5rem;
}
th,
td {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid #cbd2d9;
  text-align: start;
}
td:last-child {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
/* Resaltar la fila activa no necesita JS. */
tbody tr:focus-within {
  background: #e0e7ff;
}
input {
  width: 4rem;
  font: inherit;
  padding: 0.2rem 0.3rem;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const order = document.querySelector('#order');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function updateTotal() {
  let total = 0;
  for (const row of order.querySelectorAll('tbody tr')) {
    total += Number(row.dataset.price) * Number(row.querySelector('input').value);
  }
  document.querySelector('#total').textContent = money.format(total);
  return total;
}

// 'input' llega en cada cambio del campo (cada tecla, cada flecha) y burbujea,
// así que la tabla entera lo escucha con un solo listener.
order.addEventListener('input', (event) => {
  if (!event.target.matches('input[type="number"]')) return;
  const row = event.target.closest('tr');
  const quantity = Number(event.target.value);
  row.querySelector('.subtotal').textContent = money.format(Number(row.dataset.price) * quantity);
  const total = updateTotal();
  logLine(`✏️ ${row.querySelector('th').textContent} → ${quantity} · total ${money.format(total)}`);
});
logLine('Listo: cambia las cantidades (escribe o usa las flechas del campo)');

// input frente a change, value frente a valueAsNumber y la validación de
// min/max se estudian en el módulo «Formularios con JavaScript».
```
