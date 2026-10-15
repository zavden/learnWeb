---
example_description: "Object.create(null) crea un objeto sin prototipo: un diccionario sin claves heredadas, sin toString y donde __proto__ es una clave más"
example_tags: "javascript|python|prototipos|object-create|diccionarios"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const text = 'el valor del constructor es el valor';

// 🐛 Con {} el contador «ya tiene» claves: wordCount['constructor'] encuentra
// la función Object heredada de Object.prototype, y ?? no la sustituye.
const naive = {};
for (const word of text.split(' ')) {
  naive[word] = (naive[word] ?? 0) + 1;
}
console.log('🐛 naive.constructor →', naive.constructor); // 'function Object() { [native code] }1'

// ✅ Object.create(null): un objeto cuyo [[Prototype]] es null. No hereda nada.
const wordCount = Object.create(null);
for (const word of text.split(' ')) {
  wordCount[word] = (wordCount[word] ?? 0) + 1;
}
console.log('✅ wordCount →', wordCount);
// La consola lo marca: [Object: null prototype] {…}. Al expandirlo no hay
// ninguna línea [[Prototype]].
console.log('prototipo →', Object.getPrototypeOf(wordCount)); // null
console.log("'toString' in wordCount →", 'toString' in wordCount); // false

// Sin prototipo no hay toString ni valueOf: convertirlo a texto falla.
try {
  console.log(`Resultado: ${wordCount}`);
} catch (error) {
  console.log('plantilla →', error.name, '|', error.message);
}

// Y __proto__ es una clave normal (en {} sería el getter/setter heredado).
wordCount.__proto__ = 'una palabra más';
console.log('Object.keys →', Object.keys(wordCount)); // incluye '__proto__'

// Las funciones estáticas de Object funcionan igual que siempre:
console.log('Object.entries →', Object.entries(wordCount).length, 'pares');
console.log("Object.hasOwn(wordCount, 'valor') →", Object.hasOwn(wordCount, 'valor'));

// Hoy, para diccionarios con claves que llegan de fuera, la opción clara es
// Map (lección «Map, Set y Weak»). Object.create(null) sigue apareciendo en
// código y en el lenguaje: Object.groupBy devuelve objetos así.
```
