---
example_description: "Ajustes de un lector de libros validados por un esquema: accesores generados en un prototipo compartido, valores que delegan en los de fábrica, almacenes no extensibles contra erratas, migración de datos antiguos e instantáneas congeladas"
example_tags: "javascript|profesional|accesores|delegacion|validacion|configuracion"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// AJUSTES DE UN LECTOR DE LIBROS ELECTRÓNICOS, validados por un esquema.
//
// Decisiones:
// - defineSettingsType(nombre, esquema) crea un TIPO de ajustes: un prototipo con un
//   accesor por cada clave del esquema, compartido por todos los almacenes de ese tipo,
//   que hereda de settingsMethods (set, reset, load, toJSON…).
// - Cada almacén guarda sus valores en un objeto que DELEGA en los de fábrica
//   (Object.create(defaults)): lo propio son los cambios del usuario y lo heredado, los
//   valores por defecto. Restablecer es borrar la propiedad propia.
// - Los valores de fábrica están congelados, así que una asignación no podría sombrearlos
//   (propiedad heredada de solo lectura): se escriben con defineProperty.
// - Los setters validan y normalizan ('20' → 20, 1.55 → 1.6 con paso 0.1). Un valor
//   igual al de fábrica no se guarda como cambio.
// - Los almacenes no son extensibles: una errata como settings.fontsize = 22 no crea una
//   propiedad nueva (en modo estricto, TypeError; en un script clásico, se ignora).
// - load() migra datos de versiones anteriores: renombra claves antiguas (aliases),
//   descarta las desconocidas y los valores no válidos, y devuelve la lista de problemas
//   en lugar de fallar a la primera.
// - snapshot() da los valores efectivos en un objeto congelado para el resto de la app.
//
// Alcance: módulos 1-4.

function deepFreeze(value) {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
  return value;
}
function defineHidden(target, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(target, key, { value, writable: true, enumerable: false, configurable: true });
  }
  return target;
}

const READER_SCHEMA = deepFreeze({
  theme: { type: 'enum', values: ['claro', 'sepia', 'oscuro'], default: 'claro', label: 'Tema' },
  font: { type: 'enum', values: ['serif', 'sans-serif', 'dislexia'], default: 'serif', label: 'Tipografía' },
  fontSize: { type: 'number', min: 12, max: 32, step: 1, default: 18, label: 'Tamaño de letra (px)', aliases: ['font_size'] },
  lineHeight: { type: 'number', min: 1.2, max: 2, step: 0.1, default: 1.5, label: 'Interlineado' },
  hyphenation: { type: 'boolean', default: true, label: 'Separación silábica' },
  dailyGoal: { type: 'number', min: 0, max: 240, step: 5, default: 20, label: 'Objetivo diario (min)', aliases: ['goal'] },
});

// ── Normalización según el tipo de cada ajuste ──────────────────────────
const decimalsOf = (step) => (String(step).split('.')[1] ?? '').length;
function normalize(key, rule, value) {
  if (rule.type === 'boolean') {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    throw new RangeError(`«${key}» espera sí o no, y llegó ${JSON.stringify(value)}`);
  }
  if (rule.type === 'enum') {
    if (rule.values.includes(value)) return value;
    throw new RangeError(`«${key}» admite ${rule.values.join(', ')}; llegó ${JSON.stringify(value)}`);
  }
  const number = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) throw new RangeError(`«${key}» espera un número; llegó ${JSON.stringify(value)}`);
  const stepped = Number((Math.round(number / rule.step) * rule.step).toFixed(decimalsOf(rule.step)));
  if (stepped < rule.min || stepped > rule.max) throw new RangeError(`«${key}» va de ${rule.min} a ${rule.max}; llegó ${number}`);
  return stepped;
}

// ── Métodos comunes a cualquier tipo de ajustes ─────────────────────────
const settingsMethods = defineHidden({}, {
  set(key, value) {
    if (!Object.hasOwn(this.schema, key)) throw new TypeError(`${this.typeName}: ajuste desconocido «${key}»`);
    const rule = this.schema[key];
    const next = normalize(key, rule, value);
    const previous = this._values[key];
    if (Object.is(previous, next)) return this;
    if (Object.is(next, rule.default)) delete this._values[key]; // igual que el de fábrica
    else Object.defineProperty(this._values, key, { value: next, writable: true, enumerable: true, configurable: true });
    this._onChange({ key, from: previous, to: next });
    return this;
  },
  reset(key) {
    for (const ownKey of key === undefined ? Object.keys(this._values) : [key]) {
      if (!Object.hasOwn(this._values, ownKey)) continue;
      const previous = this._values[ownKey];
      delete this._values[ownKey]; // vuelve a verse el valor de fábrica
      this._onChange({ key: ownKey, from: previous, to: this._values[ownKey] });
    }
    return this;
  },
  isDefault(key) {
    return !Object.hasOwn(this._values, key);
  },
  load(saved) {
    const problems = [];
    for (const [savedKey, value] of Object.entries(saved)) {
      const key = Object.hasOwn(this.schema, savedKey)
        ? savedKey
        : Object.keys(this.schema).find((name) => this.schema[name].aliases?.includes(savedKey));
      if (key === undefined) {
        problems.push(`«${savedKey}»: ajuste desconocido, se descarta`);
        continue;
      }
      try {
        this.set(key, value);
        if (key !== savedKey) problems.push(`«${savedKey}» ahora se llama «${key}»: migrado`);
      } catch (error) {
        problems.push(`${error.message}: se usa ${JSON.stringify(this._values[key])}`);
      }
    }
    return problems;
  },
  toJSON() {
    return { ...this._values }; // el spread solo copia lo PROPIO: los cambios del usuario
  },
  snapshot() {
    const effective = {};
    for (const key in this._values) effective[key] = this._values[key]; // for…in: propio + heredado
    return Object.freeze(effective);
  },
});

