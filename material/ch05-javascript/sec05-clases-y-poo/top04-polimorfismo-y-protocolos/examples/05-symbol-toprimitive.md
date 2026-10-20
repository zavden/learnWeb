---
example_description: "Symbol.toPrimitive recibe la pista (number, string o default) de cada conversión y decide qué primitivo devolver; una tabla muestra qué pista usa cada operación"
example_tags: "javascript|python|protocolos|symbol-toprimitive|coercion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const hints = []; // apuntamos la pista de cada conversión

class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  // Un solo método para TODAS las conversiones a primitivo. Si existe, JavaScript
  // ya no llama ni a valueOf ni a toString para convertir.
  [Symbol.toPrimitive](hint) {
    hints.push(hint);
    if (hint === 'number') return this.celsius;      // contexto numérico
    if (hint === 'string') return `${this.celsius} °C`; // contexto de texto
    return `${this.celsius} °C`; // 'default' (+ y ==): aquí elegimos texto
  }
}

const today = new Temperature(21.5);

// Cada operación, su resultado y la pista que recibió el método:
const operations = {
  '`${today}`': () => `${today}`,
  'String(today)': () => String(today),
  '+today': () => +today,
  'today * 2': () => today * 2,
  'today > 20': () => today > 20,
  'Math.round(today)': () => Math.round(today),
  "'Hoy: ' + today": () => 'Hoy: ' + today,
  "today == '21.5 °C'": () => today == '21.5 °C',
};
const table = {};
for (const [code, run] of Object.entries(operations)) {
  hints.length = 0;
  const result = run();
  table[code] = { resultado: result, pista: hints.join(', ') };
}
console.table(table);

// Con 'default' devolviendo texto, + concatena (el bug del ejemplo anterior,
// resuelto); y las operaciones numéricas siguen funcionando con 'number'.

// > Desde Python: hint 'string' ≈ __str__ / __format__, hint 'number' ≈
//   __float__ / __int__. Pero no hay __add__: el + de JavaScript solo ve
//   el primitivo que devuelve este método (siguiente ejemplo).
```
