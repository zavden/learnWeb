---
example_description: "TextEncoder convierte texto en bytes UTF-8: «a» ocupa 1 byte, «ñ» 2, «€» 3 y «🎸» 4 (aunque su length sea 2); los bits de la «ñ» muestran cómo reparte UTF-8 un código entre varios bytes"
example_tags: "javascript|python|textencoder|utf-8|utf-16|bytes|unicode"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// TextEncoder: texto → bytes. Siempre en UTF-8 (no admite otra codificación).
const encoder = new TextEncoder();
console.log('encoding →', encoder.encoding); // 'utf-8'

// length cuenta unidades UTF-16 (lección «Strings»); los bytes UTF-8 son otra cuenta.
for (const char of ['a', 'ñ', '€', '🎸']) {
  const code = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  const bytes = encoder.encode(char);
  console.log(`${char}  U+${code}  length ${char.length}  →  ${bytes.length} ${bytes.length === 1 ? 'byte' : 'bytes'}: ${hex(bytes)}`);
}

// Cómo reparte UTF-8 un carácter: los primeros bits de cada byte dicen su papel.
//   0xxxxxxx                              1 byte  (ASCII: hasta U+007F)
//   110xxxxx 10xxxxxx                     2 bytes (hasta U+07FF: ñ, á, ü…)
//   1110xxxx 10xxxxxx 10xxxxxx            3 bytes (hasta U+FFFF: €, ☕…)
//   11110xxx 10xxxxxx 10xxxxxx 10xxxxxx   4 bytes (el resto: emojis)
const [first, second] = encoder.encode('ñ');
console.log('ñ en bits →', first.toString(2), second.toString(2)); // 110|00011 10|110001
console.log('U+00F1 en bits →', (0xf1).toString(2).padStart(11, '0')); // 00011 + 110001: los «x» de arriba

// Un texto entero: los caracteres que se ven, las unidades UTF-16 y los bytes no coinciden.
const review = 'Café de olla ☕ en Coyoacán 🎸';
console.log('code points →', [...review].length, '| length →', review.length, '| bytes UTF-8 →', encoder.encode(review).length);

// encode() devuelve un Uint8Array nuevo cada vez (con su propio ArrayBuffer):
console.log(encoder.encode('olé'));
// Python: 'ñ'.encode('utf-8') → b'\xc3\xb1'; len() de esos bytes → 2.
```
