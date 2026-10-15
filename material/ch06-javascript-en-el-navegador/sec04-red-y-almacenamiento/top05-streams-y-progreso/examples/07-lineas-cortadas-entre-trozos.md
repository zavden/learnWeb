---
example_description: "NDJSON (un JSON por línea) leído por trozos: los cortes de la red no respetan las líneas, así que JSON.parse de cada trozo falla con «Unterminated string» o «Unexpected token». La solución es un búfer: unir el texto, procesar solo las líneas completas y guardar la última, que puede estar a medias"
example_tags: "javascript|streams|ndjson|json|bufer|lineas|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Tres pedidos en NDJSON («newline-delimited JSON»): un objeto JSON por línea.
const orders = [
  { id: 'P-1001', customer: 'Lucía', total: 420 },
  { id: 'P-1002', customer: 'Andrés', total: 145 },
  { id: 'P-1003', customer: 'Rosa', total: 98 },
];
const bytes = new TextEncoder().encode(orders.map((order) => JSON.stringify(order)).join('\n') + '\n');

// La red parte por donde quiere: aquí, en cuatro trozos que cortan las líneas.
const cuts = [0, 30, 75, 120, bytes.length];
function orderStream() {
  return new ReadableStream({
    start(controller) {
      for (let index = 0; index < cuts.length - 1; index += 1) {
        controller.enqueue(bytes.slice(cuts[index], cuts[index + 1]));
      }
      controller.close();
    },
  });
}

// 🐛 Suponer que cada trozo trae líneas enteras.
console.log('🐛 cada trozo por separado:');
const decoder = new TextDecoder();
for await (const chunk of orderStream()) {
  for (const line of decoder.decode(chunk, { stream: true }).split('\n')) {
    if (line === '') continue;
    try {
      console.log('   ✅', JSON.parse(line).id);
    } catch (error) {
      console.log(`   ${error.name}: ${error.message}`);
    }
  }
}

// ✅ Un búfer: se añade cada trozo, se procesan las líneas COMPLETAS y la
//    última (sin \n todavía) se guarda para el trozo siguiente.
console.log('✅ con búfer:');
const lineDecoder = new TextDecoder();
let buffer = '';
for await (const chunk of orderStream()) {
  buffer += lineDecoder.decode(chunk, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop(); // lo que queda tras el último \n: quizá media línea
  for (const line of lines) {
    if (line !== '') console.log('   📦', JSON.parse(line));
  }
}
buffer += lineDecoder.decode();
if (buffer !== '') console.log('   📦', JSON.parse(buffer)); // una última línea sin \n final

// Es el mismo problema que el carácter partido del ejemplo 3, una capa más
// arriba: allí se partía un carácter entre trozos; aquí, una línea.
```
