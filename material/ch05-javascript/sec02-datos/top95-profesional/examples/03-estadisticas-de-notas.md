---
example_description: "Estadísticas de un grupo de clase: media ponderada en enteros para no suspender a nadie por un error binario, mediana, percentiles, desviación típica y distribución"
example_tags: "javascript|profesional|estadistica|numeros|redondeo|intl"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// ESTADÍSTICAS DE LA 1.ª EVALUACIÓN · Matemáticas II · 2.º de Bachillerato B.
//
// Reglas del departamento:
// - Nota final = 60 % examen + 30 % prácticas + 10 % participación, redondeada a una
//   décima (las centésimas .x5 suben). Se aprueba con 5,0.
// - «NP» (no presentado) en el examen deja la evaluación como NP; en prácticas o
//   participación cuenta como 0. Una casilla VACÍA es un error de quien puso las notas.
//
// Decisión clave: las notas se pasan a DÉCIMAS enteras (4,1 → 41) y los pesos a
// porcentajes enteros (60, 30, 10). Así la media ponderada es exacta: con decimales,
// 0.6 * 4.1 + 0.3 * 6.3 + 0.1 * 6 da 4.949999999999999 y un 4,95 (aprobado) se
// redondea a 4,9 (suspenso).
//
// Alcance: function y las flechas, en «Funciones y ámbito».

const WEIGHTS = { exam: 60, labs: 30, participation: 10 }; // porcentajes enteros

const GRADEBOOK = [
  { student: 'Aitana Romero', exam: '7,5', labs: '8', participation: '9' },
  { student: 'Óscar Benítez', exam: '4,1', labs: '6,3', participation: '6' },
  { student: 'Lucía Navarro', exam: '9,2', labs: '9,8', participation: '10' },
  { student: 'Wei Chen', exam: '9,5', labs: '9', participation: '9' },
  { student: 'Martina García', exam: '5', labs: '4,5', participation: '7' },
  { student: 'Hugo Fernández', exam: 'NP', labs: '7', participation: '5' },
  { student: 'Nerea Etxeberria', exam: '6,8', labs: '7,2', participation: '8' },
  { student: 'Iker Sánchez', exam: '3,2', labs: '5', participation: '4' },
  { student: 'Valentina Ríos', exam: '8,1', labs: '7,9', participation: '6' },
  { student: 'Mateo López', exam: '4,4', labs: '5,1', participation: '8' },
  { student: 'Sofía Martín', exam: '6', labs: '6,5', participation: '7' },
  { student: 'Daniel Ortega', exam: '2,5', labs: 'NP', participation: '3' },
  { student: 'Carmen Ruiz', exam: '7', labs: '', participation: '8' },
  { student: 'Pau Vidal', exam: '10,5', labs: '8', participation: '9' },
];

// ── Conversión ──────────────────────────────────────────────────────────

// '6,3' → 63 décimas; 'NP' → null. Lanza error con lo que no es una nota.
function parseTenths(text, field) {
  const clean = text.trim().toUpperCase();
  if (clean === '') throw new TypeError(`falta la nota de ${field}`);
  if (clean === 'NP') return null;
  const grade = Number(clean.replace(',', '.'));
  if (!Number.isFinite(grade) || grade < 0 || grade > 10) {
    throw new RangeError(`«${text}» no es una nota de 0 a 10 (${field})`);
  }
  const tenths = Math.round(grade * 10);
  if (Math.abs(grade * 10 - tenths) > 1e-9) throw new RangeError(`«${text}» tiene más de un decimal (${field})`);
  return tenths;
}

// Media ponderada exacta: décimas × porcentaje = milésimas; /100 y redondeo → décimas.
function finalTenths(exam, labs, participation) {
  if (exam === null) return null; // NP en el examen
  const thousandths = exam * WEIGHTS.exam + (labs ?? 0) * WEIGHTS.labs + (participation ?? 0) * WEIGHTS.participation;
  return Math.round(thousandths / 100);
}

function label(tenths) {
  if (tenths === null) return 'No presentado';
  if (tenths < 50) return 'Suspenso';
  if (tenths < 70) return 'Aprobado';
  if (tenths < 90) return 'Notable';
  return 'Sobresaliente';
}

