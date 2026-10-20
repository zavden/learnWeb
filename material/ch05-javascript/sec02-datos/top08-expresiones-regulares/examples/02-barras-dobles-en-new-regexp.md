---
example_description: "new RegExp(string) recibe el texto YA procesado: '\\d' llega como 'd' y hay que escribir '\\\\d'; el texto del usuario trae metacaracteres (. + ( ?) que se escapan con RegExp.escape, y un patrón mal formado lanza SyntaxError"
example_tags: "javascript|regex|new-regexp|escape|regexp-escape|syntaxerror|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// new RegExp(texto, flags) construye la regex a partir de un STRING: sirve cuando
// el patrón depende de datos (un prefijo elegido, lo que busca el usuario…).
const prefix = 'CAF';

// 🐛 En un string, '\d' no es «barra + d»: es un escape que no existe y se queda
//    en 'd'. La regex que se construye es CAF-d{3}: busca «CAF-ddd».
const buggy = new RegExp(prefix + '-\d{3}');
console.log('🐛 source →', buggy.source, '| test →', buggy.test('CAF-500'));

// ✅ Dobla cada barra: el string '\\d' contiene «\d».
const fixed = new RegExp(prefix + '-\\d{3}');
console.log('✅ source →', fixed.source, '| test →', fixed.test('CAF-500'));
// (En la lección «Plantillas etiquetadas» verás String.raw, que evita doblarlas.)

// 🐛 El texto del usuario puede traer METACARACTERES: «.» es «cualquier carácter»…
const userSearch = '1.5 kg';
console.log('🐛 busca «1.5 kg» →', new RegExp(userSearch).test('Arroz 125 kg'));
// …y un paréntesis sin cerrar ni siquiera es una regex válida:
try {
  new RegExp('mole (500 g');
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}

// ✅ RegExp.escape (Chrome 136+) escapa todo lo que tiene significado especial.
//    La primera letra o cifra y los espacios salen como \xNN: así el resultado es
//    seguro en cualquier posición del patrón.
console.log('escape →', RegExp.escape('1.5 kg'));
const safe = new RegExp(RegExp.escape(userSearch));
console.log('✅ busca «1.5 kg» →', safe.test('Arroz 125 kg'), safe.test('Frijol 1.5 kg'));
console.log('✅ sin error →', new RegExp(RegExp.escape('mole (500 g'), 'i').test('Mole (500 g) de Oaxaca'));

// Una regex LITERAL mal escrita (/mole (500 g/) no lanza nada que puedas atrapar:
// es un error de sintaxis del script entero, que no llega a ejecutarse.
```
