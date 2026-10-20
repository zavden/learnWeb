---
example_description: "Ejercicio: un módulo de tickets escrito como JavaScript sin tipos (errores TS7006). Al anotar los parámetros con un tipo LineItem, TypeScript señala los cuatro bugs que esconde (una errata, un precio en texto, un envío en texto y un argumento olvidado); corrígelos hasta que no quede ningún error de tipos y las cinco comprobaciones salgan ✓"
example_tags: "typescript|ejercicio|anotaciones|noimplicitany|tipos-de-objeto|bugs"
exercise: true
exercise_title: "Tipa el ticket y deja que TypeScript encuentre los bugs"
exercise_instructions: "Al abrirlo verás errores TS7006 (parámetros sin tipo) y comprobaciones ✗ || Declara type LineItem con sku, name, unitCents y quantity, y anota items como LineItem[] || Anota los parámetros de lineTotal, subtotal, orderTotal y formatMoney (y sus retornos) || TypeScript marcará ahora los bugs: una errata, un precio y un envío escritos como texto y una llamada sin moneda. Corrígelos sin tocar las comprobaciones || El objetivo es doble: las cinco comprobaciones ✓ y NINGÚN error de tipos (editor o franja del diálogo «▶ Run»)"
exercise_hints: "El precio de los frijoles y shippingCents deben ser números (4500 y 9900), no textos || La errata está en lineTotal: compárala con el nombre de la propiedad en LineItem || Para que formatMoney(24350) funcione sin segundo argumento, dale a currency un valor por defecto: currency = 'MXN'"
exercise_solution_example: 08-ej-tipa-el-ticket-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# TypeScript

```typescript
// Un módulo de tickets escrito sin tipos. Funciona… casi.

// TODO 1: declara aquí type LineItem (sku, name, unitCents, quantity)
//         y anota items como LineItem[].
const items = [
  { sku: 'TOR-1KG', name: 'Tortillas de maíz 1 kg', unitCents: 2200, quantity: 2 },
  { sku: 'FRI-1KG', name: 'Frijol negro 1 kg', unitCents: '4500', quantity: 1 }, // copiado de un formulario
  { sku: 'JAB-400', name: 'Jabón de lavandería', unitCents: 1850, quantity: 3 },
];

// Envío, en centavos (también copiado de un formulario).
const shippingCents = '9900';

// TODO 2: anota los parámetros y el retorno de estas cuatro funciones.
function lineTotal(item) {
  return item.unitCents * item.quantiy;
}

function subtotal(list) {
  return list.reduce((sum, item) => sum + lineTotal(item), 0);
}

function orderTotal(list, shipping) {
  return subtotal(list) + shipping;
}

function formatMoney(cents, currency) {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}

// TODO 3: con los tipos puestos, corrige lo que marque TypeScript.

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
check('todos los precios son números', items.every((item) => typeof item.unitCents === 'number'), true);
check('tortillas: 2 × $22.00 = 4400 centavos', lineTotal(items[0]), 4400);
check('subtotal de los tres productos', subtotal(items), 14450);
check('total con envío', orderTotal(items, shippingCents), 24350);
check('formatMoney usa MXN por defecto', formatMoney(24350), '$243.50 MXN');
```
