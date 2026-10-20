---
example_description: "Solución: grafemas con Intl.Segmenter, recorte sin romper emojis, slugs carácter a carácter y hashtags únicos con normalize y Set"
example_tags: "javascript|solucion|strings|unicode|set|intl"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: textos para una red social.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const graphemeSegmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });

// Array con un string por grafema: ['R', 'u', …, '🇯🇵', '🍣', …].
function graphemesOf(text) {
  return [...graphemeSegmenter.segment(text)].map((part) => part.segment);
}

function countGraphemes(text) {
  return graphemesOf(text).length;
}

function truncate(text, max) {
  const graphemes = graphemesOf(text);
  if (graphemes.length <= max) {
    return text;
  }
  // Se recorta el ARRAY de grafemas: text.slice(0, 15) partiría la bandera por la mitad.
  return graphemes.slice(0, max - 1).join('') + '…';
}

// Ya escrita: quita las marcas combinables (tildes, diéresis, la virgulilla de la ñ).
// \p{M} es una expresión regular: «cualquier marca combinable».
function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function slugify(title) {
  let slug = '';
  for (const ch of stripAccents(title).toLowerCase()) {
    const isLetter = ch >= 'a' && ch <= 'z';
    const isDigit = ch >= '0' && ch <= '9';
    slug += isLetter || isDigit ? ch : '-';
  }
  // 'cafe-y-nandu---guia-2026-' → trozos sin vacíos → 'cafe-y-nandu-guia-2026'
  return slug.split('-').filter((part) => part !== '').join('-');
}

function uniqueHashtags(tags) {
  const normalized = tags.map((tag) => tag.trim().normalize().toLocaleLowerCase('es'));
  return [...new Set(normalized)]; // Set: sin repetidos y en orden de primera aparición
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
