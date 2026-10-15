---
example_description: "JSON.parse es estricto: comillas simples, comas finales, comentarios o claves sin comillas lanzan SyntaxError"
example_tags: "javascript|json|parse|errores|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Todo esto es JavaScript válido… pero NO es JSON válido.
const attempts = [
  "{'name': 'Ana'}",           // comillas simples
  '{"name": "Ana",}',          // coma final
  '{name: "Ana"}',             // clave sin comillas
  '{"name": "Ana" // nombre\n}', // comentario
  '',                          // texto vacío (p. ej., una respuesta de servidor vacía)
];

for (const text of attempts) {
  try {
    JSON.parse(text);
    console.log('✅', text);
  } catch (error) {
    console.log('❌', JSON.stringify(text), '→', error.name);
  }
}

// ✅ Envuelve SIEMPRE JSON.parse de datos externos en try/catch.
function parseOrNull(text) {   // las funciones se estudian en el módulo 3
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
console.log('parseOrNull(\'{"ok":true}\') →', parseOrNull('{"ok":true}'));
console.log("parseOrNull('basura') →", parseOrNull('basura'));
```
