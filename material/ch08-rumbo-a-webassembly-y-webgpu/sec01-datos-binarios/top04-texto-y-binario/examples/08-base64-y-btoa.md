---
example_description: "base64 escribe bytes con 64 caracteres (3 bytes → 4, un 33 % más); btoa recibe una «cadena binaria» Latin-1: con «€» lanza InvalidCharacterError y con «ñandú» no falla pero codifica Latin-1 en vez de UTF-8; el camino correcto pasa por TextEncoder, o por toBase64/fromBase64 en Chrome"
example_tags: "javascript|python|base64|btoa|atob|utf-8|tobase64|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const encoder = new TextEncoder();

// base64 escribe BYTES con 64 caracteres seguros (A-Z, a-z, 0-9, + y /): cada grupo de
// 3 bytes (24 bits) se convierte en 4 caracteres de 6 bits. Si sobran bytes, se rellena con =.
console.log("btoa('Hola') →", btoa('Hola')); // 4 bytes → 8 caracteres

// 🐛 1. btoa no recibe texto, sino una «cadena binaria»: un carácter por byte (0-255).
//    Un carácter por encima de U+00FF (€, emojis, chino…) lanza un error:
try {
  btoa('Pago: 20 €');
} catch (error) {
  console.log('🐛 btoa con € →', error.name, '|', error.message);
}

// 🐛 2. Peor: «ñ» (U+00F1) y «ú» (U+00FA) caben en un byte, así que btoa NO falla…
//    pero codifica Latin-1, no UTF-8. Quien lo lea como UTF-8 (casi todo el mundo) lee basura:
const latin1 = btoa('ñandú');
console.log("🐛 btoa('ñandú') →", latin1);
const latin1Bytes = Uint8Array.from(atob(latin1), (char) => char.charCodeAt(0));
console.log('🐛 leído como UTF-8 →', new TextDecoder().decode(latin1Bytes));

// ✅ El camino correcto pasa por los bytes: texto → UTF-8 → cadena binaria → btoa.
function textToBase64(text) {
  const bytes = encoder.encode(text);
  return btoa(String.fromCharCode(...bytes)); // (con varios MB, mejor por trozos)
}
function base64ToText(base64) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
const encoded = textToBase64('ñandú 🎸 20 €');
console.log('✅ textToBase64 →', encoded);
console.log('✅ base64ToText →', base64ToText(encoded));

// ✅ En Chrome (desde 2025), Uint8Array lo hace sin cadenas binarias, y también hex:
const bytes = encoder.encode('ñandú');
console.log('toBase64() →', bytes.toBase64());
console.log('fromBase64() →', Uint8Array.fromBase64('w7FhbmTDug=='));
console.log('toHex() →', bytes.toHex(), '| fromHex() →', Uint8Array.fromHex('c3b1'));

// El precio: base64 ocupa 4/3 de los bytes originales (un 33 % más).
console.log('bytes →', bytes.length, '| caracteres base64 →', bytes.toBase64().length);
// Python: base64.b64encode('ñandú'.encode('utf-8')) → b'w7FhbmTDug=='. Allí no hay trampa:
// b64encode solo acepta bytes, así que te obliga a elegir la codificación.
```
