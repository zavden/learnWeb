---
example_description: "Los métodos set de Date modifican el objeto aunque esté en una const; para sumar días crea una copia y usa setDate, que ajusta el mes solo"
example_tags: "javascript|date|mutabilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const invoiceDate = new Date(2026, 0, 30);        // 30 de enero (hora local)

// 🐛 «Calculo» el vencimiento… y modifico la fecha de la factura.
const dueDate = invoiceDate;                      // misma referencia, no una copia
dueDate.setDate(dueDate.getDate() + 30);
console.log('factura →', invoiceDate.toDateString());   // ¡también ha cambiado!

// ✅ Copia primero: new Date(fecha) crea un Date nuevo con el mismo instante.
const issued = new Date(2026, 0, 30);
const due = new Date(issued);
due.setDate(due.getDate() + 30);                  // 30 + 30 = 60 → setDate lo pasa a marzo
console.log('emitida →', issued.toDateString());  // Fri Jan 30 2026
console.log('vence →', due.toDateString());       // Sun Mar 01 2026

// 🐛 Sumar 24 horas en milisegundos no es lo mismo que sumar un día cuando hay cambio
//    de hora: en España, el 29 de marzo de 2026 a las 2:00 se pasa a las 3:00 y ese día dura 23 h.
//    Lo mostramos en la zona Europe/Madrid con Intl para que salga igual en cualquier ordenador
//    (en zonas sin horario de verano, como Ciudad de México desde 2022, este error no se ve).
const madridTime = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});
const beforeDst = new Date('2026-03-28T12:00:00+01:00');            // sábado 28, 12:00 en Madrid
const plus24h = new Date(beforeDst.getTime() + 24 * 60 * 60 * 1000);
console.log('Madrid, antes →', madridTime.format(beforeDst));       // sáb 28, 12:00
console.log('Madrid, +24 h →', madridTime.format(plus24h));         // dom 29, 13:00 (¡una hora de más!)

// ✅ setDate suma un día de CALENDARIO y conserva la hora local, dure ese día 23, 24 o 25 horas.
const localNoon = new Date(2026, 2, 28, 12, 0);                    // 28 de marzo, 12:00 en TU zona
const nextDay = new Date(localNoon);
nextDay.setDate(nextDay.getDate() + 1);
console.log('tu zona, +1 día →', nextDay.toTimeString().slice(0, 5));   // 12:00 en cualquier zona
```
