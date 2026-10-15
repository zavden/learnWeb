// REGISTROS DE UN SERVIDOR (ejemplo 05): generarlos, trocearlos en fichas
// (tokens) para resaltarlos, filtrarlos y resumirlos. Funciones puras: las usa el
// worker, y se pueden probar sin página.

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PATHS = ['/api/pedidos', '/api/productos', '/api/carrito', '/api/pagos', '/api/envios', '/static/app.js'];
const IPS = ['189.203.44.12', '201.141.8.77', '187.190.23.5', '200.68.140.3', '177.240.11.96', '148.204.63.21'];

// Una tienda en línea un martes: 40 000 peticiones, unas pocas lentas o con error.
export function generateLog(count, seed = 2026) {
  const random = mulberry32(seed);
  const start = Date.UTC(2026, 9, 13, 14, 0, 0);
  const lines = [];
  for (let i = 0; i < count; i++) {
    const time = new Date(start + i * 1500 + Math.floor(random() * 1000)).toISOString();
    const roll = random();
    const status = roll < 0.03 ? 503 : roll < 0.06 ? 404 : roll < 0.08 ? 500 : 200;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const method = random() < 0.8 ? 'GET' : 'POST';
    const path = `${PATHS[Math.floor(random() * PATHS.length)]}/${1000 + Math.floor(random() * 9000)}`;
    const slow = random() < 0.04;
    const duration = Math.floor(slow ? 500 + random() * 2500 : 8 + random() * 250);
    const ip = IPS[Math.floor(random() ** 2 * IPS.length)]; // unas IP piden mucho más que otras
    lines.push(`${time} ${level.padEnd(5)} ${status} ${method} ${path} ${duration}ms ${ip}`);
  }
  return lines;
}

// Las fichas que se resaltan. El orden importa: una IP empieza por cifras que, solas,
// parecerían un código de estado, así que se prueba antes.
const TOKEN = /(?<time>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)|(?<level>\b(?:ERROR|WARN|INFO|DEBUG)\b)|(?<ip>\b(?:\d{1,3}\.){3}\d{1,3}\b)|(?<status>\b[1-5]\d{2}\b)|(?<method>\b(?:GET|POST|PUT|PATCH|DELETE)\b)|(?<duration>\b\d+ms\b)/g;
export const KINDS = ['time', 'level', 'ip', 'status', 'method', 'duration'];

// Una línea → [inicio, fin, tipo, …] (tipo: índice en KINDS), en un array plano.
export function tokenize(line) {
  const tokens = [];
  for (const match of line.matchAll(TOKEN)) {
    const kind = KINDS.findIndex((name) => match.groups[name] !== undefined);
    tokens.push(match.index, match.index + match[0].length, kind);
  }
  return tokens;
}

// Un filtro a partir de lo que se escribe: «/regex/banderas» o palabras (todas, sin mayúsculas).
export function makeMatcher(query) {
  const regex = /^\/(.+)\/([a-z]*)$/.exec(query.trim());
  if (regex) {
    const pattern = new RegExp(regex[1], regex[2].replace('g', '')); // puede lanzar SyntaxError
    return (line) => pattern.test(line);
  }
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (line) => {
    const lower = line.toLowerCase();
    return terms.every((term) => lower.includes(term));
  };
}

export function summarize(lines) {
  const levels = { ERROR: 0, WARN: 0, INFO: 0 };
  const errorsByIp = new Map();
  const durations = [];
  for (const line of lines) {
    const level = /\b(ERROR|WARN|INFO)\b/.exec(line)?.[1];
    if (level) levels[level] += 1;
    const duration = /\b(\d+)ms\b/.exec(line);
    if (duration) durations.push(Number(duration[1]));
    const ip = /\b(?:\d{1,3}\.){3}\d{1,3}\b/.exec(line)?.[0];
    if (level === 'ERROR' && ip) errorsByIp.set(ip, (errorsByIp.get(ip) ?? 0) + 1);
  }
  durations.sort((a, b) => a - b);
  const p95 = durations.length > 0 ? durations[Math.min(durations.length - 1, Math.floor(durations.length * 0.95))] : null;
  const [worstIp = null, worstCount = 0] = [...errorsByIp].sort((a, b) => b[1] - a[1])[0] ?? [];
  return { lines: lines.length, levels, p95, worstIp, worstCount };
}
