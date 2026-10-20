---
example_description: "Los tipos no existen en ejecución: typeof solo conoce los tipos de JavaScript (nunca 'Order') e instanceof con un type es un error de tipos y un ReferenceError; las clases sí existen y funcionan con instanceof"
example_tags: "typescript|borrado-de-tipos|typeof|instanceof|ts2367|ts2693|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Order = { id: string; total: number };
const order: Order = { id: 'P-1042', total: 350 };

// 🐛 typeof devuelve uno de los 8 textos de JavaScript ('object', 'string'…),
// nunca el nombre de un tipo tuyo: Order no existe cuando el código se ejecuta.
console.log('typeof order →', typeof order);
if (typeof order === 'Order') { // ❌ Error TS2367 a propósito: typeof nunca da 'Order'
  console.log('esta línea no se ejecuta nunca');
}

// 🐛 instanceof necesita un valor de verdad (una clase o función constructora).
try {
  console.log(order instanceof Order); // ❌ Error TS2693 a propósito: Order solo es un tipo
} catch (error) {
  console.log('⛔', String(error));
}

// ✅ Una clase es JavaScript: existe en ejecución y instanceof funciona.
class Invoice {
  folio: string;
  constructor(folio: string) {
    this.folio = folio;
  }
}
const invoice = new Invoice('F-2026-0042');
console.log('✅ instanceof Invoice →', invoice instanceof Invoice);
console.log('✅ typeof Invoice →', typeof Invoice);

// Para saber si un dato desconocido «tiene forma de Order» hay que mirar sus
// propiedades en ejecución: lección 4 (in, typeof) y módulo 2, lección 6.
// > Desde Python: isinstance(x, OrderDict) con un TypedDict también falla
//   (TypeError): un TypedDict es una pista para mypy, no una clase.
```
