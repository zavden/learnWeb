---
example_description: "Cargador de configuración JSON: reviver que convierte duraciones y fechas y bloquea __proto__, validación con un esquema, sugerencias para claves mal escritas y valores por defecto"
example_tags: "javascript|profesional|json|validacion|reviver|seguridad"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// CARGADOR DE CONFIGURACIÓN de una tienda online (config.json).
//
// Un archivo de configuración lo escribe una persona: tendrá erratas, tipos
// equivocados ("8080" en vez de 8080) y valores fuera de rango. El cargador:
// 1. Lee el JSON dentro de try/catch y enseña el error con su posición.
// 2. Con un REVIVER convierte '30s' / '15m' en milisegundos, los textos ISO en Date
//    y descarta la clave "__proto__" (ver el 🐛 más abajo).
// 3. Valida cada valor contra un ESQUEMA (tipo, rango, valores permitidos) y reúne
//    TODOS los errores, no solo el primero. No convierte tipos a escondidas.
// 4. Avisa de claves desconocidas y sugiere la más parecida («¿quisiste decir…?»).
// 5. Completa lo que falta con valores por defecto, sección a sección.
//
// Alcance: function y las flechas, en «Funciones y ámbito»; prototipos, en «Objetos y
// prototipos».

const CONFIG_TEXT = `{
  "version": 2,
  "app": { "name": "Té y Café en Casa", "locale": "es-ES", "currency": "EUR" },
  "server": { "port": "8080", "host": "0.0.0.0", "timeout": "30s" },
  "cache": { "ttl": "15m", "maxEntries": 5000 },
  "maintenance": { "start": "2026-10-25T01:00:00+02:00", "end": "2026-10-25T04:00:00+01:00" },
  "features": ["wishlist", "gift-cards", "wishlist", "dark-mode"],
  "limits": { "maxUploadMB": 25, "maxCartItems": 0 },
  "shipping": { "freeFrom": 49.9, "zones": ["peninsula", "baleares", "ceuta"] },
  "paymnets": { "bizum": true },
  "__proto__": { "isAdmin": true }
}`;

// ── Esquema y valores por defecto ───────────────────────────────────────

const SCHEMA = new Map([
  ['version', { type: 'number', oneOf: new Set([2]) }],
  ['app.name', { type: 'string', required: true }],
  ['app.locale', { type: 'string', oneOf: new Set(['es-ES', 'ca-ES', 'en-GB', 'pt-PT']) }],
  ['app.currency', { type: 'string', oneOf: new Set(['EUR', 'GBP']) }],
  ['server.port', { type: 'number', integer: true, min: 1, max: 65535 }],
  ['server.host', { type: 'string' }],
  ['server.timeout', { type: 'duration', min: 1000, max: 120000 }],
  ['cache.ttl', { type: 'duration', min: 0, max: 24 * 60 * 60 * 1000 }],
  ['cache.maxEntries', { type: 'number', integer: true, min: 0 }],
  ['maintenance.start', { type: 'date' }],
  ['maintenance.end', { type: 'date' }],
  ['features', { type: 'array' }],
  ['limits.maxUploadMB', { type: 'number', integer: true, min: 1, max: 100 }],
  ['limits.maxCartItems', { type: 'number', integer: true, min: 1, max: 500 }],
  ['shipping.freeFrom', { type: 'number', min: 0 }],
  ['shipping.zones', { type: 'array', subsetOf: new Set(['peninsula', 'baleares', 'canarias']) }],
  ['payments.bizum', { type: 'boolean' }],
  ['payments.card', { type: 'boolean' }],
]);

const DEFAULTS = {
  app: { locale: 'es-ES', currency: 'EUR' },
  server: { port: 3000, host: 'localhost', timeout: 10000 },
  cache: { ttl: 5 * 60 * 1000, maxEntries: 1000 },
  limits: { maxUploadMB: 10, maxCartItems: 50 },
  payments: { bizum: false, card: true },
};

// ── 1 y 2. Leer con reviver ─────────────────────────────────────────────

const DURATION_UNITS = new Map([['ms', 1], ['s', 1000], ['m', 60 * 1000], ['h', 60 * 60 * 1000]]);
const DURATION_KEYS = new Set(['timeout', 'ttl']);
const DATE_KEYS = new Set(['start', 'end']);

// '30s' → 30000. Lanza RangeError si el formato no es número + unidad conocida.
function parseDuration(text) {
  const unit = text.endsWith('ms') ? 'ms' : text.at(-1);
  const amount = Number(text.slice(0, text.length - unit.length));
  if (!DURATION_UNITS.has(unit) || text.length === unit.length || !Number.isFinite(amount) || amount < 0) {
    throw new RangeError(`duración no válida «${text}» (usa 500ms, 30s, 15m o 2h)`);
  }
  return amount * DURATION_UNITS.get(unit);
}

