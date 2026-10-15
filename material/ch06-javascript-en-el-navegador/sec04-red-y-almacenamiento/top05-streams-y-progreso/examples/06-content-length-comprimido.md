---
example_description: "Cuando el servidor comprime (Content-Encoding: gzip), Content-Length cuenta los bytes COMPRIMIDOS, pero response.body entrega los descomprimidos: la barra pasa del 100 %. Se simula con CompressionStream y DecompressionStream, que hacen lo mismo que el servidor y el navegador"
example_tags: "javascript|streams|progreso|content-length|gzip|compressionstream|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un catálogo en JSON, muy repetitivo (como casi todo JSON): comprime muchísimo.
const products = Array.from({ length: 300 }, (_, index) => ({ sku: `CAF-${1000 + index}`, name: 'Café de Chiapas · 500 g', price: 210 }));
const catalog = new TextEncoder().encode(JSON.stringify(products));

// 1. Lo que hace el SERVIDOR con gzip: comprime el cuerpo y anuncia en
//    Content-Length el tamaño comprimido. (pipeThrough: ejemplo 8.)
const gzipped = await new Response(new Blob([catalog]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
const contentLength = gzipped.byteLength;

// 2. Lo que hace el NAVEGADOR: descomprime antes de dártelo. response.body
//    entrega bytes descomprimidos.
const body = new Blob([gzipped]).stream().pipeThrough(new DecompressionStream('gzip'));

// 🐛 La barra de siempre: recibido / Content-Length.
let received = 0;
let lastPercent = 0;
for await (const chunk of body) {
  received += chunk.byteLength;
  lastPercent = Math.round((received / contentLength) * 100);
}
console.log('Content-Length (comprimido) menor que 3 KB →', contentLength < 3 * 1024);
console.log('bytes recibidos (descomprimidos) →', received, '| igual que el original:', received === catalog.byteLength);
console.log('🐛 progreso final →', lastPercent > 100 ? 'más del 100 %' : `${lastPercent} %`);

// ✅ Si la respuesta dice Content-Encoding (gzip, br, zstd…), Content-Length
//    no sirve para el progreso: trata el total como desconocido (ejemplo
//    anterior) o haz que el servidor envíe el tamaño real en otra cabecera.
const response = new Response(gzipped, { headers: { 'Content-Encoding': 'gzip', 'Content-Length': String(contentLength) } });
const usable = response.headers.has('content-encoding') ? null : Number(response.headers.get('content-length'));
console.log('✅ total para la barra →', usable, '(desconocido: barra indeterminada)');
```
