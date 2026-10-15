---
example_description: "Un bucle infinito a propósito: la guarda de LearnWeb lo detiene a los ~1,2 s con un RangeError"
example_tags: "javascript|control-de-flujo|bucle-infinito|learnweb|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// ⚠️ Este ejemplo se queda «colgado» A PROPÓSITO durante ~1,2 segundos.
//
// Un bucle cuya condición nunca se vuelve falsa no termina jamás.
// En una página normal, la pestaña se congelaría: mientras un script se
// ejecuta, el navegador no puede pintar ni responder a clics.
//
// LearnWeb añade a cada bucle una «guarda» que lo detiene tras ~1,2 s con
// un RangeError. Es una ayuda de LearnWeb, NO parte de JavaScript.
console.log('Antes del bucle');

let countdown = 10;
while (countdown > 0) {
  countdown++; // 🐛 debería ser countdown--: el contador se aleja de 0
}

// El error rojo «RangeError: Possible infinite loop at line …» corta el
// script aquí, sin atrapar y a propósito: esta línea no se ejecuta.
console.log('Esto no se imprime nunca');
```