function defineSettingsType(typeName, schema) {
  const defaults = Object.create(null);
  for (const [key, rule] of Object.entries(schema)) defaults[key] = rule.default;
  Object.freeze(defaults);

  // Un prototipo por tipo: los accesores se crean UNA vez y los comparten todos los almacenes.
  const proto = Object.create(settingsMethods);
  defineHidden(proto, { schema, typeName });
  for (const key of Object.keys(schema)) {
    Object.defineProperty(proto, key, {
      enumerable: true,
      get() { return this._values[key]; },
      set(value) { this.set(key, value); },
    });
  }

  return function createSettings({ onChange = () => {} } = {}) {
    const settings = Object.create(proto);
    Object.defineProperties(settings, {
      _values: { value: Object.create(defaults) },
      _onChange: { value: onChange },
    });
    return Object.preventExtensions(settings);
  };
}

// ── Uso ─────────────────────────────────────────────────────────────────
const createReaderSettings = defineSettingsType('ReaderSettings', READER_SCHEMA);
const changes = [];
const settings = createReaderSettings({ onChange: (change) => changes.push(change) });

// Lo que guardó la versión 1 de la app (en la app real vendría de localStorage):
const savedV1 = '{"font_size":"20","theme":"noche","goal":30,"hyphenation":"false","fontFamily":"Comic Sans","lineHeight":1.55}';
console.group('Cargar los ajustes de la versión 1');
for (const problem of settings.load(JSON.parse(savedV1))) console.log(`· ${problem}`);
console.log(`${changes.length} cambios aplicados`);
console.groupEnd();

const table = (store) => {
  const rows = {};
  for (const [key, rule] of Object.entries(store.schema)) {
    rows[rule.label] = { valor: store[key], origen: store.isDefault(key) ? 'de fábrica' : 'usuario' };
  }
  console.table(rows);
};
table(settings);

console.group('El usuario cambia cosas');
// Otra pantalla carga los mismos ajustes y, a partir de ahí, avisa de cada cambio.
let loading = true;
const live = createReaderSettings({
  onChange: ({ key, from, to }) => {
    if (!loading) console.log(`✎ ${key}: ${from} → ${to}`);
  },
});
live.load(settings.toJSON());
loading = false;
live.theme = 'oscuro';
live.fontSize = 18;           // igual que el de fábrica: deja de ser un cambio
live.lineHeight = '1,8';      // texto con coma decimal: se normaliza
for (const [label, action] of [
  ['fontSize = 40', () => { live.fontSize = 40; }],
  ["font = 'Comic Sans'", () => { live.font = 'Comic Sans'; }],
  ['set("brillo", 80)', () => live.set('brillo', 80)],
]) {
  try {
    action();
  } catch (error) {
    console.warn(`⛔ ${label} → ${error.name}: ${error.message}`);
  }
}
live.fontsize = 22; // errata: no extensible → se ignora en silencio
console.log("¿se creó 'fontsize'? →", Object.hasOwn(live, 'fontsize'));
function saveFromStrictCode() {
  'use strict';
  live.fontsize = 22; // en modo estricto (módulos, clases) la errata se ve
}
try {
  saveFromStrictCode();
} catch (error) {
  console.warn(`⛔ en modo estricto → ${error.name}: ${error.message}`);
}
console.groupEnd();

console.log('guardar →', JSON.stringify(live));
const snapshot = live.snapshot();
snapshot.theme = 'claro'; // congelada: nadie la cambia desde fuera
console.log('instantánea →', snapshot);
console.log('¿accesores compartidos? →', Object.getPrototypeOf(live) === Object.getPrototypeOf(settings),
  '| ¿theme es propia? →', Object.hasOwn(live, 'theme'));
live.reset();
console.log('tras reset() →', JSON.stringify(live), '| theme →', live.theme);
```
