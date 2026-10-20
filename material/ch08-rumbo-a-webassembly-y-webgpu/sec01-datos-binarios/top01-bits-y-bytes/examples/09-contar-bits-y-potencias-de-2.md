---
example_description: "Math.clz32 cuenta los ceros de la izquierda: con él salen los bits que necesita un número y la siguiente potencia de 2 (tamaños de textura); n & (n - 1) detecta potencias de 2 y sirve para contar bits encendidos"
example_tags: "javascript|python|bits|clz32|potencias-de-2|popcount"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Math.clz32(x): cuántos ceros hay a la izquierda en los 32 bits de x
// («count leading zeros»; las CPU lo calculan con una sola instrucción).
console.log('Math.clz32(1) →', Math.clz32(1));     // 31: 000…0001
console.log('Math.clz32(255) →', Math.clz32(255)); // 24: 000…0 11111111
console.log('Math.clz32(0) →', Math.clz32(0));     // 32

// Bits necesarios para escribir un número = 32 - ceros de la izquierda.
const bitLength = (n) => 32 - Math.clz32(n);
console.log('bitLength(1000) →', bitLength(1000), '→', (1000).toString(2)); // 10

// Una potencia de 2 tiene UN solo bit a 1, y n - 1 tiene a 1 todos los de debajo:
//   64 = 1000000, 63 = 0111111, 64 & 63 = 0
const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
console.log('¿potencias de 2? →', [64, 100, 1024, 1000].map(isPowerOfTwo)); // [true, false, true, false]

// La siguiente potencia de 2: lo que se hace con los tamaños de textura en la GPU
// o al hacer crecer un búfer (duplicando, para no copiar en cada byte nuevo).
const nextPowerOfTwo = (n) => (n <= 1 ? 1 : 2 ** bitLength(n - 1));
for (const width of [300, 512, 513, 1920]) {
  console.log(`imagen de ${width} px → textura de ${nextPowerOfTwo(width)} px`);
}

// Contar los bits a 1: n & (n - 1) apaga el bit 1 más bajo; se repite hasta llegar a 0.
function countBits(n) {
  let count = 0;
  for (; n !== 0; n &= n - 1) count += 1;
  return count;
}
console.log('countBits(0b1011_0110) →', countBits(0b1011_0110)); // 5

// Python: (1000).bit_length() → 10 y (182).bit_count() → 5. JavaScript no trae
// bitCount: se escribe a mano como arriba (o con un bucle sobre los 32 bits).
```
