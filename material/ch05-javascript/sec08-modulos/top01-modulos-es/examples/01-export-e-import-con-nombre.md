---
example_description: "Exportaciones con nombre: un módulo de dinero exporta tres cosas y se queda el resto; el script las importa entre llaves con su nombre exacto"
example_tags: "javascript|python|modulos|import|export"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/01-precios/money.js (ábrelo con el botón «Assets»
// de la galería). La ruta empieza por ./ y lleva la extensión .js.
import { formatPrice, addVat, CURRENCY } from './01-precios/money.js';

const coffeeCents = 21000; // café de Chiapas, 500 g, sin IVA

console.log('moneda →', CURRENCY);
console.log('sin IVA →', formatPrice(coffeeCents));
console.log('con IVA →', formatPrice(addVat(coffeeCents)));

// Lo que money.js no exporta no existe aquí: es privado de ese archivo.
console.log('typeof VAT_RATE →', typeof VAT_RATE);
console.log('typeof roundCents →', typeof roundCents);

// Y pedirlo en el import detendría TODO el script antes de su primera línea:
//   import { VAT_RATE } from './01-precios/money.js';
//   → SyntaxError: The requested module './01-precios/money.js' does not
//     provide an export named 'VAT_RATE'

// Como este script tiene import, LearnWeb lo carga como <script type="module">.
// > Desde Python: from money import format_price, add_vat, CURRENCY
//   La diferencia: en Python, VAT_RATE y _round_cents también se podrían
//   importar (lo privado es una convención); en JavaScript, sin export no hay
//   forma de llegar a ellos.
```
