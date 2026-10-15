---
example_description: "Clases de caracteres (\\d, \\w, \\s, ., [ ], [^ ]) y su trampa: \\w y \\b solo conocen el ASCII, así que «Begoña» no es una palabra; \\p{L} con el flag u (o v) sí conoce todas las letras, y v exige escapar el guion dentro de [ ]"
example_tags: "javascript|regex|clases|unicode|flag-u|flag-v|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Clases: \d una cifra, \w un «carácter de palabra», \s un espacio en blanco,
// . cualquiera menos el salto de línea, [aeiou] una de esas, [^@\s] cualquiera menos esas.
console.log('CP →', /^\d{5}$/.test('50001'), '| correo →', /^[^@\s]+@[^@\s]+$/.test('ana@huerta.example'));

// 🐛 \w es SOLO ASCII: [A-Za-z0-9_]. Las tildes, la diéresis y la ñ no cuentan.
const names = ['Ana', 'Lucía', 'Begoña', 'Zoë', 'Ana-María'];
console.log('🐛 /^[\\w-]+$/ →', names.map((name) => /^[\w-]+$/.test(name)));
console.log('🐛 palabras →', 'El año pasado vendimos más café'.match(/\w+/g));
// 🐛 \b (frontera de palabra) usa la misma definición: entre «é» y «,» no ve frontera.
console.log('🐛 /\\bcafé\\b/ →', /\bcafé\b/.test('Un café, por favor'));

// ✅ \p{L} es «cualquier letra de cualquier alfabeto». Necesita el flag u (o v).
console.log('✅ /^[\\p{L}-]+$/u →', names.map((name) => /^[\p{L}-]+$/u.test(name)));
console.log('✅ palabras →', 'El año pasado vendimos más café'.match(/\p{L}+/gu));
// 🐛 Sin u, \p{L} no es una clase: significa «p{L}», letra a letra, sin avisar.
console.log('🐛 /\\p{L}/ sin u →', /\p{L}/.test('ñ'), /\p{L}/.test('p{L}'));
// u también hace que . y las clases cuenten code points (lección «Strings»).
console.log('. con un emoji →', /^.$/.test('🌮'), /^.$/u.test('🌮'));

// v es la versión moderna de u (la que usa el atributo pattern de HTML). Añade
// operaciones de conjuntos, como «letras menos las ASCII»…
console.log('v: letra no ASCII →', /^[\p{L}--[a-zA-Z]]$/v.test('ñ'), /^[\p{L}--[a-zA-Z]]$/v.test('n'));
// …y es más estricta: dentro de [ ] hay que escapar ( ) [ ] { } / - \ |
// (por eso el pattern="[a-z0-9_-]" del capítulo de HTML dejó de funcionar).
try {
  new RegExp('^[\\p{L}-]+$', 'v');
} catch (error) {
  console.log('🐛 con v →', error.message);
}
console.log('✅ con v y \\- →', names.map((name) => /^[\p{L}\-]+$/v.test(name)));
```
