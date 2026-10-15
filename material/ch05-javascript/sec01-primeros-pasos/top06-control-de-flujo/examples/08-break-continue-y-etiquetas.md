---
example_description: "break y continue, y las etiquetas para salir de dos bucles anidados a la vez"
example_tags: "javascript|python|control-de-flujo|break|continue|etiquetas"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// break sale del bucle; continue salta a la vuelta siguiente (como en Python).
for (let n = 1; n <= 10; n++) {
  if (n % 2 === 0) continue; // salta los pares
  if (n > 5) break;          // para al pasar de 5
  console.log('impar:', n);  // 1, 3, 5
}

// break solo sale del bucle MÁS INTERNO. Para salir de dos a la vez,
// pon una ETIQUETA (nombre:) al bucle exterior y usa «break etiqueta».
const grid = [
  [1, 2, 3],
  [4, 99, 6],
  [7, 8, 9],
];

search: for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === 99) {
      console.log(`99 encontrado en fila ${row}, columna ${col}`);
      break search; // sale de LOS DOS bucles
    }
    console.log('revisando', grid[row][col]);
  }
}

// «continue etiqueta» salta a la vuelta siguiente del bucle etiquetado.
rows: for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] % 2 === 0) {
      console.log(`fila ${row}: primer par = ${grid[row][col]}`);
      continue rows; // pasa directamente a la fila siguiente
    }
  }
}

// Python no tiene etiquetas: usarías una variable «found», una función con
// return o el for…else.
```
