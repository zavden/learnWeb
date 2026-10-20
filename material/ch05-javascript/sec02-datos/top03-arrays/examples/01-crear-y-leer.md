---
example_description: "Crear y leer arrays: índices, at(-1), undefined fuera de rango, Array.isArray y Array.from como range()"
example_tags: "javascript|python|arrays|indices|array-from"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un array es una lista ordenada y mutable: el list de Python. Admite cualquier tipo.
const playlist = ['Intro', 'Verano', 'Lluvia', 'Final'];
console.log('playlist →', playlist);
console.log('length →', playlist.length);            // len(playlist)
console.log('playlist[0] →', playlist[0]);           // 'Intro'
console.log('playlist.at(-1) →', playlist.at(-1));   // 'Final' (playlist[-1] en Python)

// Fuera de rango no hay IndexError: se obtiene undefined y el programa sigue.
console.log('playlist[10] →', playlist[10]);   // undefined
console.log('playlist[-1] →', playlist[-1]);   // undefined: los corchetes no admiten negativos

// Se puede cambiar un elemento aunque la variable sea const (const no congela).
playlist[1] = 'Otoño';
console.log('tras playlist[1] = …  →', playlist);

// typeof no distingue arrays de objetos: usa Array.isArray.
console.log('typeof →', typeof playlist, '| Array.isArray →', Array.isArray(playlist));

// Array.from convierte en array cualquier cosa recorrible (el list() de Python):
console.log("Array.from('hola') →", Array.from('hola')); // ['h', 'o', 'l', 'a']

// El range(5) de Python: un array de 5 posiciones rellenado con su índice.
// Las funciones flecha se estudian en el módulo 3; aquí basta con leer
// (_, i) => i como lambda _, i: i (el _ es el valor, que no usamos).
console.log('Array.from({ length: 5 }, (_, i) => i) →', Array.from({ length: 5 }, (_, i) => i));
console.log('cuadrados →', Array.from({ length: 5 }, (_, i) => i * i)); // [i * i for i in range(5)]
// No hay listas por comprensión: se usan Array.from, map y filter (ejemplo 6).
```
