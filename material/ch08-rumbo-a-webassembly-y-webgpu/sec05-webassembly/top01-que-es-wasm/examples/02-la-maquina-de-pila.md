---
example_description: "WebAssembly es una máquina de pila: un intérprete de juguete en JavaScript muestra la pila después de cada instrucción de (2 + 3) * 4 y de 2 + 3 * 4, y la misma secuencia en un módulo de verdad devuelve 20"
example_tags: "javascript|webassembly|wasm|maquina-de-pila|instrucciones|wat|python"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una máquina de pila en miniatura, para ver qué hace cada instrucción: toma sus
// operandos de la CIMA de la pila y deja ahí su resultado.
function run(title, program) {
  console.log(title);
  const stack = [];
  for (const [instruction, operand] of program) {
    if (instruction === 'i32.const') {
      stack.push(operand); // una constante solo se apila
    } else {
      const right = stack.pop(); // el último que entró es el operando de la derecha
      const left = stack.pop();
      stack.push(instruction === 'i32.add' ? (left + right) | 0 : Math.imul(left, right));
    }
    const text = operand === undefined ? instruction : `${instruction} ${operand}`;
    console.log(`${text.padEnd(12)} → [${stack.join(', ')}]`);
  }
  return stack.pop();
}

// Primero los operandos, después la operación (notación postfija): no hacen falta
// paréntesis, porque el orden de las instrucciones ya dice qué se calcula antes.
const first = run('(2 + 3) * 4', [['i32.const', 2], ['i32.const', 3], ['i32.add'], ['i32.const', 4], ['i32.mul']]);
const second = run('2 + 3 * 4', [['i32.const', 2], ['i32.const', 3], ['i32.const', 4], ['i32.mul'], ['i32.add']]);
console.log('resultados →', first, second);

// La primera secuencia, dentro de un módulo de verdad:
//   (module
//     (func (export "calc") (result i32)
//       i32.const 2
//       i32.const 3
//       i32.add
//       i32.const 4
//       i32.mul))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 05 01 60 00 01 7f 03 02 01 00 07 08 01 04 63
  61 6c 63 00 00 0a 0c 01 0a 00 41 02 41 03 6a 41 04 6c 0b
`);
const { instance } = await WebAssembly.instantiate(bytes);
console.log('calc() en WebAssembly →', instance.exports.calc());
// Al final de los bytes están las cinco instrucciones: 41 02 (i32.const 2), 41 03,
// 6a (i32.add), 41 04, 6c (i32.mul), y 0b (end, el final de la función).

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// Python: el bytecode de CPython también es una máquina de pila. Prueba
//   import dis; dis.dis(lambda x: (x + 3) * 4)
// y verás LOAD_FAST x, LOAD_CONST 3, BINARY_OP (+), LOAD_CONST 4, BINARY_OP (*).
```
