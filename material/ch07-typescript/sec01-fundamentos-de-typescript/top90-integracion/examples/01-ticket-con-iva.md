---
example_description: "Ticket de una tienda de abarrotes con IVA desglosado (16 % y tasa 0): líneas readonly, una tabla de tasas as const, el pago como unión discriminada con switch exhaustivo y una función que escribe cada línea con un callback"
example_tags: "typescript|integracion|readonly|as-const|uniones-discriminadas|never|callbacks"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
// IVA en México: 16 % general y tasa 0 % para alimentos básicos.
const TAX_RATES = { general: 0.16, basicFood: 0 } as const; // lección 5
type TaxKind = 'general' | 'basicFood';

type LineItem = {
  readonly sku: string;
  readonly name: string;
  readonly unitCents: number;
  readonly quantity: number;
  readonly tax: TaxKind;
};

// Cada forma de pago con sus propios datos (lección 4).
type Payment =
  | { method: 'cash'; receivedCents: number }
  | { method: 'card'; last4: string }
  | { method: 'voucher'; code: string; valueCents: number };

function assertNever(value: never): never {
  throw new Error(`Forma de pago no prevista: ${JSON.stringify(value)}`);
}

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const lineCents = (item: LineItem): number => item.unitCents * item.quantity;
// TAX_RATES[item.tax]: la clave es 'general' | 'basicFood', así que siempre existe.
const lineTax = (item: LineItem): number => Math.round(lineCents(item) * TAX_RATES[item.tax]);

function paymentLine(payment: Payment, totalCents: number): string {
  switch (payment.method) {
    case 'cash':
      return `Efectivo ${money(payment.receivedCents)} · cambio ${money(payment.receivedCents - totalCents)}`;
    case 'card':
      return `Tarjeta •••• ${payment.last4}`;
    case 'voucher':
      return `Vale ${payment.code} · por pagar ${money(Math.max(0, totalCents - payment.valueCents))}`;
    default:
      return assertNever(payment);
  }
}

// write recibe cada línea: por defecto, la consola (lección 6: tipos de función).
function printTicket(items: readonly LineItem[], payment: Payment, write: (line: string) => void = console.log): number {
  let subtotal = 0;
  let tax = 0;
  for (const item of items) {
    subtotal += lineCents(item);
    tax += lineTax(item);
    const mark = item.tax === 'general' ? 'G' : 'E'; // G: grava IVA, E: exento (tasa 0)
    write(`${item.quantity} × ${item.name.padEnd(24)} ${money(lineCents(item)).padStart(8)} ${mark}`);
  }
  const total = subtotal + tax;
  write(`${'Subtotal'.padEnd(28)} ${money(subtotal).padStart(8)}`);
  write(`${'IVA 16 %'.padEnd(28)} ${money(tax).padStart(8)}`);
  write(`${'TOTAL'.padEnd(28)} ${money(total).padStart(8)}`);
  write(paymentLine(payment, total));
  return total;
}

const basket: readonly LineItem[] = [
  { sku: 'TOR-1KG', name: 'Tortillas de maíz 1 kg', unitCents: 2200, quantity: 2, tax: 'basicFood' },
  { sku: 'FRI-1KG', name: 'Frijol negro 1 kg', unitCents: 4500, quantity: 1, tax: 'basicFood' },
  { sku: 'JAB-400', name: 'Jabón de lavandería', unitCents: 1850, quantity: 3, tax: 'general' },
  { sku: 'PIL-AA4', name: 'Pilas AA (4 piezas)', unitCents: 8900, quantity: 1, tax: 'general' },
];

console.log('🧾 Abarrotes La Esperanza');
printTicket(basket, { method: 'cash', receivedCents: 30000 });

// El mismo ticket, guardado en un array: push devuelve un número y el callback
// es void, y no pasa nada (lección 6).
const saved: string[] = [];
const total = printTicket(basket, { method: 'voucher', code: 'DESPENSA-200', valueCents: 20000 }, (line) => saved.push(line));
console.log(`📄 ticket guardado: ${saved.length} líneas · total ${money(total)} · pago: ${saved[saved.length - 1]}`);
```
