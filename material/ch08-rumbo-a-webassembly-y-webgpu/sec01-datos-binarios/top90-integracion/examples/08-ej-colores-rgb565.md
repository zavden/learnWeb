---
example_description: "Ejercicio: empaqueta y desempaqueta colores RGB565, el formato de 16 bits de muchas pantallas pequeñas y texturas (5 bits de rojo, 6 de verde, 5 de azul), con desplazamientos y máscaras; las comprobaciones cubren colores puros, la vuelta a 8 bits sin perder el blanco, los bytes en memoria y el error máximo"
example_tags: "javascript|bits|mascaras|rgb565|color|empaquetar|ejercicio"
exercise: true
exercise_title: "Colores en 16 bits: RGB565"
exercise_instructions: "Un color RGB565 cabe en 16 bits: rrrrrggg gggbbbbb (5 bits de rojo, 6 de verde y 5 de azul; el ojo distingue más tonos de verde) || En packRgb565, quédate con los bits altos de cada canal (r >> 3, g >> 2, b >> 3) y colócalos en su sitio con << y | || En unpackRgb565, saca cada campo desplazando a la derecha y aplicando una máscara (0x1f para 5 bits, 0x3f para 6) || Amplía cada campo a 8 bits repitiendo sus bits altos por la derecha, para que 31 vuelva a ser 255 y no 248 || Ejecuta hasta que las siete comprobaciones salgan ✅"
exercise_hints: "El rojo va arriba: (r >> 3) << 11; el verde en medio: (g >> 2) << 5; el azul abajo, tal cual (b >> 3) || Para leer el rojo: (value >> 11) & 0x1f; el verde: (value >> 5) & 0x3f; el azul: value & 0x1f || Ampliar 5 bits a 8: (r5 << 3) | (r5 >> 2); 6 bits a 8: (g6 << 2) | (g6 >> 4)"
exercise_solution_example: 08-ej-colores-rgb565-solucion.md
example_stage: exercise
example_importance: useful
console: true
---

# JavaScript

```javascript
// RGB565: rrrrrggg gggbbbbb
function packRgb565({ r, g, b }) {
  // TODO: los 5/6/5 bits altos de cada canal, cada uno en su sitio
  return 0;
}

function unpackRgb565(value) {
  // TODO: separar los campos con >> y máscaras, y ampliarlos a 8 bits
  return { r: 0, g: 0, b: 0 };
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
