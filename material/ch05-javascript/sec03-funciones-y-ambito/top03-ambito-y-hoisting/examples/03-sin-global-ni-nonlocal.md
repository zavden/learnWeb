---
example_description: "Una función puede asignar variables de fuera sin declarar nada: JavaScript no necesita global ni nonlocal"
example_tags: "javascript|python|ambito|nonlocal|global"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una función puede LEER y también ASIGNAR las variables de los ámbitos de fuera.
let visits = 0;

function registerVisit() {
  visits += 1; // asigna la variable global: no hace falta declarar nada
}
registerVisit();
registerVisit();
console.log('visits →', visits); // 2

// En Python, «visits += 1» dentro de la función lanzaría UnboundLocalError
// salvo que escribieras «global visits» antes.

// Con funciones anidadas pasa lo mismo: Python pide nonlocal, JavaScript no.
function scoreQuiz(answers, correct) {
  let score = 0;
  function check(answer, index) {
    if (answer === correct[index]) score += 1; // Python: nonlocal score
  }
  answers.forEach(check);
  return score;
}
console.log('scoreQuiz →', scoreQuiz(['b', 'a', 'd'], ['b', 'c', 'd'])); // 2

// La regla de JavaScript es sintáctica y no depende de si asignas o no:
//   - con let / const / var delante → creas una variable NUEVA en ese ámbito;
//   - sin nada delante → asignas a la que encuentre la cadena de ámbitos.
let theme = 'claro';
function previewDarkTheme() {
  let theme = 'oscuro'; // variable NUEVA y local: la global queda intacta
  return theme;
}
console.log('previewDarkTheme() →', previewDarkTheme()); // 'oscuro'
console.log('theme →', theme);                           // 'claro'

// En Python la regla es al revés: asignar (=, +=) dentro de una función crea
// una local salvo que digas global/nonlocal. Por eso un descuido en JavaScript
// modifica la variable de fuera… como verás en el siguiente ejemplo.
```
