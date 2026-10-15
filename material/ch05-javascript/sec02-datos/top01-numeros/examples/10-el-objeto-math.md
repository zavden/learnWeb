---
example_description: "El objeto Math frente al módulo math de Python: max/min con argumentos sueltos, clamp y enteros aleatorios"
example_tags: "javascript|python|numeros|math|random"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Math es un objeto global con constantes y funciones: no hace falta importarlo.
console.log('Math.PI →', Math.PI);                       // math.pi
console.log('Math.sqrt(2) →', Math.sqrt(2));             // math.sqrt(2)
console.log('Math.hypot(3, 4) →', Math.hypot(3, 4));     // math.hypot(3, 4) → 5
console.log('Math.abs(-7) →', Math.abs(-7));             // abs(-7)
console.log('Math.sign(-7) →', Math.sign(-7));           // -1
console.log('2 ** 10 →', 2 ** 10);                       // 1024 (también Math.pow(2, 10))
console.log('Math.log10(1000) →', Math.log10(1000));     // 3

// max y min reciben VALORES SUELTOS, no una lista.
console.log('Math.max(3, 17, 8) →', Math.max(3, 17, 8)); // 17
const temperatures = [14.2, 19.8, 11.5];
console.log('🐛 Math.max(temperatures) →', Math.max(temperatures));   // NaN: un array no es un número
// ✅ ... «desparrama» el array en argumentos sueltos (el *lista de Python).
// El spread se estudia en la lección «Arrays».
console.log('✅ Math.max(...temperatures) →', Math.max(...temperatures)); // 19.8
console.log('Math.max() →', Math.max()); // -Infinity: el máximo «de nada» (Python: max([]) lanza ValueError)

// Limitar un valor a un rango («clamp»): primero el mínimo, luego el máximo.
const requestedVolume = 140;
const volume = Math.min(Math.max(requestedVolume, 0), 100);
console.log('volumen limitado →', volume); // 100

// Math.random() da un decimal en [0, 1). Un entero entre min y max, ambos
// incluidos (el random.randint de Python):
const min = 1;
const max = 6;
const roll = Math.floor(Math.random() * (max - min + 1)) + min;
console.log('tirada del dado →', roll); // cambia en cada ejecución (pulsa ⟳)

// Math.random no admite semilla y no sirve para criptografía:
// para contraseñas o tokens, crypto.getRandomValues() o crypto.randomUUID().
console.log('crypto.randomUUID() →', crypto.randomUUID());
```
