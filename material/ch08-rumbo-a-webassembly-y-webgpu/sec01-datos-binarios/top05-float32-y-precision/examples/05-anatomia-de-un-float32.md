---
example_description: "Los 32 bits de un float32 leídos con DataView y separados con desplazamientos y máscaras: 1 bit de signo, 8 de exponente y 23 de mantisa; valor = ±(1 + mantisa / 2 ** 23) × 2 ** (exponente − 127), y los casos especiales 0, -0, Infinity y NaN"
example_tags: "javascript|python|ieee-754|float32|bits|dataview|mascaras"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un float32 son 32 bits:  s eeeeeeee mmmmmmmmmmmmmmmmmmmmmmm
//   s: signo (1 bit) · e: exponente (8 bits, con un sesgo de 127) · m: mantisa (23 bits)
// valor = (-1) ** s × (1 + m / 2 ** 23) × 2 ** (e - 127)    ← el «1 +» no se guarda
const view = new DataView(new ArrayBuffer(4));

function anatomy(value) {
  view.setFloat32(0, value); // escribir y leer con el mismo orden (aquí, el de por defecto)
  const bits = view.getUint32(0);
  const sign = bits >>> 31;               // el bit de arriba
  const exponent = (bits >>> 23) & 0xff;  // los 8 siguientes
  const mantissa = bits & 0x7fffff;       // los 23 de abajo (máscara de 23 unos)
  const text = bits.toString(2).padStart(32, '0');
  const fields = `${text[0]} ${text.slice(1, 9)} ${text.slice(9)}`;
  let meaning;
  if (exponent === 0xff) meaning = mantissa === 0 ? 'infinito' : 'NaN';
  else if (exponent === 0) meaning = mantissa === 0 ? 'cero' : 'subnormal';
  else meaning = `${sign ? '-' : '+'}(1 + ${mantissa} / 2 ** 23) × 2 ** ${exponent - 127}`;
  const label = Object.is(value, -0) ? '-0' : String(value); // String(-0) sería '0'
  console.log(`${label.padEnd(10)} ${fields}  ${meaning}`);
}

for (const value of [1, -2, 0.15625, 0.1, 16777217, 0, -0, Infinity, NaN]) anatomy(value);

// Comprobación: reconstruir 0.15625 a mano a partir de sus campos.
//   exponente 124 → 2 ** -3 = 0.125 · mantisa 2097152 / 2 ** 23 = 0.25 → 1.25 × 0.125
console.log('reconstruido →', (1 + 2097152 / 2 ** 23) * 2 ** (124 - 127)); // 0.15625

// Un number (float64) tiene el mismo diseño con 1 + 11 + 52 bits y sesgo 1023
// (lección «Números»). Python: struct.unpack('>I', struct.pack('>f', 0.1)) da estos bits.
```
