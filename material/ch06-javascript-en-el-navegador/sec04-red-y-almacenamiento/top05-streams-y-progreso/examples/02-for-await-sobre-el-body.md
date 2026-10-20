---
example_description: "En Chrome, un ReadableStream es un iterable asíncrono: for await (const chunk of response.body) recorre los trozos sin reader ni done; salir con break cancela el flujo y la descarga se detiene"
example_tags: "javascript|streams|for-await|readablestream|cancelar|fetch"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// 10 trozos, uno cada 150 ms (1,35 s en total). Solo queremos los 3 primeros.
const response = await fetch('/api/demo/stream?chunks=10&interval=150&size=64');
const decoder = new TextDecoder();
const start = performance.now();

let count = 0;
for await (const chunk of response.body) { // como el reader del ejemplo anterior
  count += 1;
  console.log(`trozo ${count} →`, decoder.decode(chunk).slice(0, 14));
  if (count === 3) break; // salir del bucle CANCELA el flujo
}

const elapsed = performance.now() - start;
console.log('¿terminó antes de 1 s (no esperó a los otros 7)? →', elapsed < 1000);
console.log('¿se puede volver a leer? →', !response.bodyUsed);

// for await…of (lección «async/await») funciona con cualquier iterable
// asíncrono, y un ReadableStream lo es en Chrome (desde 2024). Al salir con
// break, return o un error, el bucle llama a cancel() en el flujo: el
// navegador cierra la conexión y el servidor deja de enviar.
```
