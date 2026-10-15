// Genera los archivos binarios de la lección «DataView y endianness».
// Es un script de Node (no se ejecuta en la vista previa): node generate-samples.mjs
//
//   landscape.bmp            7 × 5 píxeles, BMP de 24 bits, filas de ABAJO arriba (altura 5)
//   landscape-top-down.bmp   la misma imagen con altura -5: filas de ARRIBA abajo
//   tile.png                 8 × 8 píxeles, PNG RGB de 8 bits, con un fragmento tEXt
//
// Usa lo mismo que la lección: DataView, little-endian para BMP y big-endian para PNG.
// writeFileSync, deflateSync y crc32 son de Node; en el navegador, la compresión
// la haría CompressionStream('deflate').
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

// Colores [rojo, verde, azul].
const SKY = [125, 211, 252];
const SUN = [250, 204, 21];
const ROOF = [220, 38, 38];
const WALL = [254, 243, 199];
const DOOR = [120, 53, 15];
const GRASS = [22, 163, 74];
const BLUE = [30, 64, 175];
const WHITE = [248, 250, 252];
const GOLD = [245, 158, 11];

// Filas de arriba abajo, tal como se ven.
const landscape = [
  [SKY, SKY, SKY, SKY, SKY, SUN, SKY],
  [SKY, SKY, ROOF, SKY, SKY, SKY, SKY],
  [SKY, ROOF, ROOF, ROOF, SKY, SKY, SKY],
  [GRASS, WALL, DOOR, WALL, GRASS, GRASS, GRASS],
  [GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS],
];
const [B, W, Y] = [BLUE, WHITE, GOLD];
const tile = [
  [B, W, W, B, B, W, W, B],
  [W, Y, W, W, W, W, Y, W],
  [W, W, B, W, W, B, W, W],
  [B, W, W, Y, Y, W, W, B],
  [B, W, W, Y, Y, W, W, B],
  [W, W, B, W, W, B, W, W],
  [W, Y, W, W, W, W, Y, W],
  [B, W, W, B, B, W, W, B],
];

function bmp(rows, topDown) {
  const width = rows[0].length;
  const height = rows.length;
  const rowSize = Math.ceil((width * 3) / 4) * 4; // cada fila se rellena hasta un múltiplo de 4 bytes
  const dataSize = rowSize * height;
  const view = new DataView(new ArrayBuffer(54 + dataSize)); // empieza todo a 0 (también el relleno)
  view.setUint8(0, 0x42);                              // 'B'
  view.setUint8(1, 0x4d);                              // 'M'
  view.setUint32(2, 54 + dataSize, true);              // tamaño del archivo (little-endian)
  view.setUint32(10, 54, true);                        // posición de los píxeles
  view.setUint32(14, 40, true);                        // tamaño de la cabecera DIB (BITMAPINFOHEADER)
  view.setInt32(18, width, true);
  view.setInt32(22, topDown ? -height : height, true); // negativa: filas de arriba abajo
  view.setUint16(26, 1, true);                         // planos de color (siempre 1)
  view.setUint16(28, 24, true);                        // bits por píxel
  view.setUint32(30, 0, true);                         // sin compresión
  view.setUint32(34, dataSize, true);                  // bytes de píxeles
  view.setInt32(38, 2835, true);                       // 72 ppp en píxeles por metro
  view.setInt32(42, 2835, true);
  const fileRows = topDown ? rows : [...rows].reverse();
  fileRows.forEach((row, y) => {
    row.forEach(([r, g, b], x) => {
      const at = 54 + y * rowSize + x * 3;
      view.setUint8(at, b); // BMP guarda azul, verde, rojo
      view.setUint8(at + 1, g);
      view.setUint8(at + 2, r);
    });
  });
  return new Uint8Array(view.buffer);
}

// Un fragmento PNG: longitud (4 bytes) + tipo (4 letras) + datos + CRC-32 de tipo y datos.
function chunk(type, data) {
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length); // big-endian: el orden por defecto de DataView
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, crc32(bytes.subarray(4, 8 + data.length)));
  return bytes;
}

function png(rows, title) {
  const width = rows[0].length;
  const height = rows.length;
  const header = new DataView(new ArrayBuffer(13));
  header.setUint32(0, width);
  header.setUint32(4, height);
  header.setUint8(8, 8);  // bits por canal
  header.setUint8(9, 2);  // tipo de color 2: RGB (sin alfa)
  // bytes 10-12: compresión, filtro y entrelazado, los tres 0
  const stride = 1 + width * 3; // cada fila: 1 byte de filtro (0 = ninguno) + RGB
  const raw = new Uint8Array(height * stride);
  rows.forEach((row, y) => row.forEach((color, x) => raw.set(color, y * stride + 1 + x * 3)));
  const signature = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  const parts = [
    signature,
    chunk('IHDR', new Uint8Array(header.buffer)),
    chunk('tEXt', new TextEncoder().encode(`Title\0${title}`)),
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

const here = new URL('./', import.meta.url);
writeFileSync(new URL('landscape.bmp', here), bmp(landscape, false));
writeFileSync(new URL('landscape-top-down.bmp', here), bmp(landscape, true));
writeFileSync(new URL('tile.png', here), png(tile, 'Azulejo de Talavera'));
console.log('Listo: landscape.bmp, landscape-top-down.bmp y tile.png');
