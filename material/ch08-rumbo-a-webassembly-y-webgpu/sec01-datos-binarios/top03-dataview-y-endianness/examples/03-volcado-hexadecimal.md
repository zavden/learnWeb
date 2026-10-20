---
example_description: "Un volcado hexadecimal (hexdump) como el de xxd: posición, 16 bytes en hex y su lectura en ASCII; aplicado a tile.png, descargado con fetch y arrayBuffer(), deja ver la firma y los nombres de los fragmentos"
example_tags: "javascript|python|hexdump|bytes|fetch|arraybuffer|png"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Volcado hexadecimal: la forma estándar de mirar un archivo binario.
//   posición   16 bytes en hex (dos grupos de 8)                 los mismos bytes como texto
function hexdump(bytes, length = bytes.length) {
  const lines = [];
  for (let offset = 0; offset < length; offset += 16) {
    const row = bytes.subarray(offset, Math.min(offset + 16, length));
    const cells = Array.from(row, (byte) => byte.toString(16).padStart(2, '0'));
    const hexPart = `${cells.slice(0, 8).join(' ')}  ${cells.slice(8).join(' ')}`;
    // Solo los bytes imprimibles de ASCII (0x20-0x7e) se muestran como letras; el resto, '.'.
    const text = Array.from(row, (byte) => (byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.')).join('');
    lines.push(`${offset.toString(16).padStart(8, '0')}  ${hexPart.padEnd(49)} |${text}|`);
  }
  return lines.join('\n');
}

// arrayBuffer() de una respuesta: el archivo entero como bytes (lección «Peticiones con fetch»).
const buffer = await (await fetch('tile.png')).arrayBuffer();
const bytes = new Uint8Array(buffer);
console.log('tile.png →', bytes.length, 'bytes');
console.log(hexdump(bytes, 80));

// Lo que ya se reconoce a simple vista:
//   89 50 4e 47 0d 0a 1a 0a   la firma de todos los PNG («.PNG» y saltos de línea)
//   00 00 00 0d 49 48 44 52   longitud 13 y el fragmento «IHDR» (la cabecera)
//   … 74 45 58 74             «tEXt»: un fragmento de texto con el título de la imagen
// Mira el archivo entero con el botón «Assets»; en la terminal: xxd tile.png.
// Python: open('tile.png', 'rb').read() da los bytes; bytes.hex(' ') los escribe en hex.
```
