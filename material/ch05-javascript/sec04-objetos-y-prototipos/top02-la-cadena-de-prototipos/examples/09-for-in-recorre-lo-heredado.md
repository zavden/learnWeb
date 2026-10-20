---
example_description: "for…in recorre también las propiedades enumerables heredadas; Object.keys y Object.entries solo las propias"
example_tags: "javascript|prototipos|for-in|object-keys|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const defaults = { theme: 'light', fontSize: 16 };
const prefs = Object.create(defaults);
prefs.theme = 'dark';
prefs.language = 'es';

// 🐛 for…in recorre las claves enumerables PROPIAS y también las HEREDADAS.
// Aquí cuela fontSize, que es de defaults, y el informe «de prefs» miente.
for (const key in prefs) {
  console.log('🐛 for…in →', key, '=', prefs[key]);
}

// ¿Por qué no aparecen toString o hasOwnProperty, que también se heredan?
// Porque los métodos de Object.prototype son NO enumerables (lección
// «Propiedades a fondo»). Lo que tú añades con una asignación sí lo es.

// ✅ Object.keys / values / entries recorren solo las propias.
for (const [key, value] of Object.entries(prefs)) {
  console.log('✅ entries →', key, '=', value);
}

// En código antiguo verás este «guardia» dentro de cada for…in:
for (const key in prefs) {
  if (!Object.hasOwn(prefs, key)) continue; // salta las heredadas
  console.log('✅ for…in con guardia →', key);
}

// Cuándo SÍ quieres lo heredado: para obtener la configuración EFECTIVA
// (lo propio + los valores por defecto). Aquí for…in es justo lo que buscas:
const effective = {};
for (const key in prefs) effective[key] = prefs[key];
console.log('configuración efectiva →', effective); // {theme: 'dark', language: 'es', fontSize: 16}
```
