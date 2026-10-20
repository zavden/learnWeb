---
example_description: "Otros transferibles: la página transfiere al worker el ReadableStream del cuerpo de una respuesta de fetch (un CSV de 1200 ventas) y el worker lo lee trozo a trozo, con TextDecoderStream, mientras llega; el stream de la página queda bloqueado"
example_tags: "javascript|workers|transferibles|streams|readablestream|fetch|csv"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// El worker lee un CSV directamente del stream (lección «Streams y progreso»):
// junta los trozos en líneas y suma las ventas por ciudad.
const code = `
  self.onmessage = async (event) => {
    const text = event.data.pipeThrough(new TextDecoderStream()); // bytes → texto
    const totals = new Map();
    let rows = -1; // la primera línea es la cabecera
    let rest = '';
    const addLine = (line) => {
      rows += 1;
      if (rows === 0) return;
      const [, city, , , amount] = line.split(','); // date,city,product,units,amount
      totals.set(city, (totals.get(city) ?? 0) + Number(amount));
    };
    for await (const chunk of text) {
      const lines = (rest + chunk).split('\\n');
      rest = lines.pop(); // la última puede venir cortada: se completa con el trozo siguiente
      lines.forEach(addLine);
    }
    if (rest) addLine(rest);
    self.postMessage({ rows, totals: [...totals] });
  };
`;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);

const response = await fetch('06-stream/sales.csv'); // 1200 ventas, unos 55 KB (en «Assets»)
// El cuerpo es un ReadableStream, y los streams son transferibles: el worker lo
// leerá mientras llega, y los bytes no pasan por el hilo principal.
worker.postMessage(response.body, [response.body]);
console.log('¿el stream de la página está bloqueado? →', response.body.locked);

worker.onmessage = (event) => {
  const { rows, totals } = event.data;
  const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  console.log(`worker: ${rows} ventas leídas del stream`);
  for (const [city, total] of totals.sort((a, b) => b[1] - a[1])) console.log(`  ${city} → ${formatMXN(total)}`);
  worker.terminate();
};
```
