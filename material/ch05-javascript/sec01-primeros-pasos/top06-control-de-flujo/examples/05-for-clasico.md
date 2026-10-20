---
example_description: "El for de tres partes (inicio; condición; actualización) y sus equivalencias con range() de Python"
example_tags: "javascript|python|control-de-flujo|for|range"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// for (inicio; condición; actualización) { … }
// Es el bucle «de contador»: el equivalente de for i in range(…).
for (let i = 0; i < 3; i++) {        // range(3) → 0, 1, 2
  console.log('i =', i);
}

// Las tres partes:
// 1. let i = 0  → se ejecuta UNA vez, antes de empezar
// 2. i < 3      → se comprueba ANTES de cada vuelta; si es falsy, el bucle termina
// 3. i++        → se ejecuta DESPUÉS de cada vuelta (i++ suma 1 a i)

for (let i = 2; i < 10; i += 3) {    // range(2, 10, 3) → 2, 5, 8
  console.log('de 3 en 3:', i);
}

for (let i = 3; i > 0; i--) {        // range(3, 0, -1) → 3, 2, 1
  console.log('cuenta atrás:', i);
}

// Recorrer un array por índice (cuando de verdad necesitas el índice):
const colors = ['rojo', 'verde', 'azul'];
for (let i = 0; i < colors.length; i++) {
  console.log(i, colors[i]);
}
// Para recorrer solo los valores, for…of es más claro (ejemplo 07).
```
