---
example_description: "Un valor que no cabe en un typed array de enteros da la vuelta sin avisar: u8[0] = 300 guarda 44, -1 guarda 255, los decimales se truncan y aclarar una foto sumando 60 a cada píxel convierte los blancos en negros"
example_tags: "javascript|python|typed-arrays|desbordamiento|uint8array|pixeles|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un Uint8Array guarda bytes: de 0 a 255. ¿Qué pasa con lo que no cabe?
const u8 = new Uint8Array(5);
u8[0] = 300;  // 🐛 300 - 256 = 44 (se queda con los 8 bits de abajo)
u8[1] = 256;  // 🐛 0
u8[2] = -1;   // 🐛 255 (los mismos 8 bits, leídos sin signo)
u8[3] = 3.99; // 🐛 3: los decimales se truncan, no se redondean
u8[4] = NaN;  // 🐛 0
console.log('Uint8Array →', u8);

// Con signo, el valor más alto + 1 salta al más bajo:
const i8 = Int8Array.of(127);
i8[0] += 1;
console.log('Int8Array 127 + 1 →', i8[0]); // -128

// Un contador de un byte que se pasa de 255 vuelve a empezar desde 0:
const visits = new Uint8Array(1);
for (let visit = 0; visit < 260; visit += 1) visits[0] += 1;
console.log('260 visitas →', visits[0]); // 4

// El caso típico: aclarar una imagen gris sumando 60 a cada píxel.
const pixels = Uint8Array.of(10, 100, 200, 250); // de oscuro a casi blanco
const brighter = pixels.map((value) => value + 60);
console.log('🐛 más claro →', brighter); // 200 y 250 dan la vuelta: ¡se vuelven casi negros!

// ✅ 1. Recorta tú el valor antes de guardarlo…
const clamped = pixels.map((value) => Math.min(255, Math.max(0, value + 60)));
console.log('✅ recortando →', clamped);
// ✅ 2. …o usa Uint8ClampedArray, que satura solo (ejemplo siguiente).

// No es un error: es la misma regla que | 0 en la lección anterior, con 8 bits en lugar
// de 32. Ningún typed array de enteros lanza excepciones al desbordarse.
// numpy hace lo mismo: np.array([250], dtype=np.uint8) + 60 → array([54], dtype=uint8).
```
