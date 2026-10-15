---
example_description: "El patrón módulo: una IIFE que devuelve una API pública y esconde el estado en un closure, como se organizaba el código antes de los módulos"
example_tags: "javascript|closures|iife|patron-modulo|encapsulacion"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Antes de los módulos ES (módulo «Módulos y organización»), las librerías se
// organizaban así: una IIFE que se ejecuta una vez, guarda su estado en
// variables locales y devuelve SOLO las funciones que quiere hacer públicas.
const cart = (function () {
  // ── privado ──────────────────────────────────────────
  const items = new Map(); // sku → { name, cents, qty }
  const FREE_SHIPPING_CENTS = 5000;

  function subtotal() {
    let cents = 0;
    for (const item of items.values()) cents += item.cents * item.qty;
    return cents;
  }

  // ── público ──────────────────────────────────────────
  return {
    add(sku, name, cents) {
      const current = items.get(sku);
      items.set(sku, { name, cents, qty: (current?.qty ?? 0) + 1 });
    },
    remove(sku) {
      items.delete(sku);
    },
    summary() {
      const cents = subtotal();
      const shipping = cents >= FREE_SHIPPING_CENTS || cents === 0 ? 0 : 495;
      return { lines: items.size, subtotal: cents, shipping, total: cents + shipping };
    },
  };
})();

cart.add('BK-01', 'Novela', 1990);
cart.add('BK-01', 'Novela', 1990);
cart.add('MG-07', 'Revista', 650);
console.log('summary →', cart.summary()); // { lines: 2, subtotal: 4630, shipping: 495, total: 5125 }
cart.add('LP-02', 'Lámpara', 2400);
console.log('summary →', cart.summary()); // envío gratis a partir de 50 €

// Lo privado no se ve desde fuera:
console.log('cart.items →', cart.items);       // undefined
console.log('typeof subtotal →', typeof subtotal); // 'undefined'
console.log('API pública →', Object.keys(cart)); // ['add', 'remove', 'summary']

// Hoy lo mismo se consigue con un archivo de módulo (lo no exportado es privado)
// o con una clase con campos #privados. El mecanismo de fondo sigue siendo el ámbito.
```
