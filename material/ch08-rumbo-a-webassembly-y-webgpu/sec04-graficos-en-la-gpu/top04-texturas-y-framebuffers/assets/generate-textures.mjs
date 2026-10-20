// Genera scene.png, la imagen de la lección «Texturas y framebuffers».
// Es un script de Node (no se ejecuta en la vista previa): node generate-textures.mjs
//
//   scene.png   16 × 12 píxeles, PNG RGB de 8 bits: cielo arriba (filas 0-7), sol, una casa
//               y hierba abajo (filas 8-11). Sin perfil de color, para que los bytes lleguen
//               tal cual a la GPU y readPixels dé números exactos.
//
// Escribe el PNG byte a byte como en la lección «DataView y endianness» (big-endian, CRC-32).
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const SKY = [125, 211, 252];   // #7dd3fc
const SUN = [250, 204, 21];    // #facc15
const ROOF = [220, 38, 38];    // #dc2626
const WALL = [254, 243, 199];  // #fef3c7
const DOOR = [120, 53, 15];    // #78350f
const GRASS = [22, 163, 74];   // #16a34a

// Filas de ARRIBA abajo, tal como se ven
const rows = [];
for (let y = 0; y < 12; y++) {
  const row = [];
  for (let x = 0; x < 16; x++) {
    let color = y < 8 ? SKY : GRASS;
    if (x >= 11 && x <= 13 && y >= 1 && y <= 3) color = SUN;              // sol: 3 × 3
    if (y >= 4 && y <= 6 && x >= 8 - y && x <= y + 1) color = ROOF;   // tejado en triángulo
    if (y >= 7 && y <= 9 && x >= 2 && x <= 7) color = WALL;               // paredes
    if (y >= 8 && y <= 9 && x >= 4 && x <= 5) color = DOOR;               // puerta
    row.push(color);
  }
  rows.push(row);
}

function chunk(type, data) {
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, crc32(bytes.subarray(4, 8 + data.length)));
  return bytes;
}

function png(pixelRows) {
  const width = pixelRows[0].length;
  const height = pixelRows.length;
  const header = new DataView(new ArrayBuffer(13));
  header.setUint32(0, width);
  header.setUint32(4, height);
  header.setUint8(8, 8); // bits por canal
  header.setUint8(9, 2); // tipo de color 2: RGB
  const stride = 1 + width * 3; // 1 byte de filtro (0) + RGB por fila
  const raw = new Uint8Array(height * stride);
  pixelRows.forEach((row, y) => row.forEach((color, x) => raw.set(color, y * stride + 1 + x * 3)));
  const parts = [
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    chunk('IHDR', new Uint8Array(header.buffer)),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', new Uint8Array(0)),
  ];
  const file = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    file.set(part, offset);
    offset += part.length;
  }
  return file;
}

writeFileSync(new URL('scene.png', import.meta.url), png(rows));
console.log(rows.map((row) => row.map((c) => '·SR WDG'[[SKY, SUN, ROOF, null, WALL, DOOR, GRASS].indexOf(c)]).join('')).join('\n'));
