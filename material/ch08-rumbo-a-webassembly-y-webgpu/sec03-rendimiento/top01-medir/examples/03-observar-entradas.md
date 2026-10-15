---
example_description: "PerformanceObserver recibe las entradas de rendimiento cuando se producen, en una tarea posterior y por lotes; con buffered: true también recibe las que ya existían. PerformanceObserver.supportedEntryTypes dice qué tipos sabe observar el navegador"
example_tags: "javascript|rendimiento|performanceobserver|buffered|user-timing|entry-types"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un panel de ventas que mide cuánto tarda en cargar sus datos y en pintarse.
performance.mark('panel:inicio');
const sales = Array.from({ length: 5000 }, (_, i) => ({ day: i % 31, amount: 100 + (i * 37) % 900 }));
performance.mark('panel:datos');
performance.measure('panel:cargar-datos', 'panel:inicio', 'panel:datos');
console.log('1. medida «panel:cargar-datos» creada; todavía no observa nadie');

// El observador recibe una lista con las entradas nuevas. Con buffered: true recibe
// además las que ya estaban en el búfer: así no importa cuándo empieces a observar.
const observer = new PerformanceObserver((list, obs) => {
  const names = list.getEntries().map((entry) => `${entry.entryType} «${entry.name}»`).sort();
  console.log(`3. el observador recibe ${names.length} entradas → ${names.join(' y ')}`);
  obs.disconnect(); // deja de observar (como con los observers del capítulo 6)
  console.log('4. disconnect(): no recibirá más entradas');
});
observer.observe({ type: 'measure', buffered: true });

const totalByDay = new Array(31).fill(0);
for (const sale of sales) totalByDay[sale.day] += sale.amount;
console.log('ventas del día 1 →', totalByDay[1]);
performance.mark('panel:pintado');
performance.measure('panel:pintar', 'panel:datos', 'panel:pintado');

// ¿Qué tipos de entrada sabe observar este navegador? La lista crece con cada versión:
// pregunta por los que necesitas, no compares la lista entera.
const wanted = ['mark', 'measure', 'resource', 'longtask', 'long-animation-frame', 'event', 'largest-contentful-paint', 'layout-shift'];
const missing = wanted.filter((type) => !PerformanceObserver.supportedEntryTypes.includes(type));
console.log(`¿observa los ${wanted.length} tipos de esta lección? → ${missing.length === 0}${missing.length ? ` (faltan: ${missing.join(', ')})` : ''}`);

// El callback no se ejecuta dentro de measure(): llega en una tarea posterior, con todo
// lo que se haya acumulado (aquí, las dos medidas en un solo lote).
console.log('2. fin del script: «panel:pintar» creada; el observador aún no ha recibido nada');
```
