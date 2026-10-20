---
example_description: "Parámetros por defecto: se evalúan en cada llamada (no existe la trampa del def f(x=[]) de Python) y pueden usar los parámetros anteriores"
example_tags: "javascript|python|funciones|parametros|defaults"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un valor por defecto se escribe como en Python: parámetro = valor.
function greet(name, greeting = 'Hola') {
  return `${greeting}, ${name}`;
}
console.log(greet('Marta'));            // 'Hola, Marta'
console.log(greet('Marta', 'Buenas')); // 'Buenas, Marta'

// ✅ La diferencia importante: el valor por defecto se evalúa EN CADA LLAMADA.
// En Python, def add_tag(tag, tags=[]) comparte la MISMA lista entre llamadas
// (el famoso bug del default mutable). En JavaScript, cada llamada crea un [] nuevo.
function addTag(tag, tags = []) {
  tags.push(tag);
  return tags;
}
console.log('addTag(\'urgente\') →', addTag('urgente')); // ['urgente']
console.log('addTag(\'revisar\') →', addTag('revisar')); // ['revisar'] (en Python: ['urgente', 'revisar'])

// Un default puede usar los parámetros ANTERIORES…
function pageRange(page, size = 20, first = (page - 1) * size + 1) {
  return `elementos ${first}–${first + size - 1}`;
}
console.log('pageRange(3) →', pageRange(3));         // 'elementos 41–60'
console.log('pageRange(3, 10) →', pageRange(3, 10)); // 'elementos 21–30'

// …y llamar a funciones, que solo se ejecutan si falta el argumento.
let lastId = 100;
function nextId() {
  lastId += 1;
  return lastId;
}
function createOrder(product, id = nextId()) {
  return `pedido ${id}: ${product}`;
}
console.log(createOrder('Teclado'));      // 'pedido 101: Teclado'
console.log(createOrder('Ratón', 500));   // 'pedido 500: Ratón' (nextId no se llama)
console.log(createOrder('Monitor'));      // 'pedido 102: Monitor'

// length solo cuenta los parámetros ANTERIORES al primer default.
console.log('greet.length →', greet.length); // 1
```
