---
example_description: "console.table y console.group para ordenar la salida cuando hay muchos datos"
example_tags: "javascript|consola|console.table|console.group"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// console.table pinta un array de objetos como una tabla:
// una fila por elemento y una columna por propiedad.
const planets = [
  { name: 'Mercurio', diameterKm: 4879, rocky: true },
  { name: 'Tierra', diameterKm: 12742, rocky: true },
  { name: 'Júpiter', diameterKm: 139820, rocky: false },
];
console.table(planets);

// console.group abre un bloque con sangría; console.groupEnd lo cierra.
console.group('Grados Celsius → Fahrenheit');
console.log('0 °C =', 0 * 9 / 5 + 32, '°F');
console.log('37 °C =', 37 * 9 / 5 + 32, '°F');
console.log('100 °C =', 100 * 9 / 5 + 32, '°F');
console.groupEnd();

// groupCollapsed empieza plegado: haz clic en su título para abrirlo.
console.groupCollapsed('Detalles (plegados)');
console.log('Útil para que la información secundaria no tape lo importante');
console.groupEnd();

console.log('Fuera de los grupos otra vez');
```
