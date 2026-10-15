---
example_description: "Dos librerías que añaden un método con el mismo nombre a los mismos objetos se pisan; con claves symbol conviven; un método symbol en Array.prototype no aparece en for…in ni choca con métodos futuros"
example_tags: "javascript|symbol|protocolos|prototipos-nativos|colisiones"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const product = { name: 'Café de Chiapas', cents: 21000 };

// 🐛 Con nombres de texto, dos librerías que añaden «format» se pisan:
product.format = function () { return `${this.name}: $${(this.cents / 100).toFixed(2)}`; }; // librería de precios
product.format = function () { return `<b>${this.name}</b>`; };                              // librería de HTML
console.log('🐛 la de precios →', product.format()); // gana la última en cargarse
delete product.format;

// ✅ Con símbolos, cada librería crea SU clave y no pueden chocar.
const formatPrice = Symbol('prices.format');
const formatHtml = Symbol('html.format');
product[formatPrice] = function () { return `${this.name}: $${(this.cents / 100).toFixed(2)}`; };
product[formatHtml] = function () { return `<b>${this.name}</b>`; };
console.log('✅ precios →', product[formatPrice]());
console.log('✅ HTML →', product[formatHtml]());
console.log('✅ claves de texto intactas →', Object.keys(product));

// Un protocolo propio: «si un objeto tiene [describe](), el log lo usa».
const describe = Symbol('logger.describe');
function logItem(value) {
  const text = typeof value?.[describe] === 'function' ? value[describe]() : JSON.stringify(value);
  console.log('  log:', text);
}
logItem({ table: 4 });
logItem({ table: 4, [describe]() { return `Mesa ${this.table} 🍽️`; } });

// La promesa de la lección «Prototipos nativos»: un método nuevo para TODOS los
// arrays con clave symbol no choca con un futuro .last() del estándar, y no sale
// en for…in aunque se añada con una asignación normal (enumerable).
const last = Symbol('last');
Array.prototype[last] = function () {
  return this[this.length - 1];
};
const steps = ['moler', 'calentar', 'filtrar'];
console.log('steps[last]() →', steps[last]());
const indexes = [];
for (const key in steps) indexes.push(key);
console.log('for…in →', indexes); // sin «last»
delete Array.prototype[last]; // deshacemos el cambio
// (Sigue siendo cambiar un objeto compartido por todo el código de la página:
//  úsalo en tu propio código, nunca en una librería que publiques.)
```
