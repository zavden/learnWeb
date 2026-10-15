---
example_description: "La configuración de una tienda cargada por capas y protegida con un Proxy: valida al cargar y al asignar, detecta erratas también al leer, deja pasar símbolos y toJSON, guarda sus metadatos en una clave Symbol.for y se bloquea con un método de clave symbol"
example_tags: "javascript|proxy|reflect|symbol|symbol-for|validacion|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LA CONFIGURACIÓN DE UNA TIENDA EN LÍNEA, cargada por capas (valores por
// defecto, archivo, entorno) y protegida con un Proxy.
// Lecciones: trampas get/set/deleteProperty con Reflect, claves symbol para
// los metadatos (Symbol.for, compartido) y un método «secreto» (Symbol local).
const META = Symbol.for('tienda.config.meta');
const LOCK = Symbol('tienda.config.lock');

const schema = {
  storeName: { type: 'string', default: 'Mi tienda' },
  currency: { type: 'string', oneOf: ['MXN', 'USD', 'EUR'], default: 'MXN' },
  taxRate: { type: 'number', min: 0, max: 0.3, default: 0.16 },
  pageSize: { type: 'number', integer: true, min: 5, max: 100, default: 20 },
  maintenance: { type: 'boolean', default: false },
};

class ConfigError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ConfigError';
    this.code = code;
  }
}

function validate(key, value) {
  const rule = schema[key];
  if (!rule) throw new ConfigError(`clave desconocida «${String(key)}»`, 'unknown-key');
  let problem = null;
  if (typeof value !== rule.type) problem = `debe ser de tipo ${rule.type}`;
  else if (rule.integer && !Number.isInteger(value)) problem = 'debe ser un entero';
  else if (value < rule.min || value > rule.max) problem = `fuera de ${rule.min}-${rule.max}`;
  else if (rule.oneOf && !rule.oneOf.includes(value)) problem = `debe ser ${rule.oneOf.join(', ')}`;
  if (problem) throw new ConfigError(`${key} = ${JSON.stringify(value)}: ${problem}`, 'bad-value');
}

function createConfig(...layers) {
  const data = {};
  const meta = { sources: {}, changes: 0, locked: false };
  for (const [key, rule] of Object.entries(schema)) {
    data[key] = rule.default;
    meta.sources[key] = 'por defecto';
  }
  for (const { source, values } of layers) {
    for (const [key, value] of Object.entries(values)) {
      validate(key, value); // una capa con un valor malo falla al CARGAR
      data[key] = value;
      meta.sources[key] = source;
    }
  }
  data[META] = meta;                         // claves symbol: fuera de JSON y de Object.keys
  data[LOCK] = () => { meta.locked = true; };

  return new Proxy(data, {
    get(target, key, receiver) {
      // Los símbolos y toJSON los lee el propio lenguaje (JSON, plantillas…): pasan.
      if (typeof key === 'symbol' || key === 'toJSON' || key in target) return Reflect.get(target, key, receiver);
      throw new ConfigError(`clave desconocida «${key}»`, 'unknown-key'); // erratas al LEER
    },
    set(target, key, value, receiver) {
      if (meta.locked) throw new ConfigError(`bloqueada: no se puede cambiar ${String(key)}`, 'locked');
      validate(key, value);
      meta.sources[key] = 'en ejecución';
      meta.changes += 1;
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      throw new ConfigError(`no se puede borrar ${String(key)}`, 'no-delete');
    },
  });
}

const config = createConfig(
  { source: 'config.json', values: { storeName: 'Café La Huasteca', pageSize: 24 } },
  { source: 'entorno', values: { maintenance: true } },
);

console.log('lecturas →', config.storeName, config.currency, config.taxRate, config.pageSize);
console.log('JSON →', JSON.stringify(config));
console.log('Object.keys →', Object.keys(config));
console.log('origen →', JSON.stringify(config[META].sources));

const attempts = {
  'leer config.pageSise': () => config.pageSise,
  'config.taxRate = 1.6': () => { config.taxRate = 1.6; },
  "config.currency = 'GBP'": () => { config.currency = 'GBP'; },
  'config.pageSize = 24.5': () => { config.pageSize = 24.5; },
  'config.theme = "oscuro"': () => { config.theme = 'oscuro'; },
  'delete config.currency': () => { delete config.currency; },
};
for (const [code, run] of Object.entries(attempts)) {
  try {
    run();
  } catch (error) {
    console.warn(`⛔ ${code} → [${error.code}] ${error.message}`);
  }
}

config.taxRate = 0.08; // válido: zona fronteriza
config[LOCK]();        // solo quien tiene el símbolo LOCK puede bloquear
try {
  config.taxRate = 0.16;
} catch (error) {
  console.warn(`⛔ tras bloquear → [${error.code}] ${error.message}`);
}

// Otra parte del programa llega a los metadatos con Symbol.for, sin importar nada:
const meta = config[Symbol.for('tienda.config.meta')];
console.log('cambios en ejecución →', meta.changes, '| bloqueada →', meta.locked, '| taxRate →', config.taxRate);

try {
  createConfig({ source: 'entorno', values: { pageSize: '20' } }); // las variables de entorno son texto
} catch (error) {
  console.warn(`⛔ al cargar → [${error.code}] ${error.message}`);
}
```
