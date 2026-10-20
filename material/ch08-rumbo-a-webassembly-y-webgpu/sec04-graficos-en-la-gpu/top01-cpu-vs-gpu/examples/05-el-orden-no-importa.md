---
example_description: "El modelo mental de un shader, en JavaScript: una función que depende solo de la posición da lo mismo en cualquier orden (por eso la GPU puede repartir los píxeles como quiera), mientras que un bucle que acumula de un píxel al siguiente cambia de resultado si cambia el orden. Como una operación vectorizada de numpy frente a np.cumsum"
example_tags: "javascript|python|numpy|gpu|shader|paralelismo|funcion-pura"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una fila de 8 píxeles y dos formas de calcular su brillo (0-255).
const WIDTH = 8;
const inOrder = [0, 1, 2, 3, 4, 5, 6, 7];
const shuffled = [5, 2, 7, 0, 3, 6, 1, 4]; // la GPU no promete ningún orden: imagina este

// 1. Como un shader: el valor de cada píxel sale SOLO de su posición.
const shade = (x) => Math.round((x / (WIDTH - 1)) * 255);
function runEach(order, fn) {
  const row = new Array(WIDTH);
  for (const x of order) row[x] = fn(x); // cada píxel, en el orden que toque
  return row.join(' ');
}
console.log('función, en orden    →', runEach(inOrder, shade));
console.log('función, desordenada →', runEach(shuffled, shade)); // idéntico

// 2. 🐛 Como un bucle con estado: «cada píxel, un poco más claro que el anterior».
let brightness = 0;
const accumulate = () => (brightness += 30);
console.log('acumulado, en orden    →', runEach(inOrder, accumulate));
brightness = 0;
console.log('acumulado, desordenado →', runEach(shuffled, accumulate)); // otro resultado

// Si el resultado depende del orden, no se puede repartir entre mil núcleos a la vez.
// Por eso GLSL no deja que un píxel vea lo que han calculado los demás.
// Desde Python, con numpy:
//   x = np.arange(8); np.round(x / 7 * 255)  → la forma «shader»: la misma operación en cada elemento
//   np.cumsum(np.full(8, 30))                → la forma acumulada: cada elemento necesita el anterior
console.log('Array.from, como np.vectorize →', Array.from({ length: WIDTH }, (_, x) => shade(x)).join(' '));
```
