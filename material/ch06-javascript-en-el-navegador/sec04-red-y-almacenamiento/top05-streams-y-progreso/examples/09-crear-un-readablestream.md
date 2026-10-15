---
example_description: "Crear un ReadableStream propio: start() prepara, pull() produce un trozo cada vez que el lector pide más (generación perezosa) y close() termina; new Response(stream) le da al flujo los métodos text(), json() y blob() de una respuesta de red"
example_tags: "javascript|streams|readablestream|pull|response|csv"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un informe CSV de ventas que se genera fila a fila, solo cuando alguien lee.
const SALES = [
  ['2026-10-12', 'Café de Chiapas · 500 g', 14],
  ['2026-10-12', 'Cacao de Tabasco · 250 g', 6],
  ['2026-10-13', 'Café de Chiapas · 500 g', 9],
  ['2026-10-13', 'Vainilla de Papantla', 3],
];

function salesReport() {
  const encoder = new TextEncoder();
  let row = 0;
  let pulls = 0;
  return new ReadableStream({
    start(controller) {        // una vez, al crear el flujo
      controller.enqueue(encoder.encode('fecha,producto,unidades\n'));
    },
    pull(controller) {         // cada vez que el lector necesita más
      pulls += 1;
      if (row === SALES.length) {
        console.log(`   (pull ${pulls}: no quedan filas → close)`);
        controller.close();
        return;
      }
      const [date, product, units] = SALES[row];
      row += 1;
      console.log(`   (pull ${pulls}: genero la fila ${row})`);
      controller.enqueue(encoder.encode(`${date},"${product}",${units}\n`));
    },
  });
}

// new Response(flujo) envuelve cualquier ReadableStream: tiene text(), json(),
// blob()… igual que una respuesta de fetch.
console.log('▶ text() lee el flujo entero:');
const csv = await new Response(salesReport(), { headers: { 'Content-Type': 'text/csv' } }).text();
console.log(csv.trimEnd());

// Con un reader, el flujo genera solo lo que se le pide, más un trozo de
// reserva (highWaterMark: 1). Leemos dos trozos y cancelamos: la fila 2 se
// generó por adelantado, pero la 3 y la 4 no se generan nunca.
console.log('▶ dos lecturas y cancel():');
const reader = salesReport().getReader();
const decoder = new TextDecoder();
console.log('   →', decoder.decode((await reader.read()).value).trimEnd());
console.log('   →', decoder.decode((await reader.read()).value).trimEnd());
await reader.cancel();

// Un Blob con el informe completo, listo para descargar (capítulo 8).
console.log('▶ blob():');
const blob = await new Response(salesReport()).blob();
console.log('   tamaño →', blob.size, 'bytes');
```
