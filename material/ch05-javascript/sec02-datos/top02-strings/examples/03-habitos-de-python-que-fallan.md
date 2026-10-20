---
example_description: "Seis hábitos de Python que fallan con strings en JavaScript: s[-1], replace, split(), el límite de split, in y *"
example_tags: "javascript|python|strings|replace|split|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const path = 'fotos/2026/vacaciones/playa.jpg';

// 🐛 1. No hay índices negativos con corchetes: path[-1] busca la propiedad «-1».
console.log('path[-1] →', path[-1]);              // undefined
console.log('✅ path.at(-1) →', path.at(-1));      // 'g'

// 🐛 2. replace con un string cambia solo la PRIMERA aparición (en Python, todas).
console.log("replace('/', ' › ') →", path.replace('/', ' › '));
console.log("✅ replaceAll('/', ' › ') →", path.replaceAll('/', ' › '));

// 🐛 3. split() sin argumentos NO separa por espacios: devuelve [texto entero].
const sentence = ' uno  dos   tres ';
console.log('split() →', sentence.split());         // [' uno  dos   tres ']
console.log("split(' ') →", sentence.split(' '));    // con strings vacíos entre medias
// ✅ El s.split() de Python: quita los extremos y corta por «uno o más espacios».
// (/\s+/ es una expresión regular: «uno o más caracteres de espacio en blanco».)
console.log('trim().split(/\\s+/) →', sentence.trim().split(/\s+/)); // ['uno', 'dos', 'tres']

// 🐛 4. El límite de split RECORTA el resultado; no es el maxsplit de Python.
console.log("split('/', 2) →", path.split('/', 2)); // ['fotos', '2026']: el resto se pierde
// Python: path.split('/', 1) → ['fotos', '2026/vacaciones/playa.jpg']
const firstSlash = path.indexOf('/');
console.log('✅ carpeta y resto →', path.slice(0, firstSlash), '|', path.slice(firstSlash + 1));

// 🐛 5. «'jpg' in path» no busca texto: in pregunta por propiedades de objetos.
try {
  console.log('jpg' in path);
} catch (error) {
  console.log("'jpg' in path →", error.name, '|', error.message);
}
console.log("✅ path.includes('jpg') →", path.includes('jpg')); // true

// 🐛 6. * no repite strings: los convierte a número.
console.log("'ab' * 3 →", 'ab' * 3);                // NaN
console.log("✅ 'ab'.repeat(3) →", 'ab'.repeat(3)); // 'ababab'
```
