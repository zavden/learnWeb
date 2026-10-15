---
example_description: "Texto, bytes y codificaciones: por qué «ó» se convierte en «Ã³»"
example_tags: "charset|utf-8|bytes|textdecoder"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un archivo es una secuencia de BYTES. Para mostrar texto, el navegador necesita saber
// con qué codificación convertir bytes → caracteres. TextEncoder y TextDecoder
// (JavaScript, capítulo de datos binarios) hacen esa conversión a mano.

const text = 'Canción: ñandú 20 €';
const bytes = new TextEncoder().encode(text);  // texto → bytes en UTF-8

console.log('caracteres →', text.length);
console.log('bytes      →', bytes.length);     // ó, ñ y ú ocupan 2 bytes; € ocupa 3
// (esta línea solo escribe cada byte en hexadecimal)
console.log('en hex     →', Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' '));

// ✅ Leer los bytes con la codificación con la que se escribieron
console.log('leído como UTF-8        →', new TextDecoder('utf-8').decode(bytes));

// ❌ Leer los MISMOS bytes como windows-1252, lo que hace un navegador sin charset:
// cada byte es un carácter, así que C3 B3 («ó») se convierte en «Ã³»
console.log('leído como windows-1252 →', new TextDecoder('windows-1252').decode(bytes));

// ❌ Y al revés: «Canción» guardado en windows-1252 (la «ó» es UN byte, F3) leído como UTF-8.
// F3 no es UTF-8 válido por sí solo → carácter de sustitución �
const legacyBytes = new Uint8Array([0x43, 0x61, 0x6e, 0x63, 0x69, 0xf3, 0x6e]);
console.log('windows-1252 leído como UTF-8 →', new TextDecoder('utf-8').decode(legacyBytes));
```
