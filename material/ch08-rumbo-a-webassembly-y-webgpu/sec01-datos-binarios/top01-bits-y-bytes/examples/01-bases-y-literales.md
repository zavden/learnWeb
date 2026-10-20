---
example_description: "Un mismo número en cuatro bases: literales 0b, 0o y 0x con separadores, toString(base) + padStart para ver los bits de un byte y parseInt(texto, base) para volver"
example_tags: "javascript|python|binario|hexadecimal|octal|bits|bytes"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un mismo número, escrito en cuatro bases. Los cuatro son el MISMO number: 202.
console.log('decimal →', 202);
console.log('0b11001010 →', 0b11001010); // binario (base 2): solo 0 y 1
console.log('0o312 →', 0o312);           // octal (base 8): cifras 0-7
console.log('0xca →', 0xca);             // hexadecimal (base 16): 0-9 y a-f (a = 10 … f = 15)

// El separador _ agrupa cifras para leerlas mejor (como en Python). En binario,
// de 4 en 4: cada grupo de 4 bits es exactamente UNA cifra hexadecimal.
console.log('0b1100_1010 →', 0b1100_1010, '| 0xc →', 0xc, '| 0xa →', 0xa); // 1100 = c, 1010 = a

// De número a texto en otra base: toString(base). No pone ceros a la izquierda…
console.log('(5).toString(2) →', (5).toString(2)); // '101'
// …así que, para ver un byte entero (8 bits), rellena con padStart.
console.log("(5).toString(2).padStart(8, '0') →", (5).toString(2).padStart(8, '0')); // '00000101'
console.log('(255).toString(16) →', (255).toString(16)); // 'ff'
console.log("(10).toString(16).padStart(2, '0') →", (10).toString(16).padStart(2, '0')); // '0a'

// De texto a número: parseInt(texto, base). El texto va SIN prefijo.
console.log("parseInt('11001010', 2) →", parseInt('11001010', 2)); // 202
console.log("parseInt('ca', 16) →", parseInt('ca', 16));           // 202
// 🐛 Con prefijo, parseInt lee el '0', se para en la 'b' y no avisa.
console.log("parseInt('0b101', 2) →", parseInt('0b101', 2));       // 0
// Number() sí entiende los prefijos, igual que el literal:
console.log("Number('0b101') →", Number('0b101'), "| Number('0xff') →", Number('0xff')); // 5 | 255

// Python: bin(202) → '0b11001010', hex(202) → '0xca', format(5, '08b') → '00000101',
// int('ca', 16) → 202. toString(base) de JavaScript no añade el prefijo 0b/0x.
```
