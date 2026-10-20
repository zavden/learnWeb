---
example_description: "Una función con tres sobrecargas para describir una estancia (una tupla de dos fechas, dos fechas, o una fecha y un número de noches), una implementación que estrecha con instanceof y typeof, y fechas formateadas con Intl en UTC"
example_tags: "typescript|integracion|sobrecargas|tuplas|instanceof|typeof|intl"
example_stage: intermediate
example_importance: useful
console: true
---

# TypeScript

```typescript
type DateRange = readonly [start: Date, end: Date]; // lección 2

const DAY_MS = 86_400_000;
const shortDate = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });

// Tres formas de llamar, un solo tipo de retorno (lección 6: sobrecargas).
function describeStay(range: DateRange): string;
function describeStay(start: Date, end: Date): string;
function describeStay(start: Date, nights: number): string;
function describeStay(first: DateRange | Date, second?: Date | number): string {
  // Estrechar la primera forma con instanceof y la segunda con typeof (lección 4).
  let start: Date;
  let end: Date;
  if (first instanceof Date) {
    start = first;
    if (second instanceof Date) end = second;
    else if (typeof second === 'number') end = new Date(first.getTime() + second * DAY_MS);
    else throw new Error('Falta la fecha de salida o el número de noches');
  } else {
    [start, end] = first;
  }
  const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  if (nights < 1) throw new RangeError(`Una estancia necesita al menos 1 noche (hay ${nights})`);
  return `${shortDate.format(start)} → ${shortDate.format(end)} (${nights} ${nights === 1 ? 'noche' : 'noches'})`;
}

const checkIn = new Date('2026-12-24T00:00:00Z');
const checkOut = new Date('2026-12-27T00:00:00Z');

console.log('tupla        →', describeStay([checkIn, checkOut]));
console.log('dos fechas   →', describeStay(checkIn, checkOut));
console.log('fecha+noches →', describeStay(checkIn, 1));

try {
  describeStay(checkOut, checkIn); // las fechas al revés: compila, pero no tiene sentido
} catch (error) {
  console.log('⛔', String(error));
}
// describeStay(checkIn) sería un error de tipos: ninguna sobrecarga recibe solo una fecha.
// En ejecución solo existe la implementación:
console.log('parámetros en ejecución →', describeStay.length);
```
