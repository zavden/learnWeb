---
example_description: "Las declaraciones de función se elevan enteras: se pueden llamar antes de su línea, lo que permite escribir el código principal arriba y los detalles abajo"
example_tags: "javascript|python|hoisting|funciones|declaracion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Antes de ejecutar un ámbito, el motor registra sus declaraciones.
// Una DECLARACIÓN de función se registra ENTERA (nombre + cuerpo), así que
// se puede llamar en cualquier punto del ámbito, incluso antes de su línea.
console.log('formatDate →', formatDate('2026-10-12')); // '12/10/2026'

// Gracias a eso, un script se puede leer de arriba abajo: primero lo importante…
function main() {
  const sessions = [
    { title: 'CSS Grid a fondo', date: '2026-11-03', minutes: 90 },
    { title: 'Accesibilidad práctica', date: '2026-11-05', minutes: 60 },
  ];
  printAgenda(sessions);
  console.log('Duración total:', formatMinutes(totalMinutes(sessions)));
}
main(); // ← se llama aquí, y las funciones que usa están MÁS ABAJO

// …y debajo, los detalles.
function printAgenda(sessions) {
  for (const session of sessions) {
    console.log(`  ${formatDate(session.date)} · ${session.title} (${formatMinutes(session.minutes)})`);
  }
}
function totalMinutes(sessions) {
  return sessions.reduce((sum, session) => sum + session.minutes, 0);
}
function formatMinutes(minutes) {
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
function formatDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

// Lo mismo pasa dentro de cada función: sus declaraciones internas se registran
// al empezar CADA llamada.
function outer() {
  return inner(); // inner está más abajo, dentro de outer
  function inner() {
    return 'inner ya existía al empezar outer';
  }
}
console.log('outer() →', outer());

// > Desde Python: def es una sentencia que se ejecuta en su línea; llamar a una
//   función antes de su def lanza NameError. Por eso en Python main() va al final.
```
