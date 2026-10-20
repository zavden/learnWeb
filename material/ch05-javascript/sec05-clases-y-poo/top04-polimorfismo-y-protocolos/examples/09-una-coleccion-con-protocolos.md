---
example_description: "Una colección propia que habla el idioma de los nativos: size, has, at, Symbol.iterator, toString, toJSON y Symbol.toStringTag, con el método mágico de Python equivalente a cada uno"
example_tags: "javascript|python|protocolos|colecciones|symbol-iterator|dunder"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Lista de la compra sin duplicados (ignora mayúsculas) que conserva el orden.
class ShoppingList {
  #items = new Map(); // clave normalizada → texto original

  static from(iterable) {                 // como Array.from / Set
    const list = new ShoppingList();
    for (const item of iterable) list.add(item);
    return list;
  }

  add(item) {
    const key = item.trim().toLowerCase();
    if (!this.#items.has(key)) this.#items.set(key, item.trim());
    return this;
  }

  get size() {                            // __len__  → len(lista)
    return this.#items.size;
  }

  has(item) {                             // __contains__ → item in lista
    return this.#items.has(item.trim().toLowerCase());
  }

  at(index) {                             // __getitem__ → lista[i]
    return [...this.#items.values()].at(index);
  }

  [Symbol.iterator]() {                   // __iter__ → for item in lista
    return this.#items.values();          // el iterador de un Map sirve tal cual
  }

  toString() {                            // __str__ → str(lista)
    return `🛒 ${[...this].join(', ')}`;
  }

  toJSON() {                              // para json.dumps(lista, default=…)
    return [...this];
  }

  get [Symbol.toStringTag]() {            // ≈ type(lista).__name__ al convertir
    return 'ShoppingList';
  }
}

const list = ShoppingList.from(['Tortillas', 'aguacates', ' Tortillas ', 'Queso Oaxaca']);
list.add('AGUACATES').add('limones');

console.log('size →', list.size);
console.log("has('queso oaxaca') →", list.has('queso oaxaca'));
console.log('at(0), at(-1) →', list.at(0), list.at(-1));
console.log('for…of →', [...list].map((item, i) => `${i + 1}. ${item}`).join(' '));
console.log('plantilla →', `${list}`);
console.log('JSON →', JSON.stringify({ week: 42, list }));
console.log('etiqueta →', Object.prototype.toString.call(list));

// Lo que NO se puede imitar con una clase normal:
console.log('list[0] →', list[0]);           // undefined: no hay __getitem__ (Proxy, módulo 6)
console.log('list.length →', list.length);   // undefined: la convención es size o length
console.log('Boolean(lista vacía) →', Boolean(new ShoppingList())); // true: todo objeto es truthy
// (En Python, una colección vacía es falsa gracias a __len__; aquí, comprueba size === 0.)
```
