---
example_description: "Exhaustividad con never: un default que pasa el valor a assertNever(value: never) da un error de tipos (TS2345) en cuanto se añade a la unión un caso que el switch no trata; en ejecución, lanza un error claro"
example_tags: "typescript|never|exhaustividad|uniones-discriminadas|switch|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Más tarde, alguien añade un cuarto método de pago: los vales.
type Payment =
  | { kind: 'card'; last4: string }
  | { kind: 'cash' }
  | { kind: 'transfer'; reference: string }
  | { kind: 'voucher'; code: string }; // ← nuevo

// Recibe never: solo se puede llamar donde ya no queda ningún caso posible.
function assertNever(value: never): never {
  throw new Error(`Forma de pago no prevista: ${JSON.stringify(value)}`);
}

// Comisión del banco por cada forma de pago.
function feeRate(payment: Payment): number {
  switch (payment.kind) {
    case 'card':
      return 0.035;
    case 'cash':
    case 'transfer':
      return 0;
    default:
      // Si se trataran todos los casos, aquí payment sería never.
      // Queda 'voucher' sin tratar: el error de tipos lo señala AQUÍ.
      return assertNever(payment); // ❌ Error TS2345 a propósito: falta el caso 'voucher'
  }
}

console.log('tarjeta →', feeRate({ kind: 'card', last4: '4821' }));
try {
  console.log(feeRate({ kind: 'voucher', code: 'BUENFIN-26' }));
} catch (error) {
  console.log('⛔', String(error));
}
// ✅ Añade «case 'voucher': return 0.01;» y el error desaparece.
```
