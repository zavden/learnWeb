---
example_description: "Ejercicio: preparar textos para una red social contando grafemas, recortando sin romper emojis, creando slugs y quitando hashtags repetidos con Set"
example_tags: "javascript|ejercicio|strings|unicode|set|intl"
exercise: true
exercise_title: "Prepara textos para una red social"
exercise_instructions: "countGraphemes(text): cuenta lo que una persona ve como caracteres, con Intl.Segmenter || truncate(text, max): si el texto tiene más de max grafemas, devuelve los max − 1 primeros seguidos de '…'; si no, el texto tal cual || slugify(title): quita las tildes, pasa a minúsculas, sustituye todo lo que no sea a-z o 0-9 por '-' y no deja guiones repetidos ni en los extremos || uniqueHashtags(tags): normaliza cada hashtag (trim, NFC, minúsculas del español) y devuelve un array sin repetidos, en el orden de su primera aparición || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "[...segmenter.segment(text)] es un array de objetos con la propiedad segment || slice sobre el texto cuenta unidades UTF-16 y puede partir una bandera: recorta el array de grafemas y únelo con join('') || stripAccents ya está escrita: úsala al principio de slugify || Un carácter está entre a y z si ch >= 'a' && ch <= 'z' (y lo mismo con '0' y '9') || Para quitar guiones repetidos: split('-'), filter de los trozos vacíos y join('-') || [...new Set(array)] quita duplicados conservando el orden"
exercise_solution_example: 10-ej-textos-para-redes-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cuatro funciones para que todas las comprobaciones salgan ✓.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const graphemeSegmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });

function countGraphemes(text) {
  // TODO 1: usa graphemeSegmenter (no text.length, que cuenta unidades UTF-16)
  return text.length;
}

function truncate(text, max) {
  // TODO 2: si hay más de max grafemas → los max - 1 primeros + '…'
  return text;
}

// Ya escrita: quita las marcas combinables (tildes, diéresis, la virgulilla de la ñ).
// \p{M} es una expresión regular: «cualquier marca combinable».
function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function slugify(title) {
  // TODO 3: stripAccents → minúsculas → cada carácter que no sea a-z o 0-9 pasa a '-'
  // TODO 4: sin guiones repetidos ni al principio o al final
  return title;
}

function uniqueHashtags(tags) {
  // TODO 5: normaliza cada uno (trim, normalize, toLocaleLowerCase('es')) y quita repetidos
  return tags;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}

check("countGraphemes('hola') → 4", countGraphemes('hola'), 4);
check("countGraphemes('👍🏽') → 1", countGraphemes('👍🏽'), 1);
check("countGraphemes('Viajera 🇪🇸') → 9 (length es 12)", countGraphemes('Viajera 🇪🇸'), 9);

const post = 'Rumbo a Japón 🇯🇵🍣 ¡qué ganas!';
check('truncate(texto corto, 40) no cambia', truncate(post, 40), post);
check('truncate(post, 16) no parte la bandera', truncate(post, 16), 'Rumbo a Japón 🇯🇵…');
check('truncate(post, 16) mide 16 grafemas', countGraphemes(truncate(post, 16)), 16);

check("slugify('Café y Ñandú: ¡guía 2026!')", slugify('Café y Ñandú: ¡guía 2026!'), 'cafe-y-nandu-guia-2026');
check("slugify('  Hola   Mundo  ')", slugify('  Hola   Mundo  '), 'hola-mundo');
check("slugify('CSS & HTML')", slugify('CSS & HTML'), 'css-html');

// El último hashtag llega en NFD: «n» + virgulilla combinable (U+0303).
const rawTags = ['#CSS', ' #css', '#Diseño', '#diseño ', '#Accesibilidad', '#diseño'];
check('uniqueHashtags', JSON.stringify(uniqueHashtags(rawTags)), '["#css","#diseño","#accesibilidad"]');
```
