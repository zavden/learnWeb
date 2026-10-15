---
example_description: "'😀'.length es 2: los strings son unidades UTF-16 y los emojis ocupan dos (pares sustitutos)"
example_tags: "javascript|python|strings|unicode|utf-16|emoji|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Por dentro, un string es una secuencia de UNIDADES UTF-16 (números de 16 bits).
// Casi todos los caracteres ocupan una; los que están por encima de U+FFFF
// (emojis, muchos símbolos) ocupan DOS: un «par sustituto» (surrogate pair).
console.log("'hola'.length →", 'hola'.length);   // 4
console.log("'ñandú'.length →", 'ñandú'.length); // 5: ñ y ú caben en una unidad

// 🐛 length cuenta unidades UTF-16, no caracteres.
const emoji = '😀';
console.log("'😀'.length →", emoji.length); // 2 (en Python, len('😀') es 1)

// 🐛 Los índices también: emoji[0] es MEDIO emoji, un sustituto suelto.
console.log('emoji[0] →', emoji[0]); // '\ud83d': se pinta como �
console.log('charCodeAt(0) →', emoji.charCodeAt(0).toString(16)); // 'd83d'
console.log('charCodeAt(1) →', emoji.charCodeAt(1).toString(16)); // 'de00'
// ✅ codePointAt lee el carácter completo (su code point de Unicode).
console.log('codePointAt(0) →', emoji.codePointAt(0).toString(16)); // '1f600' → U+1F600

// 🐛 slice corta por unidades y puede partir un emoji por la mitad:
const message = '¡Hecho! 😀 Gracias';
const preview = message.slice(0, 9);
console.log('slice(0, 9) →', preview);                  // '¡Hecho! �'
console.log('isWellFormed() →', preview.isWellFormed()); // false: quedó un sustituto suelto

// ✅ Corta por code points: [...texto] lo convierte en un array de caracteres
// (ejemplo siguiente) y join lo vuelve a unir.
console.log('✅ por code points →', [...message].slice(0, 9).join('')); // '¡Hecho! 😀'

// Un límite de «10 caracteres» comprobado con length rechaza textos que se ven cortos:
const nickname = '🐍🐍🐍🐍🐍🐍';
console.log('length →', nickname.length, '| code points →', [...nickname].length); // 12 | 6
```
