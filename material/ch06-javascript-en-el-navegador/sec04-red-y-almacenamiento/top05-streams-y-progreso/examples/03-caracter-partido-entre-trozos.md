---
example_description: "Un carácter de varios bytes (é, ☕, 🍞) puede quedar partido entre dos trozos: decodificar cada trozo por separado produce � (U+FFFD). Un único TextDecoder con decode(chunk, { stream: true }) guarda los bytes sueltos hasta el trozo siguiente"
example_tags: "javascript|streams|textdecoder|utf-8|bytes|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// En UTF-8, «é» ocupa 2 bytes, «☕» 3 y «🍞» 4. Partimos el texto en trozos
// de 4 bytes, como podría partirlo la red, y lo servimos con un ReadableStream.
const text = 'Café de olla ☕ y pan de muerto 🍞';
const bytes = new TextEncoder().encode(text);
console.log('caracteres →', text.length, '| bytes →', bytes.length);

function streamOfChunks(size) {
  return new ReadableStream({
    start(controller) {
      for (let index = 0; index < bytes.length; index += size) {
        controller.enqueue(bytes.slice(index, index + size));
      }
      controller.close();
    },
  });
}

// 🐛 Un TextDecoder nuevo (o sin stream: true) para cada trozo: los bytes de
//    un carácter partido no forman nada válido y salen como �.
let broken = '';
for await (const chunk of streamOfChunks(4)) {
  broken += new TextDecoder().decode(chunk);
}
console.log('🐛 trozo a trozo →', broken);
console.log('🐛 caracteres � →', [...broken].filter((char) => char === '�').length);

// ✅ UN decoder para todo el flujo, con { stream: true }: si un trozo acaba a
//    mitad de un carácter, guarda esos bytes y los une al trozo siguiente.
const decoder = new TextDecoder();
let fixed = '';
for await (const chunk of streamOfChunks(4)) {
  fixed += decoder.decode(chunk, { stream: true });
}
fixed += decoder.decode(); // sin argumentos: «se acabó», suelta lo pendiente
console.log('✅ con stream: true →', fixed);
console.log('✅ ¿igual que el original? →', fixed === text);

// Con texto solo ASCII el fallo no aparece nunca (cada carácter es un byte):
// por eso pasa las pruebas en inglés y falla con «café».
```
