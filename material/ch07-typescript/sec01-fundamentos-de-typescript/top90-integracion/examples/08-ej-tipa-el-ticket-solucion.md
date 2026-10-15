---
example_description: "Solución: con type LineItem y los parámetros anotados, TypeScript señaló la errata quantiy, el precio y el envío en texto y la moneda olvidada; corregidos, no queda ningún error de tipos y las cinco comprobaciones salen ✓"
example_tags: "typescript|ejercicio|solucion|anotaciones|tipos-de-objeto"
example_stage: final-solution
example_importance: important
console: true
---

# TypeScript

```typescript
// Un módulo de tickets, ya con tipos.

type LineItem = {
  sku: string;
  name: string;
  unitCents: number;
  quantity: number;
};

const items: LineItem[] = [
  { sku: 'TOR-1KG', name: 'Tortillas de maíz 1 kg', unitCents: 2200, quantity: 2 },
  { sku: 'FRI-1KG', name: 'Frijol negro 1 kg', unitCents: 4500, quantity: 1 }, // ✅ TS2322 lo señaló
  { sku: 'JAB-400', name: 'Jabón de lavandería', unitCents: 1850, quantity: 3 },
];

// Envío, en centavos: ✅ un número (TS2345 lo señaló en la llamada a orderTotal).
const shippingCents = 9900;

function lineTotal(item: LineItem): number {
  return item.unitCents * item.quantity; // ✅ TS2551: «Did you mean 'quantity'?»
}

function subtotal(list: LineItem[]): number {
  return list.reduce((sum, item) => sum + lineTotal(item), 0);
}

function orderTotal(list: LineItem[], shipping: number): number {
  return subtotal(list) + shipping;
}

// ✅ TS2554 (faltaba un argumento): ahora currency tiene un valor por defecto.
function formatMoney(cents: number, currency = 'MXN'): string {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}

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
