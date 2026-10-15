---
example_description: "Un Date guarda un único número: los milisegundos desde el 1 de enero de 1970 UTC. Restar fechas da milisegundos"
example_tags: "javascript|python|date|timestamp"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Por dentro, un Date es solo un número: milisegundos desde el «epoch» (1970-01-01T00:00:00Z).
const launch = new Date(Date.UTC(2026, 9, 12, 8, 30));   // Date.UTC: fecha en UTC
console.log('getTime() →', launch.getTime());
console.log('toISOString() →', launch.toISOString());     // siempre en UTC (la Z final)

// Date.now(): el instante actual en milisegundos, sin crear un objeto.
console.log('typeof Date.now() →', typeof Date.now());

// Restar dos fechas las convierte en números: el resultado son milisegundos.
const deadline = new Date(Date.UTC(2026, 9, 26, 8, 30));
const ms = deadline - launch;
const DAY = 24 * 60 * 60 * 1000;
console.log('diferencia →', ms, 'ms =', ms / DAY, 'días');   // 14 días

// > Desde Python: datetime guarda año, mes, día…; Date guarda un timestamp y calcula
//   el año, el mes o la hora cada vez que se lo pides, según la zona horaria.
```
