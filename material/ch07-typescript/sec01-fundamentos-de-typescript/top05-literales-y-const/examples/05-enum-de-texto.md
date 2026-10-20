---
example_description: "Un enum de texto da a cada miembro un string (sin mapeo inverso) y, al contrario que el resto de TypeScript, no es estructural: el texto 'MXN' no se acepta donde se pide Currency (TS2345) aunque Currency.MXN valga 'MXN'"
example_tags: "typescript|enum|string-enum|nominal|ts2345"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  EUR = 'EUR',
}

function formatPrice(amount: number, currency: Currency): string {
  return `${amount.toFixed(2)} ${currency}`;
}

console.log(formatPrice(250, Currency.MXN)); // ✅
console.log('Currency.MXN →', Currency.MXN, '|', typeof Currency.MXN);
// Sin mapeo inverso: el objeto solo tiene los nombres.
console.log('Currency →', Currency);

// 🐛 Un enum de texto es la excepción al tipado estructural: aunque
//    Currency.MXN valga 'MXN', el texto 'MXN' no se acepta.
console.log(formatPrice(250, 'MXN')); // ❌ Error TS2345 a propósito: 'MXN' no es Currency

// Un texto que llega de fuera (un <select>, un JSON) hay que comprobarlo y
// convertirlo; Object.values del enum da la lista de valores válidos:
const fromSelect = 'USD';
const valid = Object.values(Currency).find((value) => value === fromSelect);
console.log('✅', valid === undefined ? 'moneda desconocida' : formatPrice(14.5, valid));
```
