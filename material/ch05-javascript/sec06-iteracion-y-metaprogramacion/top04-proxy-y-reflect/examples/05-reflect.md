---
example_description: "Reflect tiene un método por cada trampa, con los mismos nombres y argumentos: hace la operación normal y devuelve true/false en vez de lanzar; el patrón de reenvío, Reflect.ownKeys y la trampa apply para funciones (el __call__ de Python)"
example_tags: "javascript|python|reflect|proxy|apply|call"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Reflect es un objeto con UN método por cada trampa, con el mismo nombre y
// los mismos argumentos. Cada uno hace la operación normal, sin trucos:
const dish = { name: 'Pozole rojo', cents: 14500 };
console.log('Reflect.get →', Reflect.get(dish, 'name'));          // dish.name
console.log('Reflect.has →', Reflect.has(dish, 'cents'));         // 'cents' in dish
console.log('Reflect.ownKeys →', Reflect.ownKeys(dish));          // texto + símbolos
console.log('Reflect.set →', Reflect.set(dish, 'cents', 15000));  // dish.cents = 15000

// Diferencia con Object.*: devuelve true/false en vez de lanzar o callar.
const frozen = Object.freeze({ cents: 100 });
console.log('Reflect.set en congelado →', Reflect.set(frozen, 'cents', 1));
console.log('Reflect.defineProperty →', Reflect.defineProperty(frozen, 'extra', { value: 1 }));
try {
  Object.defineProperty(frozen, 'extra', { value: 1 });
} catch (error) {
  console.log('Object.defineProperty →', error.name, '|', error.message);
}

// El patrón de reenvío: cada trampa hace su trabajo y deja que Reflect haga
// lo normal con EXACTAMENTE los mismos argumentos.
const changes = [];
const tracked = new Proxy(dish, {
  set(target, key, value, receiver) {
    changes.push(`${String(key)}: ${target[key]} → ${value}`);
    return Reflect.set(target, key, value, receiver); // devuelve el booleano que set necesita
  },
});
tracked.cents = 16000;
tracked.name = 'Pozole verde';
console.log('cambios →', changes);

// La trampa apply: solo para proxies de FUNCIONES. Intercepta las llamadas.
function shippingCost(kilos, zone) {
  return zone === 'local' ? 50 + kilos * 10 : 120 + kilos * 25;
}
const calls = [];
const countedShipping = new Proxy(shippingCost, {
  apply(target, thisArg, args) {
    calls.push(args.join(' kg, '));
    return Reflect.apply(target, thisArg, args);
  },
});
console.log('envío →', countedShipping(2, 'local'), countedShipping(5, 'nacional'));
console.log('llamadas →', calls);

// > Desde Python: Reflect.get/set/has/deleteProperty son getattr, setattr,
//   hasattr y delattr (con la operación normal, sin trampas propias). La
//   trampa apply se parece a __call__, pero solo puede envolver una función:
//   un objeto normal no se puede «llamar» por mucho proxy que le pongas.
```
