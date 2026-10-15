---
example_description: "La convención _x es solo un aviso (la propiedad se ve, se copia y se cambia); #x es privacidad real; comparación con _x y __x de Python y con un closure"
example_tags: "javascript|python|clases|privados|convenciones|closures"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// 1. Convención _x: «interno, no lo toques». Es una propiedad normal.
class ConventionCart {
  constructor() {
    this._items = [];
  }
  add(name) {
    this._items.push(name);
    return this;
  }
  count() {
    return this._items.length;
  }
}

// 2. Campo #privado: el lenguaje lo protege.
class PrivateCart {
  #items = [];
  add(name) {
    this.#items.push(name);
    return this;
  }
  count() {
    return this.#items.length;
  }
}

// 3. Closure (lección «Closures»): también privado de verdad, sin clases.
function createClosureCart() {
  const items = [];
  return {
    add(name) { items.push(name); return this; },
    count() { return items.length; },
  };
}

const carts = {
  '_items': new ConventionCart().add('Café de Chiapas'),
  '#items': new PrivateCart().add('Café de Chiapas'),
  closure: createClosureCart().add('Café de Chiapas'),
};

// Lo que ve y puede hacer el código de fuera con cada uno:
for (const [kind, cart] of Object.entries(carts)) {
  const seen = `claves ${JSON.stringify(Object.keys(cart))} · JSON ${JSON.stringify(cart)}`;
  cart._items = []; // un descuido (o un «atajo») desde fuera
  console.log(`${kind.padEnd(7)} → ${seen} · count() tras vaciar _items: ${cart.count()}`);
}
// Con _items, los datos se ven, salen en el JSON y el «atajo» vació el carrito
// (count 0). Con #items y con el closure no se ven, y cart._items es una
// propiedad nueva sin relación con los datos (count 1).

// > Desde Python:
//   self._items   → convención, igual que _items aquí.
//   self.__items  → «name mangling»: se guarda como _Cart__items y sigue siendo
//                   accesible (cart._Cart__items). Evita choques, no protege.
//   JavaScript #items → privado de verdad: no hay ningún nombre para llegar a él.
//   (TypeScript tiene además private, que solo comprueba el compilador: capítulo 7.)
```
