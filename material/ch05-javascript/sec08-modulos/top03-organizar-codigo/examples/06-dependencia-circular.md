---
example_description: "Una dependencia circular entre orders.js y customers.js: si se importa primero orders.js, customers.js se evalúa antes y lee TAX_RATE en su zona muerta temporal: ReferenceError: Cannot access 'TAX_RATE' before initialization"
example_tags: "javascript|python|modulos|dependencias-circulares|tdz|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/06-ciclo/):
//   orders.js    → importa customerName de customers.js; exporta TAX_RATE
//   customers.js → importa TAX_RATE de orders.js y lo usa en su NIVEL SUPERIOR
//
//        orders.js ──────→ customers.js
//            ▲                   │
//            └───────────────────┘   ← un ciclo
//
// Qué pasa al importar orders.js:
//   1. orders.js necesita customers.js → se evalúa customers.js PRIMERO
//   2. customers.js necesita orders.js → ya está «en curso»: no se espera
//   3. customers.js lee TAX_RATE, que orders.js aún no ha inicializado
//      → la const está en su zona muerta temporal (TDZ) → ReferenceError
// (import() se explica en la lección «Import dinámico»; aquí atrapa el error.)
try {
  await import('./06-ciclo/orders.js');
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}

// Nada se evalúa a medias: orders.js nunca llegó a ejecutarse (no aparece
// «(evaluando orders.js)»), y ninguno de los dos se puede usar ya en esta
// página: un módulo que falló al evaluarse se queda con ese error.
try {
  await import('./06-ciclo/customers.js');
} catch (error) {
  console.log('🐛 otra vez →', error.name, '|', error.message);
}

// > Desde Python, el mismo ciclo da:
//   ImportError: cannot import name 'TAX_RATE' from partially initialized
//   module 'orders' (most likely due to a circular import)
```