const readErrors = []; // errores que encuentra el reviver
function reviver(key, value) {
  if (key === '__proto__') {
    readErrors.push('se ignora la clave "__proto__" (no se admite en la configuración)');
    return undefined; // devolver undefined BORRA la propiedad del resultado
  }
  if (DURATION_KEYS.has(key) && typeof value === 'string') {
    try {
      return parseDuration(value);
    } catch (error) {
      readErrors.push(`${key}: ${error.message}`);
      return value; // se queda como texto: el esquema lo marcará con el tipo equivocado
    }
  }
  if (DATE_KEYS.has(key) && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return value;
}

function loadConfig(text) {
  try {
    return JSON.parse(text, reviver);
  } catch (error) {
    console.warn(`config.json no es JSON válido: ${error.message}`);
    return null;
  }
}

// ── 3. Validar ──────────────────────────────────────────────────────────

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

// Lee 'server.port' solo entre propiedades PROPIAS (nada heredado como 'toString').
function getPath(object, path) {
  let current = object;
  for (const key of path.split('.')) {
    if (typeOf(current) !== 'object' || !Object.hasOwn(current, key)) return undefined;
    current = current[key];
  }
  return current;
}

function validate(config) {
  const errors = [];
  for (const [path, rule] of SCHEMA) {
    const value = getPath(config, path);
    if (value === undefined) {
      if (rule.required) errors.push(`${path}: es obligatorio`);
      continue; // lo opcional que falta lo pondrán los valores por defecto
    }
    const type = rule.type === 'duration' ? 'number' : rule.type;
    if (typeOf(value) !== type) {
      errors.push(`${path}: debe ser ${type}, pero es ${typeOf(value)} (${JSON.stringify(value)})`);
      continue;
    }
    if (rule.integer && !Number.isInteger(value)) errors.push(`${path}: debe ser un entero`);
    if (rule.min !== undefined && value < rule.min) errors.push(`${path}: ${value} es menor que ${rule.min}`);
    if (rule.max !== undefined && value > rule.max) errors.push(`${path}: ${value} es mayor que ${rule.max}`);
    if (rule.oneOf && !rule.oneOf.has(value)) errors.push(`${path}: «${value}» no es uno de ${[...rule.oneOf].join(', ')}`);
    if (rule.subsetOf) {
      const unknown = new Set(value).difference(rule.subsetOf);
      if (unknown.size > 0) errors.push(`${path}: valores desconocidos ${[...unknown].join(', ')}`);
    }
  }
  // Reglas que relacionan dos campos.
  const start = getPath(config, 'maintenance.start');
  const end = getPath(config, 'maintenance.end');
  if (start instanceof Date && end instanceof Date && end <= start) {
    errors.push('maintenance: el final debe ser posterior al inicio');
  }
  return errors;
}

// ── 4. Claves desconocidas y sugerencias ────────────────────────────────

// Distancia de edición (Levenshtein): cuántas letras hay que cambiar, añadir o quitar.
function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index); // [0, 1, 2, …] (_: valor sin usar)
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current.push(Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost));
    }
    previous = current;
  }
  return previous[b.length];
}

function describeUnknown(path, known) {
  const closest = [...known].toSorted((x, y) => editDistance(path, x) - editDistance(path, y))[0];
  const hint = editDistance(path, closest) <= 2 ? ` ¿Quisiste decir «${closest}»?` : '';
  return `clave desconocida «${path}».${hint}`;
}

function unknownKeys(config) {
  const known = new Set();
  for (const path of SCHEMA.keys()) {
    known.add(path.split('.')[0]).add(path); // 'server' y 'server.port'
  }
  const warnings = [];
  for (const [section, value] of Object.entries(config)) {
    if (!known.has(section)) {
      warnings.push(describeUnknown(section, known)); // sección entera desconocida
      continue;
    }
    if (typeOf(value) !== 'object') continue;
    for (const key of Object.keys(value)) {
      const path = `${section}.${key}`;
      if (!known.has(path)) warnings.push(describeUnknown(path, known));
    }
  }
  return warnings;
}

// ── 5. Valores por defecto (sección a sección, sin compartir objetos) ───

function withDefaults(config) {
  const result = structuredClone(config); // copia profunda: conserva las Date
  for (const [section, defaults] of Object.entries(DEFAULTS)) {
    result[section] = { ...defaults, ...result[section] }; // gana lo que escribió la persona
  }
  return result;
}

// ── Ejecución ───────────────────────────────────────────────────────────

loadConfig('{ "version": 2, }'); // coma final: muestra el mensaje con la posición

// 🐛 Por qué el reviver descarta "__proto__": JSON.parse la crea como propiedad normal,
// pero COPIARLA con una asignación cambia el prototipo del objeto destino.
const unsafe = JSON.parse('{ "__proto__": { "isAdmin": true }, "user": "marta" }');
const copied = {};
for (const [key, value] of Object.entries(unsafe)) {
  copied[key] = value; // copied['__proto__'] = … cambia el prototipo de copied
}
console.log('🐛 copied.isAdmin →', copied.isAdmin, '| ¿propia? →', Object.hasOwn(copied, 'isAdmin'));

const config = loadConfig(CONFIG_TEXT);
if (config !== null) {
  const errors = [...readErrors, ...validate(config)];
  const warnings = unknownKeys(config);
  const features = config.features ?? [];
  if (new Set(features).size !== features.length) {
    warnings.push(`features tiene repetidos: ${features.join(', ')}`);
  }

  console.group(`config.json: ${errors.length} errores, ${warnings.length} avisos`);
  for (const message of errors) console.warn('❌', message);
  for (const message of warnings) console.log('⚠', message);
  console.groupEnd();

  if (errors.length > 0) {
    console.warn('⛔ La tienda NO arrancaría con esta configuración. Vista previa solo para depurar:');
  }
  const effective = withDefaults(config);
  effective.features = [...new Set(features)]; // sin repetidos
  console.log('configuración efectiva →', effective);

  // Las duraciones ya son números y las fechas, Date: se usan sin volver a convertir.
  const { start, end } = effective.maintenance;
  const local = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: 'Europe/Madrid',
  });
  console.log(`mantenimiento: ${local.format(start)} → ${local.format(end)}`);
  // El reloj de pared dice 3 horas (01:00 → 04:00), pero esa noche se atrasa la hora.
  console.log('duración real →', (end - start) / (60 * 60 * 1000), 'horas');
  console.log('caché →', effective.cache.ttl / 60000, 'min | timeout →', effective.server.timeout / 1000, 's');
}
```
