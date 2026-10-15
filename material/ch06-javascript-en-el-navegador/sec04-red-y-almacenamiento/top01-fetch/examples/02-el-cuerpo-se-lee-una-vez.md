---
example_description: "El cuerpo de un Response se lee una sola vez: después de json(), text() falla con «body stream already read». Soluciones: leer una vez como texto y usar JSON.parse, o clone() ANTES de leer (después ya no se puede)"
example_tags: "javascript|fetch|response|body|clone|bodyused|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Queremos los productos (JSON) y, además, el texto tal cual para un registro.
const response = await fetch('products.json');
const products = await response.json();
console.log('json() →', products.length, 'productos | bodyUsed →', response.bodyUsed);

// 🐛 El cuerpo es un flujo de bytes que se consume al leerlo: no hay segunda vez.
try {
  const raw = await response.text();
  console.log('texto →', raw.length);
} catch (error) {
  console.log('🐛 text() después de json() →', `${error.name}: ${error.message}`);
}

// ✅ 1. Lee UNA vez, como texto, y analiza tú el JSON.
const second = await fetch('products.json');
const raw = await second.text();
console.log('✅ text() →', raw.length, 'caracteres | JSON.parse →', JSON.parse(raw).length, 'productos');

// ✅ 2. clone() ANTES de leer: dos Response con cuerpos independientes.
const third = await fetch('products.json');
const copy = third.clone();
const [data, copyText] = await Promise.all([third.json(), copy.text()]);
console.log('✅ clone() → json:', data.length, 'productos | text:', copyText.length, 'caracteres');

// 🐛 clone() después de leer llega tarde: ya no queda cuerpo que copiar.
try {
  third.clone();
} catch (error) {
  console.log('🐛 clone() tarde →', `${error.name}: ${error.message}`);
}

// Pasa lo mismo con blob(), arrayBuffer() y formData(): cada Response se lee
// con UN método, una vez. clone() duplica el flujo (el navegador guarda los
// bytes para la copia), así que con respuestas enormes sale caro.
// > Desde Python: en requests, r.text y r.json() se pueden pedir mil veces
//   porque requests ya descargó y guardó el cuerpo. fetch no guarda nada.
```
