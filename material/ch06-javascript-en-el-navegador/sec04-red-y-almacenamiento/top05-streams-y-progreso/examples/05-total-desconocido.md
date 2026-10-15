---
example_description: "Sin cabecera Content-Length (respuestas que se generan mientras se envían) el total es desconocido: headers.get() da null, Number(null) es 0 y el porcentaje sale Infinity. Hay que detectarlo y mostrar un progreso indeterminado con los bytes recibidos"
example_tags: "javascript|streams|progreso|content-length|chunked|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// ?length=no: el servidor no anuncia el tamaño (envío «por partes», como un
// informe que se genera mientras se descarga).
async function readAll(url, onChunk) {
  const response = await fetch(url);
  const header = response.headers.get('content-length');
  const reader = response.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) return received;
    received += value.byteLength;
    onChunk(received, header);
  }
}
const url = '/api/demo/stream?chunks=4&interval=100&size=512&length=no';

// 🐛 Suponer que siempre hay Content-Length.
console.log('🐛 sin comprobar el total:');
await readAll(url, (received, header) => {
  const total = Number(header); // Number(null) → 0
  console.log(`   Content-Length: ${header} | total: ${total} | progreso: ${Math.round((received / total) * 100)} %`);
});

// ✅ Sin total conocido, el progreso es «indeterminado»: se cuentan los bytes.
//    En un <progress>, eso es quitarle el atributo value (barra animada).
console.log('✅ comprobando el total:');
const received = await readAll(url, (bytes, header) => {
  const total = header === null ? null : Number(header);
  if (total) console.log(`   ${Math.round((bytes / total) * 100)} %`);
  else console.log(`   ${(bytes / 1024).toFixed(1)} KB recibidos (total desconocido)`);
});
console.log('✅ fin →', received, 'bytes');

// Content-Length también falta (o es null) en respuestas de otro origen que
// no la permiten leer, y miente cuando el servidor comprime (ejemplo
// siguiente). La barra debe aguantar los tres casos.
```
