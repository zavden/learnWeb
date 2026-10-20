---
example_description: "Leer un PNG de verdad con DataView en big-endian: comprobar la firma de 8 bytes, recorrer sus fragmentos (longitud, tipo, datos, CRC) y sacar del IHDR el ancho, el alto, los bits por canal y el tipo de color"
example_tags: "javascript|dataview|png|big-endian|formato-binario|fetch"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Dentro de <code>tile.png</code></h1>
  <figure>
    <img src="tile.png" width="128" height="128" alt="Azulejo de 8 × 8 píxeles en azul, blanco y dorado">
    <figcaption>La imagen, ampliada 16 veces</figcaption>
  </figure>
  <dl id="fields" aria-live="polite"></dl>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
figure { margin: 0 0 1rem; }
img { image-rendering: pixelated; border: 1px solid #64748b; }
figcaption { font-size: 0.85rem; color: #475569; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; margin: 0; }
dt { font-weight: 600; }
dd { margin: 0; font-family: Menlo, Consolas, monospace; }
```

# JavaScript

```javascript
const buffer = await (await fetch('tile.png')).arrayBuffer();
const view = new DataView(buffer);
const bytes = new Uint8Array(buffer);
const ascii = (start, length) => String.fromCharCode(...bytes.subarray(start, start + length));

// 1. La firma: los 8 primeros bytes de TODOS los PNG.
const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPng = SIGNATURE.every((byte, index) => bytes[index] === byte);
console.log('firma PNG →', isPng);

// 2. Los fragmentos (chunks): longitud (uint32) + tipo (4 letras) + datos + CRC (4 bytes).
//    PNG es BIG-endian: getUint32 sin tercer argumento… pero lo escribimos igual (false).
const chunks = [];
for (let offset = 8; offset < view.byteLength; ) {
  const length = view.getUint32(offset, false);
  const type = ascii(offset + 4, 4);
  chunks.push({ type, start: offset + 8, length });
  console.log(`${type} (${length} bytes)`);
  offset += 12 + length; // 4 de longitud + 4 de tipo + datos + 4 de CRC
}

// 3. IHDR: siempre el primero, 13 bytes con las medidas de la imagen.
const ihdr = chunks[0].start;
const COLOR_TYPES = { 0: 'gris', 2: 'RGB', 3: 'paleta', 4: 'gris + alfa', 6: 'RGBA' };
const colorType = view.getUint8(ihdr + 9);
const fields = [
  ['ancho', view.getUint32(ihdr, false)],
  ['alto', view.getUint32(ihdr + 4, false)],
  ['bits por canal', view.getUint8(ihdr + 8)],
  ['tipo de color', `${colorType} (${COLOR_TYPES[colorType]})`],
];
// 4. tEXt: «clave», un byte 0 y el texto (Latin-1: un byte por carácter).
const text = chunks.find((chunk) => chunk.type === 'tEXt');
fields.push(ascii(text.start, text.length).split('\0'));

for (const [name, value] of fields) console.log(`${name} → ${value}`);
document.querySelector('#fields').append(...fields.flatMap(([name, value]) => [
  Object.assign(document.createElement('dt'), { textContent: name }),
  Object.assign(document.createElement('dd'), { textContent: value }),
]));
// Los píxeles van comprimidos en IDAT (zlib): DecompressionStream('deflate') los abriría.
```
