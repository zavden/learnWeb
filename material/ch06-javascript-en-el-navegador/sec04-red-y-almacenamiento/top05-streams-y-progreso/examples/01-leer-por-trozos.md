---
example_description: "response.body es un ReadableStream: con getReader() y un bucle de read() se reciben los trozos (Uint8Array) a medida que llegan, con { done, value }, en vez de esperar al cuerpo entero como text() o json()"
example_tags: "javascript|streams|readablestream|getreader|fetch|bytes"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El servidor de prueba envía 5 trozos de 1024 bytes: uno enseguida y después
// uno cada 200 ms. text() esperaría al final; aquí leemos cada trozo al llegar.
const response = await fetch('/api/demo/stream?chunks=5&interval=200&size=1024');
console.log('status →', response.status, '| Content-Length →', response.headers.get('content-length'));

const reader = response.body.getReader(); // bloquea el flujo: ahora solo lee este reader
console.log('¿flujo bloqueado? →', response.body.locked);

const start = performance.now();
let received = 0;
let count = 0;
while (true) {
  const { done, value } = await reader.read(); // espera al siguiente trozo
  if (done) break;                              // el flujo terminó
  count += 1;
  received += value.byteLength;
  if (count === 1) {
    console.log('cada trozo es un', value.constructor.name, '→ empieza por', JSON.stringify(new TextDecoder().decode(value.subarray(0, 13))));
  }
  console.log(`trozo ${count}: ${value.byteLength} bytes (llevamos ${received})`);
}
console.log(`fin → ${received} bytes en ${count} trozos | tardó 800 ms o más: ${performance.now() - start >= 800}`);

// Los trozos que recibes no tienen por qué coincidir con los que envió el
// servidor: la red puede partirlos o juntarlos. Aquí, con 200 ms entre uno y
// otro, suelen llegar tal cual. Un Uint8Array es una lista de bytes (0-255):
// los datos binarios se estudian en el capítulo 8.
```
