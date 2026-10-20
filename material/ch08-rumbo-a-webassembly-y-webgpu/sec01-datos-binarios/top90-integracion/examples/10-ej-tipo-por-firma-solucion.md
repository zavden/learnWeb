---
example_description: "Solución: la detección por firmas completa; cada formato se reconoce por sus primeros bytes con matches(), WAV mira además los bytes 8-11 para no confundirse con AVI, y los archivos cortos no fallan porque faltar un byte es no coincidir"
example_tags: "javascript|bytes|firmas|magic-numbers|formatos|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// Firmas («números mágicos») de algunos formatos:
//   PNG   89 50 4e 47 0d 0a 1a 0a
//   JPEG  ff d8 ff
//   GIF   'GIF87a' o 'GIF89a'
//   PDF   '%PDF-'
//   ZIP   'P' 'K' 03 04            (también .docx, .xlsx y .epub: son ZIP por dentro)
//   WAV   'RIFF' + 4 bytes de tamaño + 'WAVE'
//   BMP   'BM'
const ascii = (text) => Array.from(text, (char) => char.charCodeAt(0));
// ¿Coinciden los bytes con la firma a partir de `offset`? (Si faltan bytes, no coinciden.)
const matches = (bytes, signature, offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte);

function detectType(bytes) {
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (matches(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (matches(bytes, ascii('GIF87a')) || matches(bytes, ascii('GIF89a'))) return 'gif';
  if (matches(bytes, ascii('%PDF-'))) return 'pdf';
  if (matches(bytes, [0x50, 0x4b, 0x03, 0x04])) return 'zip';
  // ✅ RIFF es un contenedor: el tipo de verdad está en los bytes 8-11.
  if (matches(bytes, ascii('RIFF')) && matches(bytes, ascii('WAVE'), 8)) return 'wav';
  if (matches(bytes, ascii('BM'))) return 'bmp';
  return null; // ✅ y nada de adivinar por el nombre del archivo
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, run, expected) {
  let actual;
  try {
    actual = JSON.stringify(run());
  } catch (error) {
    actual = JSON.stringify(error.name);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
const file = (...parts) => Uint8Array.from(parts.flatMap((part) => (typeof part === 'string' ? ascii(part) : part)));
const SAMPLES = {
  photo: file([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10], 'JFIF', [0]),
  gif89: file('GIF89a', [0x10, 0x00, 0x10, 0x00]),
  gif87: file('GIF87a', [0x01, 0x00, 0x01, 0x00]),
  invoice: file('%PDF-1.7\n'),
  report: file('PK', [0x03, 0x04, 0x14, 0x00], 'word/document.xml'),
  bell: file('RIFF', [0x24, 0x08, 0x00, 0x00], 'WAVEfmt '),
  movie: file('RIFF', [0x24, 0x08, 0x00, 0x00], 'AVI LIST'),
  scan: file('BM', [0xae, 0x00, 0x00, 0x00]),
};

check('un PNG', () => detectType(file([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13])), 'png');
check('una foto JPEG', () => detectType(SAMPLES.photo), 'jpeg');
check('GIF89a y GIF87a', () => [detectType(SAMPLES.gif89), detectType(SAMPLES.gif87)], ['gif', 'gif']);
check('una factura en PDF', () => detectType(SAMPLES.invoice), 'pdf');
check('un .docx (por dentro, un ZIP)', () => detectType(SAMPLES.report), 'zip');
check('un WAV sí; un AVI (también RIFF) no', () => [detectType(SAMPLES.bell), detectType(SAMPLES.movie)], ['wav', null]);
check('un BMP', () => detectType(SAMPLES.scan), 'bmp');
check('nada de falsos positivos: texto, archivo vacío y JPEG cortado', () => [file('Hola'), file(), file([0xff, 0xd8])].map(detectType), [null, null, null]);
```
