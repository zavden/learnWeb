---
example_description: "El spread y Object.assign ejecutan los getters y copian su resultado como valor fijo; para copiar los accesores hay que copiar los descriptores"
example_tags: "javascript|objetos|getters|spread|copias|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
const cart = {
  items: [
    { name: 'Té verde sencha', cents: 450 },
    { name: 'Taza de cerámica', cents: 850 },
  ],
  get totalCents() {
    return this.items.reduce((sum, item) => sum + item.cents, 0);
  },
};

// 🐛 El spread LEE cada propiedad: ejecuta el getter una vez y guarda el
// resultado en la copia como un valor normal. La copia ya no calcula nada.
const copy = { ...cart, items: [...cart.items] };
copy.items.push({ name: 'Galletas de avena', cents: 300 });
console.log('🐛 copy.totalCents →', copy.totalCents); // 1300: no cuenta las galletas
console.log('🐛 en la copia →', Object.getOwnPropertyDescriptor(copy, 'totalCents'));
// {value: 1300, writable: true, …}: el getter se ha convertido en un número.
// Object.assign, structuredClone y JSON.stringify hacen lo mismo.

// ✅ Para copiar cada propiedad CON sus atributos (getters incluidos), copia
// los descriptores: getOwnPropertyDescriptors + defineProperties.
const faithful = Object.defineProperties({}, Object.getOwnPropertyDescriptors(cart));
faithful.items = [...cart.items, { name: 'Galletas de avena', cents: 300 }];
console.log('✅ faithful.totalCents →', faithful.totalCents); // 1600
console.log('✅ en la copia fiel →', Object.getOwnPropertyDescriptor(faithful, 'totalCents'));
// {get: ƒ, set: undefined, …}: sigue siendo un getter.

// El original no ha cambiado en ningún caso:
console.log('cart.totalCents →', cart.totalCents); // 1300
```
