---
example_description: "Ejercicio: detecta el tipo de un archivo por sus primeros bytes (sus «números mágicos»), sin fiarte del nombre: PNG ya funciona; faltan JPEG, GIF, PDF, ZIP, WAV y BMP, sin confundir un AVI con un WAV y sin fallar con archivos más cortos que la firma"
example_tags: "javascript|bytes|firmas|magic-numbers|formatos|ejercicio"
exercise: true
exercise_title: "¿Qué archivo es? Las firmas mágicas"
exercise_instructions: "detectType(bytes) recibe los primeros bytes de un archivo (un Uint8Array) y devuelve 'png', 'jpeg', 'gif', 'pdf', 'zip', 'wav', 'bmp' o null || PNG ya funciona con matches(bytes, firma), que compara byte a byte desde una posición y no falla si el archivo es más corto || Añade las demás firmas de la tabla del comentario; para las que son texto, ascii('GIF8') da sus bytes || WAV y AVI empiezan los dos por 'RIFF': mira también los bytes 8 a 11 ('WAVE') || Devuelve null para todo lo demás, también para archivos vacíos o más cortos que una firma || Ejecuta hasta que las ocho comprobaciones salgan ✅"
exercise_hints: "matches(bytes, ascii('%PDF-')) comprueba los cinco primeros bytes || GIF tiene dos versiones: 'GIF87a' y 'GIF89a'; basta con 'GIF8' seguido de '7a' o '9a' || Para WAV: matches(bytes, ascii('RIFF')) && matches(bytes, ascii('WAVE'), 8)"
exercise_solution_example: 10-ej-tipo-por-firma-solucion.md
example_stage: exercise
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
  // TODO: jpeg, gif, pdf, zip, wav y bmp
  return null;
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
