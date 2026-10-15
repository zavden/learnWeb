---
example_description: "Un protocolo binario de ida y vuelta: la telemetría de un tostador de café con cabecera mágica, versión, fecha uint32, textos UTF-8 con su longitud delante y temperaturas float32; se codifica con DataView y TextEncoder, se decodifica con un cursor y se compara su tamaño con JSON"
example_tags: "javascript|protocolo|dataview|textencoder|float32|cursor|json|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Formato «TS1» (todo en little-endian):
//   'T' 'S'          firma (2 bytes)            u8   versión (1)
//   u32  fecha (segundos desde 1970)
//   u8 + bytes       nombre del tostador (UTF-8, longitud delante)
//   u8 + bytes       lote (UTF-8, longitud delante)
//   u16  número de lecturas      f32 × n  temperaturas en °C
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function encodeTelemetry({ date, roaster, batch, temperatures }) {
  const roasterBytes = encoder.encode(roaster);
  const batchBytes = encoder.encode(batch);
  if (roasterBytes.length > 255 || batchBytes.length > 255) throw new RangeError('texto de más de 255 bytes');
  const size = 3 + 4 + 1 + roasterBytes.length + 1 + batchBytes.length + 2 + 4 * temperatures.length;
  const bytes = new Uint8Array(size); // primero se calcula el tamaño exacto, luego se escribe
  const view = new DataView(bytes.buffer);
  let at = 0;
  bytes.set([0x54, 0x53, 1]); at += 3;                        // 'T', 'S', versión 1
  view.setUint32(at, Math.floor(date / 1000), true); at += 4;
  for (const text of [roasterBytes, batchBytes]) {
    view.setUint8(at, text.length); at += 1;
    bytes.set(text, at); at += text.length;
  }
  view.setUint16(at, temperatures.length, true); at += 2;
  for (const value of temperatures) { view.setFloat32(at, value, true); at += 4; }
  return bytes;
}

function decodeTelemetry(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 0;
  const take = (size) => {
    if (at + size > bytes.length) throw new RangeError(`mensaje cortado: faltan bytes en la posición ${at}`);
    const start = at;
    at += size;
    return start;
  };
  if (bytes[take(1)] !== 0x54 || bytes[take(1)] !== 0x53) throw new Error('no es un mensaje TS');
  const version = view.getUint8(take(1));
  if (version !== 1) throw new Error(`versión ${version} desconocida`);
  const date = new Date(view.getUint32(take(4), true) * 1000).toISOString();
  const text = () => {
    const length = view.getUint8(take(1));
    return decoder.decode(bytes.subarray(take(length), at));
  };
  const roaster = text();
  const batch = text();
  const count = view.getUint16(take(2), true);
  const temperatures = Array.from({ length: count }, () => view.getFloat32(take(4), true));
  return { date, roaster, batch, temperatures };
}

const reading = {
  date: Date.UTC(2026, 9, 14, 16, 30),
  roaster: 'Tostador Coyoacán',
  batch: 'Chiapas lavado · lote 12',
  temperatures: [182.5, 190.25, 201.7, 205.1, 210],
};
const message = encodeTelemetry(reading);
const json = encoder.encode(JSON.stringify(reading));
console.log('binario →', message.length, 'bytes | JSON →', json.length, 'bytes');

const decoded = decodeTelemetry(message);
console.log('decodificado →', decoded.roaster, '·', decoded.batch, '·', decoded.date);
// float32: 182.5, 190.25 y 210 son exactos; 201.7 y 205.1 vuelven con otras cifras.
console.log('temperaturas →', decoded.temperatures);
console.log('mostradas →', decoded.temperatures.map((value) => value.toFixed(1)).join(' · '));
console.log('¿iguales tras pasar por float32? →', decoded.temperatures.every((value, index) => value === Math.fround(reading.temperatures[index])));

// Un mensaje cortado por la red no se decodifica a medias: el cursor avisa.
try {
  decodeTelemetry(message.subarray(0, 40));
} catch (error) {
  console.log('cortado →', error.name, '|', error.message);
}
```
