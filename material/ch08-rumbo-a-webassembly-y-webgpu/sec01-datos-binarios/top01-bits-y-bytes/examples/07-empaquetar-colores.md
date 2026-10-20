---
example_description: "Empaquetar tres bytes en un número con (r << 16) | (g << 8) | b y desempaquetarlos con >> y & 0xff; con un cuarto byte (alfa) arriba, el bit 31 vuelve el número negativo y hace falta >>> 0"
example_tags: "javascript|bits|bytes|color|rgb|empaquetar|desplazamiento"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Tres colores de una paleta, cada canal un byte (0-255).
const palette = [
  { name: 'Azul Talavera', r: 30, g: 64, b: 175 },
  { name: 'Rosa mexicano', r: 228, g: 0, b: 124 },
  { name: 'Cempasúchil', r: 255, g: 159, b: 28 },
];

// Empaquetar: cada byte se desplaza a su sitio y | los junta en un solo número.
//   r << 16 → rrrrrrrr 00000000 00000000
//   g << 8  →          gggggggg 00000000
//   b       →                   bbbbbbbb
const pack = ({ r, g, b }) => (r << 16) | (g << 8) | b;

// Desempaquetar: desplaza el byte que quieres a la derecha y quédate con 8 bits (& 0xff).
const unpack = (color) => [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];

for (const color of palette) {
  const packed = pack(color);
  const cssHex = `#${packed.toString(16).padStart(6, '0')}`;
  console.log(`${color.name}: ${packed} → ${cssHex} → [${unpack(packed).join(', ')}]`);
}

// Con alfa (transparencia) en el byte de arriba, el formato RGBA de 32 bits:
const withAlpha = ({ r, g, b }, a) => (r << 24) | (g << 16) | (b << 8) | a;
const pink = withAlpha(palette[1], 255);
// 🐛 r = 228 tiene su bit de arriba a 1, que al desplazarlo 24 posiciones cae en
//    el bit 31: el del signo. El número sale negativo y su hex, con un «-».
console.log('🐛 RGBA →', pink, pink.toString(16));               // -469730049 '-1bff8301'
// ✅ >>> 0 lo lee como entero sin signo de 32 bits.
console.log('✅ RGBA →', pink >>> 0, (pink >>> 0).toString(16)); // 3825237247 'e4007cff'
// Desempaquetar funciona igual con o sin signo, porque & 0xff se queda con 8 bits:
console.log('alfa →', pink & 0xff, '| rojo →', (pink >>> 24) & 0xff); // 255 | 228
```
