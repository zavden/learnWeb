---
example_description: "Una tubería de flujos: response.body → TextDecoderStream (bytes a texto, sin partir caracteres) → un TransformStream propio que corta líneas con búfer → for await de objetos NDJSON que llegan del servidor de prueba uno a uno"
example_tags: "javascript|streams|pipethrough|textdecoderstream|transformstream|ndjson"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un TransformStream recibe trozos por un lado y entrega otros por el otro.
// Este es el búfer del ejemplo anterior, convertido en una pieza reutilizable.
function splitLines() {
  let buffer = '';
  return new TransformStream({
    transform(text, controller) {        // por cada trozo de texto que entra…
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (line !== '') controller.enqueue(line); // …salen 0, 1 o varias líneas
      }
    },
    flush(controller) {                  // al cerrarse la entrada
      if (buffer !== '') controller.enqueue(buffer);
    },
  });
}

// El servidor de prueba envía 5 pedidos en NDJSON, uno cada 150 ms.
const response = await fetch('/api/demo/stream?format=ndjson&chunks=5&interval=150');
console.log('Content-Type →', response.headers.get('content-type'));

// bytes ──TextDecoderStream──► texto ──splitLines──► líneas
const lines = response.body
  .pipeThrough(new TextDecoderStream()) // un TextDecoder con stream: true, en forma de flujo
  .pipeThrough(splitLines());

const start = performance.now();
const arrivals = [];
for await (const line of lines) {
  const item = JSON.parse(line);
  arrivals.push(performance.now() - start);
  console.log(`📦 ${item.n}/${item.of} · ${item.text}`);
}
console.log('¿llegaron poco a poco? → primero antes de 100 ms:', arrivals[0] < 100, '| último tras 500 ms:', arrivals.at(-1) >= 500);

// Cada etapa trabaja con lo que le llega, sin esperar al final: la página
// puede pintar el pedido 1 mientras el servidor aún prepara el 5. Así
// llegan los resultados de búsqueda «en vivo» o las respuestas de un modelo
// de lenguaje que se escriben palabra a palabra.
```
