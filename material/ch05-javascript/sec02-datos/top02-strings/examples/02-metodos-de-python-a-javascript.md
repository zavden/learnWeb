---
example_description: "Los métodos de string más usados, con su equivalente de Python al lado y su resultado"
example_tags: "javascript|python|strings|metodos|chuleta"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Ningún método modifica el string: todos devuelven un valor NUEVO.
const raw = '  Guía de JavaScript para Pythonistas  ';
const title = raw.trim(); // strip()
console.log('trim →', `«${title}»`);

// Cada fila: Python → JavaScript → resultado con este título.
console.table({
  'len(s)':               { javascript: 's.length',             result: title.length },
  's.upper()':            { javascript: 's.toUpperCase()',      result: title.toUpperCase() },
  's.lower()':            { javascript: 's.toLowerCase()',      result: title.toLowerCase() },
  "'Java' in s":          { javascript: "s.includes('Java')",   result: title.includes('Java') },
  "s.startswith('Guía')": { javascript: "s.startsWith('Guía')", result: title.startsWith('Guía') },
  "s.endswith('tas')":    { javascript: "s.endsWith('tas')",    result: title.endsWith('tas') },
  "s.find('Script')":     { javascript: "s.indexOf('Script')",  result: title.indexOf('Script') },
  "s.find('Rust')":       { javascript: "s.indexOf('Rust')",    result: title.indexOf('Rust') },
  "s.count('a')":         { javascript: "s.split('a').length - 1", result: title.split('a').length - 1 },
  's[0]':                 { javascript: 's[0]',                 result: title[0] },
  's[-1]':                { javascript: 's.at(-1)',             result: title.at(-1) },
  's[0:4]':               { javascript: 's.slice(0, 4)',        result: title.slice(0, 4) },
  's[-10:]':              { javascript: 's.slice(-10)',         result: title.slice(-10) },
});

// split devuelve un array; join es un método del ARRAY (al revés que en Python).
const words = title.split(' ');
console.log("split(' ') →", words);              // s.split(' ')
console.log("join(' · ') →", words.join(' · ')); // ' · '.join(words)

// Reemplazar, repetir y rellenar:
console.log("replaceAll(' ', '_') →", title.replaceAll(' ', '_')); // s.replace(' ', '_')
console.log("'=-'.repeat(8) →", '=-'.repeat(8));                    // '=-' * 8
console.log("'42'.padStart(6, '0') →", '42'.padStart(6, '0'));      // '42'.zfill(6)
console.log("trimStart / trimEnd →", `«${raw.trimStart()}»`, `«${raw.trimEnd()}»`); // lstrip / rstrip
```
