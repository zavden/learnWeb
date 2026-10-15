---
example_description: "for…of recorre valores; for…in recorre claves como strings (y propiedades extra): no lo uses con arrays"
example_tags: "javascript|python|control-de-flujo|for-of|for-in|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const fruits = ['manzana', 'pera', 'uva'];

// ✅ for…of recorre los VALORES: es el «for x in lista» de Python.
for (const fruit of fruits) {
  console.log('of →', fruit);
}

// 🐛 for…in recorre las CLAVES (nombres de propiedad)… y son strings.
for (const key in fruits) {
  console.log('in →', key, '| typeof:', typeof key, '| key + 1 =', key + 1); // '01', '11', '21'
}

// 🐛 Y recorre TODAS las propiedades enumerables, no solo los índices.
fruits.source = 'mercado'; // un array es un objeto: admite propiedades extra
for (const key in fruits) {
  console.log('in (con extra) →', key); // '0', '1', '2', 'source'
}

// ✅ for…in tiene sentido con objetos, para recorrer sus claves
// (en «Números, texto y colecciones» verás Object.entries, que suele ser mejor).
const prices = { coffee: 1.5, tea: 1.2 };
for (const name in prices) {
  console.log(name, '→', prices[name]);
}

// Truco para recordarlo: «of» → valores (lo que hay DENTRO del array);
// «in» → claves (como en Python, donde «for k in dict» recorre las claves).
```
