---
example_description: "Sin punto y coma, una línea que empieza por ( o [ se pega a la anterior"
example_tags: "javascript|asi|punto-y-coma|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Si una línea empieza por ( o [ y la anterior no terminó en ;
// ASI NO inserta nada: el motor continúa la línea anterior.

// Caso 1: «(» convierte la línea anterior en una llamada a función.
try {
  const label = 'Total'
  (console.log('Esta línea parece independiente…'))
  // El motor leyó: const label = 'Total'(console.log('…'));
} catch (error) {
  console.log('Caso 1 →', error.name, '|', error.message); // "Total" is not a function
}

// Caso 2: «[» se lee como un acceso por índice… y sin ningún error.
const word = 'hola'
[1, 2, 3].length
// El motor leyó: const word = 'hola'[1, 2, 3].length;
// Dentro de [ ] la coma devuelve el último valor (3): 'hola'[3] es 'a',
// y 'a'.length es 1.
console.log('Caso 2 → word vale', word); // 1, no 'hola'

// ✅ Termina cada sentencia con ;
// (Los equipos que escriben sin ; empiezan esas líneas con ;( o ;[ )
```
