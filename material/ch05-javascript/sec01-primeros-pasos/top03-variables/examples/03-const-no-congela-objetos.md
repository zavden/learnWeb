---
example_description: "const no congela objetos ni arrays: protege la variable, no el valor"
example_tags: "javascript|variables|const|objetos|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 const protege la VARIABLE (a qué objeto apunta), no el objeto en sí.
const user = { name: 'Ada', role: 'admin' };
user.role = 'guest';              // ✅ permitido: cambia el objeto, no la variable
user.email = 'ada@example.com';   // ✅ permitido: añade una propiedad
console.log('user →', user);

const tags = ['js'];
tags.push('python');              // ✅ permitido: mismo array, un elemento más
console.log('tags →', tags);

try {
  tags = ['otro array'];          // ❌ esto SÍ reasigna la variable
} catch (error) {
  console.log('tags = […] →', error.name, '|', error.message);
}

// ✅ Para que el objeto no cambie, congélalo con Object.freeze.
// (Es superficial y lo verás a fondo en «Propiedades a fondo».)
const settings = Object.freeze({ theme: 'dark' });
settings.theme = 'light';         // se ignora sin avisar (en modo estricto: TypeError)
console.log('settings.theme →', settings.theme); // 'dark'
```
