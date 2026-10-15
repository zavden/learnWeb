---
example_description: "'2026-03-10' se interpreta en UTC pero '2026-03-10T00:00' en hora local: el mismo día puede convertirse en el anterior"
example_tags: "javascript|date|zonas-horarias|iso|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Las salidas de los comentarios son para la zona Europe/Madrid (UTC+1 en marzo);
// donde cambian, se indica también la de Ciudad de México (UTC−6).
console.log('tu zona →', Intl.DateTimeFormat().resolvedOptions().timeZone);

// 🐛 Solo fecha (ISO): se interpreta como medianoche UTC.
const dateOnly = new Date('2026-03-10');
// 🐛 Fecha y hora sin zona: se interpreta como hora LOCAL.
const local = new Date('2026-03-10T00:00');

console.log('dateOnly en UTC →', dateOnly.toISOString());   // 2026-03-10T00:00:00.000Z
console.log('local en UTC →', local.toISOString());         // 2026-03-09T23:00:00.000Z (en Madrid)
                                                            // 2026-03-10T06:00:00.000Z (en CDMX)

// En una zona con UTC negativo (América), dateOnly cae el día ANTERIOR en hora local:
const formatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'America/Mexico_City' });
console.log('dateOnly en Ciudad de México →', formatter.format(dateOnly));   // lunes, 9 de marzo de 2026

// ✅ Sé explícito: Z (o un desfase como +01:00) para instantes, o Date.UTC / componentes
//    locales cuando construyas a partir de números.
console.log(new Date('2026-03-10T00:00:00Z').toISOString());
console.log(new Date('2026-03-10T00:00:00+01:00').toISOString());   // 2026-03-09T23:00:00.000Z
```
