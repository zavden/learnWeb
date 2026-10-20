---
example_description: "subarray() no copia: devuelve otra vista sobre la misma memoria, así que «cifrar una copia» cambia también el mensaje original; slice() sí copia los bytes"
example_tags: "javascript|python|typed-arrays|subarray|slice|memoria|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un mensaje binario: 2 bytes de cabecera (tipo y longitud) + 5 bytes de contenido.
const message = Uint8Array.of(1, 5, 72, 111, 108, 97, 33); // tipo 1, longitud 5, «Hola!»
const text = (bytes) => String.fromCharCode(...bytes);      // vale para texto ASCII
console.log('contenido →', text(message.subarray(2)));      // 'Hola!'

// Queremos enviar el contenido ofuscado con XOR, SIN tocar el mensaje original.
// 🐛 subarray parece copiar el trozo, pero devuelve otra VISTA de la misma memoria.
const payload = message.subarray(2);
for (let index = 0; index < payload.length; index += 1) {
  payload[index] ^= 0x2a;
}
console.log('payload →', payload);
console.log('🐛 el original →', message); // ¡el original también está ofuscado!
console.log('¿mismo búfer? →', payload.buffer === message.buffer, '| byteOffset →', payload.byteOffset); // true | 2

// ✅ slice copia los bytes a un búfer nuevo: los cambios no se propagan.
const original = Uint8Array.of(1, 5, 72, 111, 108, 97, 33);
const copy = original.slice(2);
for (let index = 0; index < copy.length; index += 1) {
  copy[index] ^= 0x2a;
}
console.log('✅ el original →', original);
console.log('¿mismo búfer? →', copy.buffer === original.buffer, '| byteOffset →', copy.byteOffset); // false | 0

// Por qué existe subarray: no copia nada, así que es instantáneo con 100 MB.
// Úsalo para LEER un trozo; usa slice cuando vayas a modificarlo o a guardarlo.
// Python: datos[2:] copia (como slice); memoryview(datos)[2:] comparte (como subarray).
```
