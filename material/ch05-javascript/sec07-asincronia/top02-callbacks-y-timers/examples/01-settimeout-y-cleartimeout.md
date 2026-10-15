---
example_description: "setTimeout programa un callback (con argumentos extra) y devuelve un identificador; clearTimeout lo cancela antes de que venza: una bandeja de salida con «Deshacer envío»"
example_tags: "javascript|settimeout|cleartimeout|temporizadores|callbacks"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una bandeja de salida con «Deshacer»: cada email se envía UNDO_MS después de
// pulsar «Enviar» (en un cliente de correo real son unos segundos).
const UNDO_MS = 300;

function send(to, subject) {
  console.log(`📤 enviado a ${to}: «${subject}»`);
}

function sendLater(to, subject) {
  // setTimeout(callback, ms, ...args): los argumentos extra se pasan al callback.
  // Devuelve un identificador: el «resguardo» para poder cancelarlo.
  const timerId = setTimeout(send, UNDO_MS, to, subject);
  console.log(`⏳ «${subject}» sale en ${UNDO_MS} ms (puedes deshacerlo)`);
  return timerId;
}

const invoiceTimer = sendLater('ana@example.com', 'Factura de octubre');
const wrongTimer = sendLater('equipo@example.com', 'Presupuesto con el adjunto equivocado');

// 100 ms después, el usuario pulsa «Deshacer» en el segundo email.
setTimeout(() => {
  clearTimeout(wrongTimer); // el callback ya no se ejecutará
  console.log('↩️ deshecho: «Presupuesto con el adjunto equivocado»');
}, 100);

// Cancelar un temporizador que ya se ejecutó (o un id que no existe) no hace
// nada ni lanza errores: puedes llamar a clearTimeout sin comprobar antes.
setTimeout(() => {
  clearTimeout(invoiceTimer);
  console.log('clearTimeout tarde → sin efecto ni error');
}, UNDO_MS + 50);

console.log('fin del script: los dos envíos están programados');

// Recuerda dos cosas de la lección «Formas de función»: se pasa la FUNCIÓN
// (send), no su resultado (send(...) la ejecutaría ahora mismo); y si pasas un
// método (order.ship), pierde su this (lección «La palabra clave this»).
// En el navegador, el identificador es un número entero positivo.
// > Desde Python: setTimeout es loop.call_later(segundos, fn, *args) de
//   asyncio, y clearTimeout(id) es handle.cancel().
```
