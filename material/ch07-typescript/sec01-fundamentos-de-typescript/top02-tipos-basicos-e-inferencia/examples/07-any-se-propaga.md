---
example_description: "any se propaga en silencio: una propiedad de un any es any, y una suma con any es any; un texto que llega de un JSON se concatena y rompe más abajo sin un solo error rojo. Convertir en la frontera corta la cadena"
example_tags: "typescript|any|json|inferencia|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Ajustes de envío guardados como JSON (en localStorage, por ejemplo).
// El servidor que los generó escribió deliveryFee como texto: "49".
function loadSettings(): any {
  return JSON.parse('{"deliveryFee": "49", "freeFrom": 500}');
}

// 🐛 Todo lo que toca un any se vuelve any, sin avisar:
const settings = loadSettings(); // any
const fee = settings.deliveryFee; // any
const total = 380 + fee; // any (una suma con any da any)
console.log('🐛 total →', total); // '38049': el + concatenó

try {
  const label: string = total.toFixed(2); // ni un rojo en todo el camino…
  console.log(label);
} catch (error) {
  console.log('⛔', String(error)); // …y el fallo sale lejos de su causa
}

// ✅ Convierte en la frontera y el any se acaba ahí: Number() devuelve number.
const safeFee = Number(settings.deliveryFee); // number
const safeTotal = 380 + safeFee; // number
console.log('✅ total →', safeTotal.toFixed(2));
// Mejor todavía: que loadSettings devuelva unknown (o un tipo comprobado) en
// vez de any, para que TypeScript te obligue a revisar los datos (módulo 2).
```
