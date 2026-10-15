---
example_description: "Los strings son inmutables: cambiar un carácter se ignora en silencio; los métodos devuelven strings nuevos"
example_tags: "javascript|python|tipos|string|inmutabilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Tres formas de escribir un string: comillas simples, dobles o invertidas.
const single = 'hola';
const double = "hola";
const template = `hola ${1 + 1}`; // las invertidas admiten ${…}, como f"…" en Python
console.log(single, '|', double, '|', template);

// No hay tipo «carácter»: un carácter es un string de longitud 1.
console.log('single[0] →', single[0], '| typeof →', typeof single[0]);

// 🐛 Los strings son inmutables… y cambiar un carácter NO da error: se ignora.
let word = 'gato';
word[0] = 'p';
console.log('tras word[0] = "p" →', word); // 'gato' (en Python: TypeError)

// En modo estricto el mismo intento sí lanza un TypeError.
function strictChange() {
  'use strict';
  const text = 'gato';
  text[0] = 'p';
}
try {
  strictChange();
} catch (error) {
  console.log('modo estricto →', error.name, '|', error.message);
}

// ✅ Los métodos no modifican el string: devuelven uno NUEVO.
const upper = word.toUpperCase();
console.log('word →', word, '| upper →', upper);

// Para «cambiarlo», crea otro string y reasigna la variable.
word = 'p' + word.slice(1);
console.log('word reasignada →', word); // 'pato'
```
