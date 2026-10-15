---
example_description: "call y apply llaman a una función con el this que elijas; bind devuelve una función nueva con this fijado para siempre"
example_tags: "javascript|python|this|call|apply|bind"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Regla 4: this EXPLÍCITO. Toda función tiene los métodos call, apply y bind.
function describe(icon, suffix) {
  return `${icon} ${this.name} (${this.city})${suffix}`;
}
const north = { name: 'Sucursal Norte', city: 'Monterrey' };
const south = { name: 'Sucursal Sur', city: 'Mérida' };

// call: llama YA, con this = primer argumento; el resto, sueltos.
console.log('call →', describe.call(north, '📍', '.'));

// apply: igual que call, pero los argumentos van en un ARRAY.
console.log('apply →', describe.apply(south, ['📍', '!']));
// (Hoy casi no se usa: con spread, describe.call(south, ...args) hace lo mismo.)

// bind: NO llama. Devuelve una función NUEVA con this fijado para siempre.
const describeNorth = describe.bind(north);
console.log('bind →', describeNorth('🏢', ''));

// Una función atada ignora cualquier otro this: call, otro bind o un método.
console.log('call sobre la atada →', describeNorth.call(south, '🏢', ''));   // sigue siendo Norte
const kiosk = { name: 'Quiosco', city: 'Puebla', describe: describeNorth };
console.log('como método →', kiosk.describe('🏢', ''));                     // sigue siendo Norte

// bind también puede fijar los primeros ARGUMENTOS (aplicación parcial,
// lección «Funciones de orden superior»):
const pinNorth = describe.bind(north, '📌');
console.log('bind con argumento →', pinNorth(' (abierta)'));

// Uso típico de bind: entregar un método como callback sin perder su this.
const store = {
  name: 'Tienda',
  log(message) {
    console.log(`[${this.name}] ${message}`);
  },
};
['abierta', 'cerrada'].forEach(store.log.bind(store));

// > Desde Python: describe.call(north, …) se parece a llamar a
//   Clase.metodo(objeto, …) pasando self a mano, y bind a crear un bound method.
```
