---
example_description: "satisfies comprueba que un valor encaja en un tipo (cost: '0' da TS2322) sin cambiar el tipo inferido, así que keyof typeof conserva las claves concretas; as, en cambio, deja pasar un objeto al que le falta cost"
example_tags: "typescript|satisfies|as|keyof|record|ts2322"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Zone = { label: string; cost: number };

// satisfies comprueba que el valor encaja en el tipo… y CONSERVA el tipo inferido.
const ZONES = {
  local: { label: 'Ciudad de México', cost: 69 },
  national: { label: 'Resto del país', cost: 189 },
} satisfies Record<string, Zone>;
type ZoneId = keyof typeof ZONES; // → 'local' | 'national': las claves concretas siguen ahí

function quote(zone: ZoneId, subtotal: number): number {
  return subtotal + ZONES[zone].cost;
}
console.log('local →', quote('local', 500), '| nacional →', quote('national', 500));

// Si algo no encaja, el error sale en el valor, igual que con una anotación:
const PICKUP = {
  store: { label: 'Recoger en tienda', cost: '0' }, // ❌ Error TS2322 a propósito: cost es un string
} satisfies Record<string, Zone>;
console.log('typeof PICKUP.store.cost →', typeof PICKUP.store.cost);

// 🐛 as no comprueba que el objeto esté completo: aquí falta cost y no hay error.
const express = { label: 'Express' } as Zone;
console.log('🐛 express →', express.cost, '| total →', 500 + express.cost);
```
