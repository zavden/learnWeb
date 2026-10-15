---
example_description: "any desactiva el verificador (todo vale, también lo que falla al ejecutar); unknown acepta cualquier valor pero no deja usarlo hasta comprobar qué es (TS18046, TS2322), y un typeof lo estrecha"
example_tags: "typescript|any|unknown|typeof|ts18046|ts2322"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// any: «no compruebes nada». TypeScript deja hacer cualquier cosa…
const fromAny: any = 'Mole poblano';
try {
  console.log(fromAny.toFixed(2)); // …sin rojo, y falla al ejecutar
} catch (error) {
  console.log('any →', String(error));
}

// unknown: «no sé qué es». Acepta cualquier valor, como any…
let fromUnknown: unknown = 42;
fromUnknown = ['a', 'b'];
fromUnknown = 'Mole poblano';

// …pero no deja USARLO hasta que compruebes qué es.
console.log('unknown sin comprobar →', fromUnknown.toUpperCase()); // ❌ Error TS18046 a propósito: es unknown
const dishName: string = fromUnknown; // ❌ Error TS2322 a propósito: unknown no cabe en string

// ✅ Después de comprobarlo, dentro del if es un string (estrechamiento, lección 4):
if (typeof fromUnknown === 'string') {
  console.log('✅', fromUnknown.toUpperCase(), '|', fromUnknown.length, 'letras');
}
console.log('dishName →', dishName); // la asignación se ejecutó igual

// Regla: unknown para lo que todavía no has comprobado; any casi nunca.
// > Desde Python: Any de mypy es el any de TypeScript; object se parece a unknown.
```
