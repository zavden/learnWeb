---
example_description: "En Date los meses van de 0 a 11 (y los días de la semana empiezan en domingo = 0); los valores fuera de rango se desbordan sin error"
example_tags: "javascript|date|meses|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Quieres el 5 de marzo de 2026 y escribes el mes 3…
const wrong = new Date(2026, 3, 5);
console.log('new Date(2026, 3, 5) →', wrong.toDateString());   // Sun Apr 05 2026: ¡abril!

// Los meses van de 0 (enero) a 11 (diciembre). Los días del mes, en cambio, empiezan en 1.
const right = new Date(2026, 2, 5);
console.log('new Date(2026, 2, 5) →', right.toDateString());   // Thu Mar 05 2026
console.log('getMonth() →', right.getMonth(), '(marzo)');       // 2

// 🐛 Un valor fuera de rango no da error: se desborda al mes siguiente.
console.log('30 de febrero →', new Date(2026, 1, 30).toDateString());   // Mon Mar 02 2026

// 🐛 getDay() es el día de la SEMANA, y empieza en domingo = 0. getDate() es el día del MES.
const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
console.log('getDay() →', right.getDay(), '=', days[right.getDay()]);   // 4 = jueves
console.log('getDate() →', right.getDate());                            // 5

// > Desde Python: date(2026, 3, 5) es el 5 de marzo y date(2026, 2, 30) lanza ValueError.
```
