---
example_description: "switch con break y default; compara con === y no convierte tipos"
example_tags: "javascript|python|control-de-flujo|switch"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// switch compara un valor con una lista de casos.
// Cada case termina con break; default se ejecuta si ninguno coincide.
const command = 'stop';

switch (command) {
  case 'start':
    console.log('Arrancando…');
    break;
  case 'stop':
    console.log('Deteniendo…');
    break;
  default:
    console.log('Orden desconocida:', command);
}

// switch compara con === : no convierte tipos.
const choice = '1'; // por ejemplo, el value de un <select>: siempre es texto
switch (choice) {
  case 1:
    console.log('Opción 1');
    break;
  default:
    console.log("'1' no es === 1 → cae en default");
}

// ✅ Convierte antes de comparar si los casos son números:
switch (Number(choice)) {
  case 1:
    console.log('Number(choice) → Opción 1');
    break;
  default:
    console.log('no coincide');
}

// Python 3.10+ tiene match/case, pero sin break: cada case termina solo.
```
