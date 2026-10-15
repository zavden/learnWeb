---
example_description: "JSON.stringify de un Map devuelve '{}' y pierde todos los datos; hay que convertirlo antes a objeto o a array de pares"
example_tags: "javascript|map|set|json|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const settings = new Map([['theme', 'dark'], ['fontSize', 16]]);
const tags = new Set(['css', 'html']);

// 🐛 JSON no conoce Map ni Set: los serializa como objetos vacíos, sin avisar.
console.log('JSON de un Map →', JSON.stringify(settings));   // '{}'
console.log('JSON de un Set →', JSON.stringify(tags));       // '{}'

// ✅ Convierte antes de serializar…
const asObject = JSON.stringify(Object.fromEntries(settings));   // solo si las claves son strings
const asPairs = JSON.stringify([...settings]);                   // funciona con cualquier clave
const asArray = JSON.stringify([...tags]);
console.log('objeto →', asObject);
console.log('pares →', asPairs);
console.log('Set como array →', asArray);

// …y reconstruye al leer.
const restored = new Map(JSON.parse(asPairs));
console.log('Map reconstruido →', restored);
console.log("restored.get('fontSize') →", restored.get('fontSize'));
// La lección «JSON y copias» explica el resto de lo que JSON pierde por el camino.
```
