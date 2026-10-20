---
example_description: "Un analizador de logs en flujo: un registro de servidor infinito (azar con semilla), análisis línea a línea sin expresiones regulares, agrupación por minuto como itertools.groupby, ventanas deslizantes, detección del primer incidente y cuántas líneas hizo falta generar"
example_tags: "javascript|profesional|generadores|iterator-helpers|perezoso|logs|streaming"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// ANALIZADOR DE LOGS DE UN SERVIDOR WEB, en flujo.
//
// Decisiones:
// - El log es un generador INFINITO (como un `tail -f`): nunca se guarda entero.
//   Cada etapa es otro generador o un helper, y solo se procesa lo que se pide.
// - El azar tiene semilla (Lehmer) y el reloj es simulado: la salida es la
//   misma en cualquier navegador y zona horaria (toISOString siempre usa UTC).
// - Las líneas se analizan con split, sin expresiones regulares; las mal
//   formadas se cuentan y se descartan sin detener el flujo.
// - groupByMinute es un groupby en flujo: agrupa líneas CONSECUTIVAS del mismo
//   minuto y entrega cada grupo en cuanto empieza el siguiente.
// - Las métricas (tasa de error, p95 de latencia) se calculan por minuto y en
//   ventanas deslizantes de 3 minutos para suavizar los picos.
//
// Alcance: módulos 1-6.

function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/productos', weight: 5, latency: 80 },
  { method: 'GET', path: '/api/productos/{id}', weight: 4, latency: 60 },
  { method: 'POST', path: '/api/carrito', weight: 2, latency: 120 },
  { method: 'POST', path: '/api/pagos', weight: 1, latency: 400 },
  { method: 'GET', path: '/salud', weight: 1, latency: 5 },
];
const TOTAL_WEIGHT = ENDPOINTS.reduce((sum, endpoint) => sum + endpoint.weight, 0);
const START = Date.UTC(2026, 9, 13, 14, 0, 0); // 13 oct 2026, 14:00 UTC
const INCIDENT = { from: 7, to: 9 }; // minutos en los que la pasarela de pagos falla

const counters = { generated: 0, malformed: 0 };

// ── 1. La fuente: un log infinito ──────────────────────────────────────────
function* serverLog(seed) {
  const random = createRandom(seed);
  let clock = START;
  while (true) {
    clock += Math.floor(random() * 3000);
    counters.generated += 1;
    const minute = Math.floor((clock - START) / 60000);
    let pick = random() * TOTAL_WEIGHT;
    const endpoint = ENDPOINTS.find((candidate) => (pick -= candidate.weight) < 0);
    const failing = endpoint.path === '/api/pagos' && minute >= INCIDENT.from && minute <= INCIDENT.to;
    const status = failing && random() < 0.9 ? 502 : random() < 0.02 ? 404 : 200;
    const latency = Math.round(endpoint.latency * (0.5 + random()) * (failing ? 6 : 1));
    const timestamp = new Date(clock).toISOString().slice(0, 19) + 'Z';
    const line = `${timestamp} ${endpoint.method} ${endpoint.path} ${status} ${latency} ms`;
    // Cada cierto tiempo, una línea cortada (un proceso que escribió a medias).
    yield random() < 0.01 ? line.slice(0, 25) : line;
  }
}

// ── 2. Análisis línea a línea ──────────────────────────────────────────────
function* parseLines(lines) {
  for (const line of lines) {
    const [timestamp, method, path, status, latency, unit] = line.split(' ');
    if (unit !== 'ms' || timestamp.length !== 20) {
      counters.malformed += 1;
      continue;
    }
    yield { timestamp, minute: timestamp.slice(11, 16), method, path, status: Number(status), latency: Number(latency) };
  }
}

// ── 3. Agrupar por minuto en flujo (itertools.groupby) ─────────────────────
function* groupByMinute(records) {
  let current = null;
  for (const record of records) {
    if (current && current.minute !== record.minute) {
      yield current;
      current = null;
    }
    current ??= { minute: record.minute, records: [] };
    current.records.push(record);
  }
  if (current) yield current;
}

function percentile(values, p) {
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function summarize({ minute, records }) {
  const errors = records.filter((record) => record.status >= 500).length;
  return {
    minute,
    requests: records.length,
    errors,
    errorRate: errors / records.length,
    p95: percentile(records.map((record) => record.latency), 95),
  };
}

function* windowed(iterable, size) {
  const recent = [];
  for (const item of iterable) {
    recent.push(item);
    if (recent.length > size) recent.shift();
    if (recent.length === size) yield [...recent];
  }
}

const percent = (rate) => `${(rate * 100).toFixed(1)} %`;
const minutes = (seed) => groupByMinute(parseLines(serverLog(seed))).map(summarize);

// ── Informe ────────────────────────────────────────────────────────────────
console.group('Muestra del log');
for (const line of serverLog(2026).take(4)) console.log(line);
console.groupEnd();

counters.generated = 0;
counters.malformed = 0;
const report = {};
for (const summary of minutes(2026).take(12)) {
  report[summary.minute] = {
    peticiones: summary.requests,
    'errores 5xx': summary.errors,
    'tasa de error': percent(summary.errorRate),
    'p95 (ms)': summary.p95,
  };
}
console.table(report);
console.log('líneas generadas →', counters.generated, '| mal formadas →', counters.malformed);

// Ventanas de 3 minutos: la tasa de error suavizada.
const smoothed = windowed(minutes(2026), 3)
  .map((group) => {
    const requests = group.reduce((sum, s) => sum + s.requests, 0);
    const errors = group.reduce((sum, s) => sum + s.errors, 0);
    return `${group[0].minute}-${group.at(-1).minute}: ${percent(errors / requests)}`;
  })
  .take(10)
  .toArray();
console.log('ventanas de 3 min →', smoothed.join(' · '));

// La primera alerta: find para el flujo en cuanto la encuentra.
counters.generated = 0;
const firstAlert = minutes(2026).find((summary) => summary.errorRate > 0.05);
console.log(`🚨 primer minuto con más del 5 % de errores → ${firstAlert.minute} (${percent(firstAlert.errorRate)}, p95 ${firstAlert.p95} ms)`);
console.log('   líneas que hizo falta generar →', counters.generated);

// Los endpoints más pedidos en los 10 primeros minutos (un Counter de Python).
const hits = new Map();
for (const { records } of groupByMinute(parseLines(serverLog(2026))).take(10)) {
  for (const { method, path } of records) hits.set(`${method} ${path}`, (hits.get(`${method} ${path}`) ?? 0) + 1);
}
const ranking = [...hits].toSorted((a, b) => b[1] - a[1]).slice(0, 3);
console.log('más pedidos →', ranking.map(([endpoint, count]) => `${endpoint} (${count})`).join(' · '));

// > Desde Python: groupByMinute es itertools.groupby (que también agrupa solo
//   elementos consecutivos), windowed es la receta sliding_window de itertools
//   y el ranking es Counter(...).most_common(3).
```
