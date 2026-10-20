---
example_description: "new F() crea un objeto nuevo y llama a F con this apuntando a él: una función constructora mínima (new se estudia a fondo en el módulo 4)"
example_tags: "javascript|python|this|new|constructor"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Regla 3: LLAMADA CON new. new F(...) crea un objeto NUEVO, vacío, y llama a F
// con this apuntando a ese objeto. Si F no devuelve otro objeto, new devuelve this.
// (Qué hace new paso a paso y para qué sirve prototype se estudian en el módulo
// «Objetos y prototipos»; aquí solo nos interesa this.)
function Product(title, cents) {
  // this → el objeto recién creado
  this.title = title;
  this.cents = cents;
  this.label = `${title} · ${(cents / 100).toFixed(2)} €`;
  // sin return: new devuelve this
}

const lamp = new Product('Lámpara de mesa', 2400);
const mug = new Product('Taza de cerámica', 850);
console.log('lamp →', lamp);
console.log('mug.label →', mug.label);
console.log('¿objetos distintos? →', lamp !== mug); // true: cada new crea uno
console.log('lamp instanceof Product →', lamp instanceof Product); // true

// Convención: las funciones pensadas para usarse con new empiezan por MAYÚSCULA
// (Product, Date, Map…). Así se ve a simple vista que hay que poner new.

// Las flechas no tienen this propio, así que no pueden ser constructoras.
const ArrowProduct = (title) => ({ title });
try {
  new ArrowProduct('Vela');
} catch (error) {
  console.log('new con flecha →', error.name, '|', error.message);
}

// > Desde Python: es lo que hace Product('Lámpara', 2400) con una clase:
//   crear la instancia y ejecutar __init__(self, …). Aquí self se llama this,
//   no se declara, y hace falta escribir new. Las clases de JavaScript
//   (módulo «Clases y POO») son una sintaxis más cómoda para lo mismo.
```
