---
example_description: "typeof null es 'object': un error histórico que obliga a comprobar null aparte"
example_tags: "javascript|tipos|typeof|null|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 typeof null devuelve 'object', aunque null es un primitivo.
console.log('typeof null →', typeof null); // 'object'

// Es un error de la primera versión de JavaScript (1995): cada valor llevaba una
// etiqueta de tipo en sus bits bajos, la de «objeto» era 0… y null era el puntero
// nulo, todo ceros. Corregirlo rompería millones de webs, así que se quedó.

// Consecuencia: typeof x === 'object' NO garantiza que x sea un objeto usable.
const config = null;
if (typeof config === 'object') {
  try {
    console.log(config.theme);
  } catch (error) {
    console.log('🐛 config.theme →', error.name, '|', error.message);
  }
}

// ✅ Para null, compara directamente con ===.
console.log('config === null →', config === null); // true

// ✅ Para «es un objeto de verdad», descarta también null.
const isRealObject = typeof config === 'object' && config !== null;
console.log('¿config es un objeto de verdad? →', isRealObject); // false

// Otro hueco de typeof: los arrays también dan 'object'. Usa Array.isArray.
console.log('typeof [1, 2] →', typeof [1, 2]);                  // 'object'
console.log('Array.isArray([1, 2]) →', Array.isArray([1, 2]));  // true
```
