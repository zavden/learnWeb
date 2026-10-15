---
example_description: "for…of y [...texto] recorren code points; el for clásico, split('') e invertir con reverse parten los emojis"
example_tags: "javascript|python|strings|unicode|for-of|code-points"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const text = 'Sí 👍';

// El for clásico recorre UNIDADES UTF-16: el emoji sale partido en dos (� �).
for (let i = 0; i < text.length; i++) {
  console.log(`for clásico [${i}] →`, text[i]);
}

// ✅ for…of recorre CODE POINTS (caracteres Unicode completos), como el for de Python.
for (const char of text) {
  const code = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  console.log('for…of →', char, `U+${code}`);
}

// El spread [...texto] (y Array.from(texto)) también trocea por code points;
// split('') trocea por unidades.
console.log('[...text] →', [...text]);                     // ['S', 'í', ' ', '👍']
console.log("text.split('') →", text.split(''));           // el emoji, en dos mitades
console.log('code points →', [...text].length, '| length →', text.length); // 4 | 5

// Invertir un texto: el truco split('').reverse().join('') rompe los emojis.
// (reverse y join son métodos de array: lección «Arrays».)
console.log('🐛 invertido →', text.split('').reverse().join('')); // '�� íS'
console.log('✅ invertido →', [...text].reverse().join(''));      // '👍 íS'

// De code point a carácter y al revés (chr() y ord() de Python):
console.log('String.fromCodePoint(0x1F40D) →', String.fromCodePoint(0x1f40d)); // '🐍'
console.log("'🐍'.codePointAt(0) →", '🐍'.codePointAt(0));                    // 128013
console.log("'\\u{1F40D}' →", '\u{1F40D}'); // la misma serpiente, escrita con un escape
```