const results = [];
const problems = [];
for (const row of GRADEBOOK) {
  try {
    const exam = parseTenths(row.exam, 'examen');
    const labs = parseTenths(row.labs, 'prácticas');
    const participation = parseTenths(row.participation, 'participación');
    results.push({ student: row.student, exam, labs, participation, final: finalTenths(exam, labs, participation) });
  } catch (error) {
    problems.push(`${row.student}: ${error.message}`);
  }
}

// ── Formatos ────────────────────────────────────────────────────────────

const oneDecimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const twoDecimals = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 });
function grade(tenths) {
  return tenths === null ? 'NP' : oneDecimal.format(tenths / 10);
}

// ── Listado del grupo ───────────────────────────────────────────────────

const collator = new Intl.Collator('es');
console.log('1.ª EVALUACIÓN · Matemáticas II · 2.º de Bachillerato B');
console.table(results.toSorted((a, b) => collator.compare(a.student, b.student)).map((result) => ({
  alumno: result.student,
  examen: grade(result.exam),
  prácticas: grade(result.labs),
  participación: grade(result.participation),
  final: grade(result.final),
  calificación: label(result.final),
})));
if (problems.length > 0) {
  console.warn(`Notas por revisar antes de publicar:\n  ${problems.join('\n  ')}`);
}

// 🐛 La misma cuenta con decimales: ¿a quién le cambia la nota?
for (const result of results) {
  if (result.final === null) continue;
  const floatFinal = 0.6 * (result.exam / 10) + 0.3 * ((result.labs ?? 0) / 10) + 0.1 * ((result.participation ?? 0) / 10);
  const floatRounded = Number(floatFinal.toFixed(1));
  if (floatRounded * 10 !== result.final) {
    console.log(`🐛 ${result.student}: con decimales ${floatFinal} → ${grade(floatRounded * 10)} (${label(floatRounded * 10)})` +
      ` · en enteros → ${grade(result.final)} (${label(result.final)})`);
  }
}

// ── Estadística (solo presentados) ──────────────────────────────────────

const finals = results.filter((result) => result.final !== null).map((result) => result.final / 10);
const sorted = finals.toSorted((a, b) => a - b); // comparador numérico: sin él, '10' < '9'
const n = sorted.length;
const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
// Desviación típica poblacional: raíz de la media de los cuadrados de las distancias.
const stdDev = Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n);

// Percentil con interpolación lineal (el método por defecto de NumPy y PERCENTIL.INC de Excel).
function percentile(values, p) {
  const rank = p * (values.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  return values[lower] + (rank - lower) * (values[upper] - values[lower]);
}

console.group(`Estadística de ${n} presentados`);
console.log(`media ${twoDecimals.format(mean)} · desviación típica ${twoDecimals.format(stdDev)}`);
console.log(`mínima ${oneDecimal.format(sorted[0])} · máxima ${oneDecimal.format(sorted.at(-1))}`);
console.log(`P25 ${twoDecimals.format(percentile(sorted, 0.25))} · mediana ${twoDecimals.format(percentile(sorted, 0.5))}` +
  ` · P75 ${twoDecimals.format(percentile(sorted, 0.75))} · P90 ${twoDecimals.format(percentile(sorted, 0.9))}`);
const passed = finals.filter((value) => value >= 5).length;
console.log(`aprobados ${passed} de ${n} (${percent.format(passed / n)})`);
console.groupEnd();

// Distribución por calificación, con una barra de texto.
const presented = results.filter((result) => result.final !== null);
const byLabel = Map.groupBy(presented, (result) => label(result.final));
console.group('Distribución');
for (const name of ['Suspenso', 'Aprobado', 'Notable', 'Sobresaliente']) {
  const count = byLabel.get(name)?.length ?? 0; // ?. por si un grupo no existe
  console.log(`${name.padEnd(14)}${'█'.repeat(count * 3).padEnd(16)}${count} (${percent.format(count / n)})`);
}
console.groupEnd();

// Mejores notas, con empates (puede haber más de un alumno con la máxima).
const best = Math.max(...presented.map((result) => result.final));
const bestStudents = presented.filter((result) => result.final === best).map((result) => result.student);
console.log(`Mejor nota (${grade(best)}): ${new Intl.ListFormat('es', { type: 'conjunction' }).format(bestStudents)}`);
```
