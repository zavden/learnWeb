---
example_description: "Métodos de pago que se cargan con import() la primera vez que alguien los elige: un registro con rutas escritas enteras (para que un empaquetador las divida), validación del método y cada módulo evaluado una sola vez"
example_tags: "javascript|modulos|import-dinamico|carga-diferida|code-splitting|registro"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/02-pagos/):
//   registry.js → LOADERS { card, oxxo, spei } y loadPaymentMethod(id)
//   card.js, oxxo.js, spei.js → export default { label, pay() }; avisan al evaluarse
import { PAYMENT_IDS, loadPaymentMethod, loaded } from './02-pagos/registry.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatMoney = (cents) => money.format(cents / 100);

const checkouts = [
  { id: 'P-1001', totalCents: 48720, method: 'card' },
  { id: 'P-1002', totalCents: 21000, method: 'oxxo' },
  { id: 'P-1003', totalCents: 117900, method: 'card' },
  { id: 'P-1004', totalCents: 8500, method: 'paypal' },
];

console.log('métodos disponibles →', PAYMENT_IDS.join(', '), '| cargados →', loaded.size);

for (const order of checkouts) {
  console.group(`▶ ${order.id} con ${order.method}`);
  try {
    const method = await loadPaymentMethod(order.method);
    console.log(`✅ ${method.label}: ${method.pay(order, formatMoney)}`);
  } catch (error) {
    console.log('⛔', error.message);
  }
  console.groupEnd();
}

console.log('módulos cargados →', [...loaded].join(', '), '(spei nunca se descargó)');

// La segunda compra con tarjeta (P-1003) no vuelve a evaluar card.js: el
// módulo ya está en el mapa de módulos. Y «paypal» ni se intenta: el registro
// valida el método antes de pedir nada. Ábrelo con ↗ y mira la pestaña «Red».
```
