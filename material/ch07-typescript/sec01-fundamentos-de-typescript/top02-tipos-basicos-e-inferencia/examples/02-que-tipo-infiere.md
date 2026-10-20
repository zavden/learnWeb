---
example_description: "Una variable inferida tiene un tipo fijo (asignarle otra cosa es TS2322); let ensancha al tipo general (string) y const conserva el valor exacto como tipo literal ('GET'), lo que importa al pasarla a una función que solo acepta ciertos textos"
example_tags: "typescript|inferencia|let|const|tipos-literales|ensanchamiento|ts2322|ts2345"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// 🐛 Inferir no es «sin tipo»: el tipo se fija en la declaración.
let units = 12; // inferido: number
units = 'doce'; // ❌ Error TS2322 a propósito: units es number desde su declaración
console.log('units →', units, '|', typeof units);

// let «ensancha»: como puede cambiar, su tipo es el general.
let methodLet = 'GET'; // tipo: string
// const no puede cambiar, así que su tipo es el valor exacto (un tipo literal).
const methodConst = 'GET'; // tipo: 'GET'

// Una función que solo acepta dos textos concretos.
// 'GET' | 'POST' se lee «'GET' o 'POST'» (uniones de literales: lecciones 4 y 5).
function request(path: string, method: 'GET' | 'POST'): string {
  return `${method} ${path}`;
}

console.log('✅', request('/api/pedidos', methodConst));
console.log('🐛', request('/api/pedidos', methodLet)); // ❌ Error TS2345 a propósito: string es más amplio que 'GET' | 'POST'

// ✅ Si la variable tiene que cambiar, anótala con el tipo exacto:
let method: 'GET' | 'POST' = 'GET';
method = 'POST';
console.log('✅', request('/api/pedidos', method));
```
