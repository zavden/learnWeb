---
example_description: "throw acepta cualquier valor: un string lanzado no tiene message ni stack"
example_tags: "javascript|python|errores|throw|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 throw acepta CUALQUIER valor, no solo errores.
// (En Python, raise "texto" es un TypeError: solo se lanzan excepciones.)
try {
  throw 'Algo ha ido mal'; // un string
} catch (error) {
  console.log('typeof error →', typeof error);    // 'string'
  console.log('error.message →', error.message);  // undefined: un string no tiene message
  console.log('error.stack →', error.stack);      // undefined: ¡no sabes de dónde vino!
}

try {
  throw { code: 404 }; // un objeto cualquiera
} catch (error) {
  console.log('error instanceof Error →', error instanceof Error); // false
  console.log('error.code →', error.code);                         // 404
}

// ✅ Lanza siempre un Error (o un subtipo): trae name, message y stack.
try {
  throw new Error('Algo ha ido mal');
} catch (error) {
  console.log('✅', error.name, '|', error.message, '| stack:', typeof error.stack); // 'string'
}

// Sin atrapar (a propósito, última línea): la consola muestra
// «Uncaught "Algo ha ido mal"», sin tipo y sin pila de llamadas.
throw 'Algo ha ido mal';
```
