---
example_description: "Un «carácter» visible puede ser varios code points: Intl.Segmenter cuenta grafemas y separa palabras"
example_tags: "javascript|python|strings|unicode|grafemas|intl|segmenter"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Ni siquiera un code point es siempre «un carácter» para una persona.
// Muchos emojis y letras son VARIOS code points unidos:
const samples = {
  'pulgar con tono de piel': '👍🏽',  // 👍 + modificador de tono
  'familia': '👨‍👩‍👧',               // 👨 + unión + 👩 + unión + 👧
  'bandera': '🇪🇸',                  // dos «letras regionales»: E + S
  'é descompuesta': 'é',       // e + tilde combinable
};

// Lo que una persona llama carácter es un GRAFEMA (grapheme cluster).
// Intl.Segmenter divide un texto en grafemas siguiendo las reglas de Unicode.
const graphemes = new Intl.Segmenter('es', { granularity: 'grapheme' });
// (function se estudia en «Funciones y ámbito».)
function countGraphemes(text) {
  return [...graphemes.segment(text)].length;
}

const table = {};
for (const [name, sample] of Object.entries(samples)) {
  table[name] = { texto: sample, length: sample.length, codePoints: [...sample].length, grafemas: countGraphemes(sample) };
}
console.table(table);
// (Object.entries y la desestructuración [name, sample]: lección «Objetos literales».)

// Uso real: el contador de un campo «bio» con un máximo de 20 caracteres.
const bio = 'Viajera 🇪🇸🇯🇵 y madre 👩‍👧';
console.log('length →', bio.length);              // 30: rechazaría la bio
console.log('code points →', [...bio].length);    // 24: también
console.log('grafemas →', countGraphemes(bio));   // 20: lo que la persona ve

// Segmenter también separa PALABRAS, sin signos de puntuación ni espacios
// (y funciona en idiomas sin espacios, como el japonés o el tailandés).
const wordSegmenter = new Intl.Segmenter('es', { granularity: 'word' });
const words = [];
for (const part of wordSegmenter.segment('¡Hola, mundo! ¿Qué tal?')) {
  if (part.isWordLike) words.push(part.segment);
}
console.log('palabras →', words); // ['Hola', 'mundo', 'Qué', 'tal']

// En Python, len() cuenta code points (len('👨‍👩‍👧') es 5); para grafemas hace
// falta una librería externa (regex con \X, o grapheme).
```
