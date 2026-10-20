---
example_description: "TextDecoder no falla con bytes que no son UTF-8 válido: los cambia por U+FFFD (�) en silencio y el dato original se pierde; con { fatal: true } lanza un TypeError y se puede probar otra codificación"
example_tags: "javascript|python|textdecoder|utf-8|fatal|u+fffd|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un nombre de archivo que llega como «UTF-8»… pero se guardó en windows-1252:
// la «ó» es un solo byte, f3, que en UTF-8 no es válido por sí solo.
const upload = Uint8Array.of(0x43, 0x61, 0x6e, 0x63, 0x69, 0xf3, 0x6e); // «Canción»

// 🐛 Por defecto, TextDecoder NO falla: cambia cada secuencia inválida por U+FFFD (�)
//    y sigue. No hay error, ni aviso, y el byte original ya no se puede recuperar.
const text = new TextDecoder().decode(upload);
console.log('🐛 sin fatal →', text, '| ¿tiene �? →', text.includes('�'));

// ✅ { fatal: true }: el primer byte inválido lanza un TypeError.
const strictUtf8 = new TextDecoder('utf-8', { fatal: true });
try {
  strictUtf8.decode(upload);
} catch (error) {
  console.log('✅ con fatal →', error.name, '|', error.message);
}

// Estrategia típica con archivos de origen desconocido: UTF-8 estricto y, si falla,
// la codificación antigua más probable (en español, windows-1252).
function decodeUnknown(bytes) {
  try {
    return { encoding: 'utf-8', text: strictUtf8.decode(bytes) };
  } catch {
    return { encoding: 'windows-1252', text: new TextDecoder('windows-1252').decode(bytes) };
  }
}
console.log(decodeUnknown(upload));
console.log(decodeUnknown(new TextEncoder().encode('Canción')));

// El camino inverso también reemplaza en silencio: un sustituto suelto (medio emoji,
// lección «Strings») no se puede escribir en UTF-8 y TextEncoder escribe U+FFFD (ef bf bd).
console.log('medio emoji →', new TextEncoder().encode('😀'.slice(0, 1)));

// Python es estricto por defecto: b'Canci\xf3n'.decode('utf-8') lanza UnicodeDecodeError,
// y hay que pedir errors='replace' para obtener el �. JavaScript es al revés.
```
