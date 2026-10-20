---
example_description: "Un mini store reactivo: el estado es un proxy cuya trampa set avisa a los suscriptores de cada cambio (el patrón observador sin llamar a emit); no avisa si el valor no cambia, y no ve los cambios dentro de objetos anidados"
example_tags: "javascript|proxy|reactividad|store|observador|set"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un store: el estado es un proxy y CADA asignación avisa a los suscriptores.
// Es el patrón observador de «Patrones de diseño», pero nadie llama a emit():
// lo hace la trampa set.
function createStore(initialState) {
  const listeners = new Set();
  const notify = (change) => {
    for (const listener of [...listeners]) listener(change);
  };

  const state = new Proxy({ ...initialState }, { // objetivo nuevo: solo existe el proxy
    set(target, key, value, receiver) {
      const previous = target[key];
      if (Object.is(previous, value)) return true; // sin cambio, sin aviso
      const ok = Reflect.set(target, key, value, receiver);
      notify({ key, previous, value });
      return ok;
    },
    deleteProperty(target, key) {
      const previous = target[key];
      const ok = Reflect.deleteProperty(target, key);
      if (ok) notify({ key, previous, value: undefined });
      return ok;
    },
  });

  return {
    state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener); // la baja, ya preparada
    },
  };
}

const cart = createStore({ items: 0, totalCents: 0, coupon: null });

// Dos partes de la app que no se conocen entre sí:
const stopBadge = cart.subscribe(({ key, value }) => {
  if (key === 'items') console.log(`  🛒 insignia del carrito: ${value}`);
});
cart.subscribe(({ key, previous, value }) => {
  console.log(`  📝 ${key}: ${JSON.stringify(previous)} → ${JSON.stringify(value)}`);
});

console.log('▶ añadir un café');
cart.state.items += 1; // lee y asigna: una asignación normal, un aviso
cart.state.totalCents = 21000;
console.log('▶ el mismo total otra vez (no avisa)');
cart.state.totalCents = 21000;
console.log('▶ la insignia se da de baja');
stopBadge();
cart.state.items += 1;
cart.state.coupon = 'BUENFIN';
console.log('▶ quitar el cupón');
delete cart.state.coupon;

// 🤔 Límite: el proxy solo ve las asignaciones en SU nivel.
console.log('▶ un array dentro del estado');
cart.state.notes = [];          // asignación al proxy: avisa
cart.state.notes.push('regalo'); // push cambia el ARRAY, no el proxy: silencio
console.log('  notas →', cart.state.notes.length, '(nadie se enteró del push)');
// Las librerías reactivas (Vue 3, MobX) resuelven esto envolviendo en otro proxy
// cada objeto anidado cuando la trampa get lo lee. En el capítulo 6 conectarás
// un store así con el DOM: cada aviso redibujará una parte de la página.
```
