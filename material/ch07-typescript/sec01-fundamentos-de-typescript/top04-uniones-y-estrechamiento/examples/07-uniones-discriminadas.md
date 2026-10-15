---
example_description: "Unión discriminada: varios tipos de objeto con una propiedad común de valor literal (kind); un switch sobre kind estrecha a cada tipo y deja usar sus propiedades propias"
example_tags: "typescript|uniones-discriminadas|estrechamiento|switch|tipos-literales"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Cada forma de pago tiene sus propios datos. La propiedad kind, con un valor
// literal distinto en cada tipo, es el «discriminante»: dice cuál es cuál.
type Payment =
  | { kind: 'card'; last4: string; installments: number }
  | { kind: 'cash'; amountGiven: number }
  | { kind: 'transfer'; reference: string };

function describePayment(payment: Payment, total: number): string {
  switch (payment.kind) {
    case 'card':
      // Aquí payment es el tipo con kind: 'card': last4 e installments existen.
      return `Tarjeta •••• ${payment.last4} a ${payment.installments} meses`;
    case 'cash':
      return `Efectivo: cambio de $${payment.amountGiven - total}`;
    case 'transfer':
      return `Transferencia, referencia ${payment.reference}`;
  }
}

const total = 350;
const payments: Payment[] = [
  { kind: 'card', last4: '4821', installments: 3 },
  { kind: 'cash', amountGiven: 500 },
  { kind: 'transfer', reference: 'SPEI-889210' },
];
for (const payment of payments) {
  console.log(describePayment(payment, total));
}
// Sin return después del switch, y sin error: TypeScript ve que los tres
// casos cubren todos los valores posibles de kind.
```
