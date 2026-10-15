---
example_description: "Frecuencia de palabras de unas reseñas: normalize, Intl.Segmenter, un Map como contador y por qué un objeto falla con la palabra «constructor»"
example_tags: "javascript|integracion|strings|map|set|unicode"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// FRECUENCIA DE PALABRAS en las reseñas de una empresa de reformas.
// Integra: normalize, toLocaleLowerCase e Intl.Segmenter («Strings»), Map y Set
// («Map y Set»), toSorted con comparador y localeCompare («Arrays»).

const reviews = [
  'El constructor entregó la casa a tiempo. La casa es luminosa y la cocina… ¡enorme!',
  'Volvería a contratar al constructor. CASA recomendable, con un jardín precioso.',
  // Esta reseña se copió de un PDF: la «í» llega descompuesta (i + tilde combinable, NFD).
  'Jardín cuidado y cocina impecable. El constructor cumplió.',
];

// 1. Normalizar AL RECIBIR: NFC une la «i + tilde» y las minúsculas igualan «CASA» y «casa».
const text = reviews.join(' ').normalize().toLocaleLowerCase('es');

// 2. Partir en palabras con Intl.Segmenter: ignora la puntuación (¡, …, .) sin regex.
const segmenter = new Intl.Segmenter('es', { granularity: 'word' });
const words = [];
for (const part of segmenter.segment(text)) {
  if (part.isWordLike) words.push(part.segment);
}
console.log('palabras →', words.length);

// 3. 🐛 Contar con un OBJETO: hereda propiedades como «constructor» de Object.prototype.
const counts = {};
for (const word of words) {
  counts[word] = (counts[word] ?? 0) + 1; // counts['constructor'] ya existe: es una función
}
console.log('🐛 objeto: casa →', counts.casa);
console.log('🐛 objeto: constructor →', counts.constructor); // función + 1 + 1 + 1 = texto

// 4. ✅ Contar con un Map: empieza vacío de verdad y la clave no se convierte.
const STOP_WORDS = new Set(['el', 'la', 'a', 'al', 'y', 'es', 'un', 'con']);
const frequencies = new Map();
let skipped = 0;
for (const word of words) {
  if (STOP_WORDS.has(word)) { // has de un Set: sin recorrer la lista
    skipped++;
    continue;
  }
  frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
}
console.log('✅ Map: constructor →', frequencies.get('constructor'));
console.log('✅ Map: jardín →', frequencies.get('jardín'), '(las dos formas, unidas por normalize)');

// 5. Ordenar: primero por frecuencia (b - a) y, si empatan (0 es falsy), alfabéticamente.
const ranking = [...frequencies].toSorted(
  ([wordA, countA], [wordB, countB]) => countB - countA || wordA.localeCompare(wordB, 'es'),
);
// ({ … }) va entre paréntesis para que la flecha DEVUELVA un objeto («Funciones y ámbito»).
console.table(ranking.slice(0, 6).map(([word, count]) => ({ palabra: word, veces: count })));
console.log(`distintas: ${frequencies.size} · palabras vacías descartadas: ${skipped}`);
```
