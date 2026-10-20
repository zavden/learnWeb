---
example_description: "Una aserción as no convierte ni comprueba nada: {} as Product compila y revienta al usarlo; entre tipos incompatibles TypeScript protesta (TS2352), pero as unknown as number lo silencia y el error vuelve en ejecución"
example_tags: "typescript|as|aserciones|unknown|ts2352|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { title: string; price: number };

// 🐛 as le dice a TypeScript «trátalo como Product, confía en mí».
//    No crea, no convierte y no comprueba nada en ejecución.
const draft = {} as Product; // sin error: un objeto vacío «es» un Product
console.log('draft →', draft);
try {
  console.log(draft.title.toUpperCase()); // sin rojo… y falla al ejecutar
} catch (error) {
  console.log('⛔', String(error));
}

// as entre tipos que no tienen nada que ver: aquí TypeScript sí protesta.
const fromInput = '450' as number; // ❌ Error TS2352 a propósito: un string no es un number
console.log('🐛 fromInput + 50 →', fromInput + 50); // sigue siendo texto: '45050'

// 🐛 La «doble aserción» silencia hasta eso. El error vuelve, en ejecución.
const forced = '450' as unknown as number;
console.log('🐛 forced + 50 →', forced + 50);

// ✅ Para convertir, CONVIERTE; para un objeto, créalo completo y anótalo:
const price = Number('450');
const product: Product = { title: 'Alebrije', price };
console.log('✅', product.title, '→', price + 50);
```
