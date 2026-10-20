---
example_description: "Un = en lugar de === dentro de un if asigna en vez de comparar, y no da error (en Python es un SyntaxError)"
example_tags: "javascript|python|control-de-flujo|if|asignacion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 = asigna; === compara. Un = dentro de un if no da error:
// asigna el valor y después usa ese valor como condición.
let attempts = 0;
if (attempts = 3) { // 🐛 asigna 3 a attempts… y 3 es truthy
  console.log('🐛 entra en el if; attempts ahora vale', attempts); // 3
}

// Con un valor falsy pasa lo contrario: nunca entra… y además estropea la variable.
let level = 5;
if (level = 0) {
  console.log('esto no se imprime nunca');
}
console.log('🐛 level se ha quedado en', level); // 0

// ✅ Para comparar, ===
let tries = 0;
if (tries === 3) {
  console.log('no se imprime');
} else {
  console.log('✅ tries === 3 es false; tries sigue valiendo', tries); // 0
}

// Python no lo permite: «if attempts = 3:» es un SyntaxError
// («Maybe you meant '==' or ':='»). En JavaScript es legal;
// los linters (como ESLint, regla no-cond-assign) lo avisan.
```
