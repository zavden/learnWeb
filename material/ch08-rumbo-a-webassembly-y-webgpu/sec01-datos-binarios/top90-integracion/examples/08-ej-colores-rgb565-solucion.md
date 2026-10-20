---
example_description: "Solución: RGB565 con desplazamientos y máscaras; al empaquetar se quedan los bits altos de cada canal y al desempaquetar se amplían repitiendo esos bits, para que el blanco vuelva a ser 255"
example_tags: "javascript|bits|mascaras|rgb565|color|empaquetar|solucion"
example_stage: final-solution
example_importance: useful
console: true
---

# JavaScript

```javascript
// RGB565: rrrrrggg gggbbbbb
function packRgb565({ r, g, b }) {
  // ✅ Los bits altos de cada canal (se pierden los de abajo), cada uno en su sitio.
  return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
}

function unpackRgb565(value) {
  const r5 = (value >> 11) & 0x1f; // ✅ 5 bits
  const g6 = (value >> 5) & 0x3f;  // ✅ 6 bits
  const b5 = value & 0x1f;
  // ✅ Ampliar repitiendo los bits altos: 11111 → 11111111 (255), no 11111000 (248).
  return { r: (r5 << 3) | (r5 >> 2), g: (g6 << 2) | (g6 >> 4), b: (b5 << 3) | (b5 >> 2) };
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
const hex4 = (value) => value.toString(16).padStart(4, '0');
const PALETTE = [
  { r: 30, g: 64, b: 175 },  // azul Talavera
  { r: 228, g: 0, b: 124 },  // rosa mexicano
  { r: 255, g: 159, b: 28 }, // cempasúchil
  { r: 22, g: 163, b: 74 },  // verde nopal
];

check('blanco → ffff', () => hex4(packRgb565({ r: 255, g: 255, b: 255 })), 'ffff');
check('rojo, verde y azul puros → f800, 07e0, 001f', () => [{ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, { r: 0, g: 0, b: 255 }].map((color) => hex4(packRgb565(color))), ['f800', '07e0', '001f']);
check('azul Talavera (30, 64, 175) → 1a15', () => hex4(packRgb565(PALETTE[0])), '1a15');
check('ffff vuelve a ser blanco (255, no 248)', () => unpackRgb565(0xffff), { r: 255, g: 255, b: 255 });
check('1a15 → (24, 65, 173)', () => unpackRgb565(0x1a15), { r: 24, g: 65, b: 173 });
check('en memoria, little-endian: 1a15 son los bytes 15 1a', () => Array.from(new Uint8Array(Uint16Array.of(packRgb565(PALETTE[0])).buffer)), [0x15, 0x1a]);
check('ida y vuelta: error máximo de 7 en rojo y azul y de 3 en verde', () => PALETTE.every((color) => {
  const back = unpackRgb565(packRgb565(color));
  return Math.abs(back.r - color.r) <= 7 && Math.abs(back.g - color.g) <= 3 && Math.abs(back.b - color.b) <= 7;
}), true);
```
