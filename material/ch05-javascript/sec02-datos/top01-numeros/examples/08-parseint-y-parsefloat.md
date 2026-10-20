---
example_description: "parseInt lee el principio de un string: parseInt(0.0000005) es 5, la base importa y la coma decimal lo corta"
example_tags: "javascript|python|numeros|parseint|parsefloat|conversion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Number() es «todo o nada». parseInt y parseFloat LEEN el principio del texto y
// se paran en el primer carácter que no encaja.
console.table({
  "'42px'":  { Number: Number('42px'),  parseInt: parseInt('42px', 10),  parseFloat: parseFloat('42px') },
  "'3.99'":  { Number: Number('3.99'),  parseInt: parseInt('3.99', 10),  parseFloat: parseFloat('3.99') },
  "'1e3'":   { Number: Number('1e3'),   parseInt: parseInt('1e3', 10),   parseFloat: parseFloat('1e3') },
  "''":      { Number: Number(''),      parseInt: parseInt('', 10),      parseFloat: parseFloat('') },
  "'px42'":  { Number: Number('px42'),  parseInt: parseInt('px42', 10),  parseFloat: parseFloat('px42') },
});

// 🐛 parseInt espera un STRING. Si le das un number, primero lo convierte a texto…
console.log('String(0.0000005) →', String(0.0000005));      // '5e-7'
console.log('parseInt(0.0000005) →', parseInt(0.0000005));  // 5: lee '5' y se para en 'e'
console.log('parseInt(0.000005) →', parseInt(0.000005));    // 0: aquí el texto es '0.000005'
// ✅ Para quitar los decimales de un number, Math.trunc (es el int() de Python).
console.log('Math.trunc(0.0000005) →', Math.trunc(0.0000005)); // 0

// La base (radix): pásala siempre. Sin ella, un texto que empieza por 0x se lee
// en hexadecimal.
console.log("parseInt('ff', 16) →", parseInt('ff', 16));      // 255 (Python: int('ff', 16))
console.log("parseInt('101', 2) →", parseInt('101', 2));      // 5
console.log("parseInt('0x1f') →", parseInt('0x1f'));          // 31
console.log("parseInt('0x1f', 10) →", parseInt('0x1f', 10));  // 0

// 🐛 Números escritos a la española: parseFloat se para en la coma.
const amountText = '1.234,56';
console.log('parseFloat(amountText) →', parseFloat(amountText)); // 1.234 (¡uno coma algo!)
// ✅ Normaliza antes: quita los puntos de miles y cambia la coma por un punto.
// (replaceAll y replace son métodos de string: lección «Strings».)
const normalized = amountText.replaceAll('.', '').replace(',', '.');
console.log('Number(normalized) →', Number(normalized));        // 1234.56

// Python no lee a medias: int('42px') y float('1.234,56') lanzan ValueError.
```
