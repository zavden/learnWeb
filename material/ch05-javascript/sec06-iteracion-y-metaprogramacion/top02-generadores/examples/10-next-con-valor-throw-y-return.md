---
example_description: "El generador también recibe: next(valor) es el resultado del yield en el que estaba pausado (el send() de Python, salvo que el primer valor se pierde), throw() lanza un error dentro y return() lo termina desde fuera"
example_tags: "javascript|python|generadores|next|throw|return|corrutinas"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Una media móvil: cada yield ENTREGA la media y RECIBE la siguiente lectura.
function* runningAverage() {
  let sum = 0;
  let count = 0;
  let average = null;
  while (true) {
    const reading = yield average; // aquí se pausa; next(x) hace que valga x
    sum += reading;
    count += 1;
    average = Math.round((sum / count) * 10) / 10;
  }
}

const average = runningAverage();
// 🤔 El primer next() solo arranca la función hasta el primer yield. Si le pasas
//    un valor, nadie lo recibe: se pierde sin aviso.
console.log('arranque →', average.next(99).value);
console.log('next(21) →', average.next(21).value);
console.log('next(23) →', average.next(23).value);
console.log('next(26) →', average.next(26).value);

// throw(error) lanza el error DENTRO del generador, en el yield donde está pausado.
// Si el generador lo atrapa, sigue funcionando.
function* printJobs(jobs) {
  for (const job of jobs) {
    try {
      yield `🖨️ imprimiendo ${job}`;
    } catch (error) {
      console.log(`  ⚠️ ${job} cancelado: ${error.message}`);
      yield `⏭️ salto ${job}`;
    }
  }
}
const printer = printJobs(['factura.pdf', 'menú.pdf', 'cartel.pdf']);
console.log(printer.next().value);
console.log(printer.throw(new Error('atasco de papel')).value);
console.log(printer.next().value);

// return(valor) termina el generador desde fuera (ejecutando sus finally) y
// devuelve { value: valor, done: true }.
const printer2 = printJobs(['ticket.pdf', 'recibo.pdf']);
printer2.next();
console.log('return() →', printer2.return('apagada'), '| después →', printer2.next());

// > Desde Python:
//   gen.send(x)        ← gen.next(x)   (el primer send debe ser None; aquí
//                                        cualquier valor se ignora en silencio)
//   gen.throw(exc)     ← gen.throw(error)
//   gen.close()        ← gen.return()  (close() no devuelve nada; return(v)
//                                        devuelve { value: v, done: true })
```
