---
example_description: "La división entera // de Python en JavaScript es un comentario: 7 // 2 vale 7"
example_tags: "javascript|python|comentarios|division|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 En Python, // es la división entera. En JavaScript, // empieza un comentario.
const pages = 7 // 2
console.log('7 // 2 →', pages); // 7: «// 2» era un comentario, y no hay error

// ✅ JavaScript no tiene operador de división entera: divide y redondea.
console.log('7 / 2 →', 7 / 2);                         // 3.5 (como / en Python 3)
console.log('Math.floor(7 / 2) →', Math.floor(7 / 2)); // 3
console.log('Math.trunc(7 / 2) →', Math.trunc(7 / 2)); // 3

// Con negativos se ve la diferencia entre las dos funciones:
// - Math.floor redondea hacia abajo, como // en Python (-7 // 2 == -4).
// - Math.trunc corta los decimales (redondea hacia el cero).
console.log('Math.floor(-7 / 2) →', Math.floor(-7 / 2)); // -4
console.log('Math.trunc(-7 / 2) →', Math.trunc(-7 / 2)); // -3
```
