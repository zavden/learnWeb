---
example_description: "True, None, len() y print(): costumbres de Python que en JavaScript fallan o hacen otra cosa"
example_tags: "javascript|python|referenceerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Costumbres de Python que en JavaScript fallan… o hacen otra cosa.

// True, False y None no existen: se escriben true, false y null.
try {
  const ready = True;
  console.log(ready);
} catch (error) {
  console.log('True →', error.name, '|', error.message); // True is not defined
}
console.log('✅ true →', true, '| null →', null);

// len() no existe: la longitud es una propiedad.
try {
  console.log(len('hola'));
} catch (error) {
  console.log('len() →', error.name, '|', error.message); // len is not defined
}
console.log('✅ "hola".length →', 'hola'.length);

// print() SÍ existe… y es otra cosa: window.print() abre el diálogo de impresión.
// Por eso aquí solo la mostramos, sin llamarla.
console.log('print →', print);

// and / or / not no son operadores: son &&, || y !
const isAdult = true;
const hasTicket = false;
console.log('✅ isAdult && !hasTicket →', isAdult && !hasTicket); // true

// Escribir elif o «a and b» ni siquiera llega a ejecutarse:
// es un SyntaxError y el script entero se queda sin ejecutar.
```
