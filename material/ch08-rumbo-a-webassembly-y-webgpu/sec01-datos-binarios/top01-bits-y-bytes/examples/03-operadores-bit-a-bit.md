---
example_description: "Los operadores bit a bit & | ^ ~ << >> trabajan posición a posición: AND, OR, XOR, NOT y desplazamientos, con los 8 bits de cada resultado a la vista"
example_tags: "javascript|python|bits|operadores|and|or|xor|desplazamiento"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Ayudante: un número (de 0 a 255) como sus 8 bits.
const bits = (n) => n.toString(2).padStart(8, '0');

const a = 0b1100_1010; // 202
const b = 0b1010_0110; // 166
console.log('a     →', bits(a), a);
console.log('b     →', bits(b), b);

// Cada operador compara los bits de la misma posición, columna a columna:
console.log('a & b →', bits(a & b), '(AND: 1 si los dos son 1)');
console.log('a | b →', bits(a | b), '(OR: 1 si alguno es 1)');
console.log('a ^ b →', bits(a ^ b), '(XOR: 1 si son distintos)');

// NOT invierte los 32 bits del número (ejemplo 4), así que el resultado es negativo:
console.log('~a →', ~a); // -203, porque ~x es siempre -(x + 1)
// & 0xff se queda solo con los 8 bits de abajo: el byte invertido.
console.log('~a & 0xff →', bits(~a & 0xff), '(NOT: cada bit al revés)');

// Desplazar a la izquierda n posiciones multiplica por 2 ** n…
console.log('a << 1 →', (a << 1).toString(2), '=', a << 1);   // 9 bits: 404
// …y a la derecha divide entre 2 ** n, sin decimales: los bits de la derecha se pierden.
console.log('a >> 2 →', bits(a >> 2), '=', a >> 2);          // 50 (202 / 4 = 50.5)

// XOR dos veces con la misma clave devuelve el valor original:
const key = 0b0101_0101;
const hidden = a ^ key;
console.log('a ^ key →', bits(hidden), '| (a ^ key) ^ key →', bits(hidden ^ key)); // vuelve a ser a

// Python: & | ^ ~ << >> funcionan igual con enteros positivos pequeños (y ~202 también
// es -203). Las diferencias aparecen con números grandes y negativos: ejemplos 4 y 5.
```
