---
example_description: "Intl.DateTimeFormat formatea fechas según idioma y zona horaria: es-ES, en-US, dateStyle, timeStyle y timeZone"
example_tags: "javascript|intl|fechas|formato|locale"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const meeting = new Date(Date.UTC(2026, 10, 3, 16, 30));   // 3 de nov. de 2026, 16:30 UTC

// Siempre con locale y zona EXPLÍCITOS: si no, depende del navegador del usuario.
const options = { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid' };
console.log('es-ES →', new Intl.DateTimeFormat('es-ES', options).format(meeting));
console.log('en-US →', new Intl.DateTimeFormat('en-US', options).format(meeting));
console.log('ja-JP →', new Intl.DateTimeFormat('ja-JP', options).format(meeting));

// La misma reunión vista desde otras zonas horarias:
for (const timeZone of ['Europe/Madrid', 'America/Bogota', 'Asia/Tokyo']) {
  const time = new Intl.DateTimeFormat('es-ES', { timeStyle: 'short', timeZone }).format(meeting);
  console.log(`${timeZone} →`, time);
}

// Campos sueltos en lugar de estilos:
const custom = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC',
});
console.log('personalizado →', custom.format(meeting));

// toLocaleDateString es un atajo para lo mismo (crea un formateador en cada llamada).
console.log('atajo →', meeting.toLocaleDateString('es-ES', { timeZone: 'UTC' }));
```
