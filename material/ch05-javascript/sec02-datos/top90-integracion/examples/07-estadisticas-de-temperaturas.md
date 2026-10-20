---
example_description: "Estadísticas de una estación meteorológica: lecturas de texto validadas, mediana con comparador numérico, -0 al mostrar y unidades con Intl.NumberFormat"
example_tags: "javascript|integracion|numeros|arrays|intl|nan"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// ESTADÍSTICAS DIARIAS de una estación meteorológica de montaña.
// Integra: Number, Number.isFinite y -0 («Números»), replace y trim («Strings»),
// filter/reduce/toSorted y spread («Arrays»), Map («Map y Set») e Intl («Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const readings = [
  { time: '00:00', value: '-1,5' },
  { time: '03:00', value: '-2.25' },
  { time: '06:00', value: '-0,5' },
  { time: '09:00', value: '3' },
  { time: '12:00', value: '11' },
  { time: '15:00', value: '12,5' },
  { time: '18:00', value: '7' },
  { time: '21:00', value: 'ERR' },  // el sensor falló
  { time: '22:00', value: '' },     // sin dato
  { time: '23:00', value: '999' },  // valor imposible
];
const yesterdayMean = 4.2;

// Devuelve el número o un motivo de descarte (texto). Number('') sería 0: se mira antes.
function parseReading(text) {
  const clean = text.trim().replace(',', '.');
  if (clean === '') return 'vacía';
  const value = Number(clean);
  if (!Number.isFinite(value)) return 'no numérica'; // descarta NaN e Infinity
  if (value < -60 || value > 60) return 'fuera de rango';
  return value;
}

const values = [];
const discarded = new Map(); // motivo → horas
for (const { time, value } of readings) {
  const result = parseReading(value);
  if (typeof result === 'number') {
    values.push(result);
  } else {
    if (!discarded.has(result)) discarded.set(result, []); // como un defaultdict(list)
    discarded.get(result).push(time);
  }
}
console.log('válidas →', values);
console.log('descartadas →', discarded);

// 🐛 Sin comparador, toSorted ordena como TEXTO: '11' y '12.5' quedan antes que '3'.
const textOrder = values.toSorted();
const numericOrder = values.toSorted((a, b) => a - b);
console.log('🐛 toSorted() →', textOrder);
console.log('✅ toSorted((a, b) => a - b) →', numericOrder);
function median(sorted) {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
console.log('🐛 mediana →', median(textOrder), '| ✅ mediana →', median(numericOrder));

// Mínimo, máximo y media. Math.min recibe valores sueltos: spread del array.
const min = Math.min(...values);
const max = Math.max(...values);
const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

const celsius = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'celsius', maximumFractionDigits: 1 });
console.log(`mín ${celsius.format(min)} · máx ${celsius.format(max)} · amplitud ${celsius.format(max - min)}`);
console.log('media →', celsius.format(mean), '| horas bajo cero →', values.filter((value) => value < 0).length);

// 🐛 El cambio respecto a ayer es -0.02…: redondeado a 1 decimal es -0, e Intl escribe el signo.
const change = mean - yesterdayMean;
console.log('🐛 cambio →', celsius.format(change));
// ✅ Redondea tú y cambia -0 por 0 (-0 es falsy, así que || 0 lo sustituye).
const shownChange = Math.round(change * 10) / 10 || 0;
console.log('✅ cambio →', celsius.format(shownChange), '| ¿era -0? →', Object.is(Math.round(change * 10) / 10, -0));
```
