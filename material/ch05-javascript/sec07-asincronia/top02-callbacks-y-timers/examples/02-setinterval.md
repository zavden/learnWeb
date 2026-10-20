---
example_description: "setInterval repite un callback cada cierto tiempo hasta que clearInterval lo detiene: la cuenta atrás de una oferta, que se para sola al llegar a cero"
example_tags: "javascript|setinterval|clearinterval|temporizadores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// La cuenta atrás de una oferta relámpago. Para no esperar de verdad, cada
// «segundo» de la oferta dura 100 ms.
const TICK_MS = 100;
let secondsLeft = 5;

console.log(`⚡ oferta: 2×1 en café de olla · termina en ${secondsLeft} s`);

// setInterval(callback, ms) ejecuta el callback cada ms milisegundos, una y
// otra vez, hasta que alguien llame a clearInterval con su identificador.
const countdownId = setInterval(() => {
  secondsLeft -= 1;
  if (secondsLeft > 0) {
    console.log(`   quedan ${secondsLeft} s`);
    return;
  }
  clearInterval(countdownId); // ⚠️ sin esto, seguiría para siempre
  console.log('⌛ oferta terminada');
}, TICK_MS);

// Un intervalo que nadie detiene sigue ejecutándose mientras la página esté
// abierta: gasta batería y, si cada tick crea datos, también memoria.
// Guarda SIEMPRE el identificador y decide cuándo parar.

// ¿Cuándo llega cada tick? Cada TICK_MS como MÍNIMO: si la página está
// ocupada, el tick espera (lección «El event loop»). Por eso esta cuenta atrás
// es frágil: en el ejemplo «Deriva de setInterval» verás cómo se desajusta y
// cómo hacerla exacta.
// > Desde Python: no hay un equivalente directo en asyncio; se escribe un
//   bucle con await asyncio.sleep(intervalo) (es lo que hará el setTimeout
//   recursivo de los ejemplos siguientes).
```
