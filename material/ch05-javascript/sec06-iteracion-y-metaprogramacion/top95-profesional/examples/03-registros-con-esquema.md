---
example_description: "Registros con esquema para un catálogo: reglas pequeñas que se combinan, una fábrica que valida todo al crear y devuelve un proxy que valida cada asignación, actualizaciones de todo o nada, listas congeladas, instanceof por marca con Symbol.hasInstance y una importación por lotes con generadores"
example_tags: "javascript|profesional|proxy|reflect|validacion|esquemas|symbol-hasinstance|generadores"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// FICHAS DE PRODUCTO CON ESQUEMA para el catálogo de una tostadora de café.
//
// Decisiones:
// - Una REGLA es una función valor → mensaje de error o null. Las fábricas de
//   reglas (t.string, t.integer, t.oneOf, t.listOf…) se combinan como piezas.
// - defineRecord(name, schema) devuelve la «clase» del registro: create() valida
//   TODOS los campos de golpe (un ValidationError con la lista de problemas) y
//   devuelve un proxy que valida cada asignación y cada borrado después.
// - La trampa defineProperty cierra la puerta trasera Object.defineProperty. Por
//   eso set reenvía con Reflect.set(target, key, value) SIN el proxy como
//   receiver: con él, la asignación acabaría llamando a esa misma trampa.
// - Las listas se guardan congeladas: tags.push() falla, y el cambio se hace
//   asignando una lista nueva, que sí pasa por la validación.
// - update() es de todo o nada: valida el resultado completo antes de tocar nada.
// - instanceof funciona por MARCA: un WeakSet guarda los proxies creados por la
//   fábrica y Symbol.hasInstance pregunta ahí. Una copia con el spread no cuela.
//
// Alcance: módulos 1-6.

class ValidationError extends Error {
  constructor(recordName, issues) {
    super(`${recordName}: ${issues.length} problema(s) → ${issues.map((issue) => `${issue.field} (${issue.message})`).join(', ')}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

const isCodeChar = (ch) => (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9');
const t = {
  string: ({ min = 0, max = Infinity } = {}) => (value) =>
    typeof value !== 'string' ? 'debe ser texto'
      : value.trim().length < min ? `mínimo ${min} caracteres`
        : value.length > max ? `máximo ${max} caracteres` : null,
  integer: ({ min = -Infinity, max = Infinity } = {}) => (value) =>
    !Number.isInteger(value) ? 'debe ser un entero'
      : value < min ? `mínimo ${min}` : value > max ? `máximo ${max}` : null,
  boolean: () => (value) => (typeof value === 'boolean' ? null : 'debe ser true o false'),
  oneOf: (...options) => (value) => (options.includes(value) ? null : `debe ser ${options.join(' | ')}`),
  code: () => (value) => { // 'CAF-500': tres letras, guion, tres cifras o letras
    const [prefix, suffix, extra] = String(value).split('-');
    const ok = typeof value === 'string' && extra === undefined && prefix.length === 3 && suffix?.length === 3 && [...prefix + suffix].every(isCodeChar);
    return ok ? null : 'formato AAA-000';
  },
  listOf: (rule, { max = Infinity } = {}) => (value) => {
    if (!Array.isArray(value)) return 'debe ser una lista';
    if (value.length > max) return `máximo ${max} elementos`;
    const index = value.findIndex((item) => rule(item) !== null);
    return index === -1 ? null : `[${index}] ${rule(value[index])}`;
  },
  optional: (rule) => Object.assign((value) => (value === undefined ? null : rule(value)), { optional: true }),
};

const freezeLists = (value) => (Array.isArray(value) ? Object.freeze([...value]) : value);

function defineRecord(name, schema) {
  const instances = new WeakSet();
  const required = Object.keys(schema).filter((key) => !schema[key].optional);

  function check(data) {
    const issues = [];
    for (const key of Object.keys(data)) if (!Object.hasOwn(schema, key)) issues.push({ field: key, message: 'campo desconocido' });
    for (const [key, rule] of Object.entries(schema)) {
      const message = rule(data[key]);
      if (message) issues.push({ field: key, message: data[key] === undefined ? 'obligatorio' : message });
    }
    return issues;
  }

  const handler = {
    set(target, key, value) {
      const rule = Object.hasOwn(schema, key) ? schema[key] : null;
      const message = rule ? rule(value) : 'campo desconocido';
      if (message) throw new ValidationError(name, [{ field: String(key), message }]);
      return Reflect.set(target, key, freezeLists(value)); // sin receiver (ver Decisiones)
    },
    deleteProperty(target, key) {
      if (required.includes(key)) throw new ValidationError(name, [{ field: String(key), message: 'obligatorio: no se puede borrar' }]);
      return Reflect.deleteProperty(target, key);
    },
    defineProperty(target, key) {
      throw new TypeError(`${name}: defineProperty('${String(key)}') se saltaría la validación`);
    },
  };

  return {
    create(data) {
      const issues = check(data);
      if (issues.length > 0) throw new ValidationError(name, issues);
      const target = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, freezeLists(value)]));
      const record = new Proxy(target, handler);
      instances.add(record);
      return record;
    },
    update(record, patch) { // todo o nada
      if (!instances.has(record)) throw new TypeError(`No es un ${name}`);
      const issues = check({ ...record, ...patch });
      if (issues.length > 0) throw new ValidationError(name, issues);
      return Object.assign(record, patch); // cada campo pasa otra vez por set
    },
    [Symbol.hasInstance](value) {
      return instances.has(value);
    },
  };
}

// ── El catálogo ────────────────────────────────────────────────────────────
const Product = defineRecord('Product', {
  sku: t.code(),
  name: t.string({ min: 3, max: 60 }),
  cents: t.integer({ min: 1 }),
  stock: t.integer({ min: 0 }),
  category: t.oneOf('café', 'cacao', 'accesorios'),
  tags: t.optional(t.listOf(t.string({ min: 2, max: 20 }), { max: 4 })),
  discontinued: t.optional(t.boolean()),
});

const coffee = Product.create({ sku: 'CAF-500', name: 'Café de Chiapas 500 g', cents: 21000, stock: 40, category: 'café', tags: ['orgánico'] });
console.log('creado →', JSON.stringify(coffee));

const attempts = {
  'coffee.cents = -5': () => { coffee.cents = -5; },
  'coffee.price = 230 (errata)': () => { coffee.price = 230; },
  "coffee.category = 'té'": () => { coffee.category = 'té'; },
  'delete coffee.name': () => { delete coffee.name; },
  "coffee.tags.push('nuevo')": () => { coffee.tags.push('nuevo'); },
  "Object.defineProperty(coffee, 'cents', …)": () => Object.defineProperty(coffee, 'cents', { value: 1 }),
  'update { cents: 23000, stock: -1 }': () => Product.update(coffee, { cents: 23000, stock: -1 }),
};
for (const [code, run] of Object.entries(attempts)) {
  try {
    run();
    console.log(`✅ ${code}`);
  } catch (error) {
    console.warn(`⛔ ${code} → ${error.name}: ${error.message}`);
  }
}
console.log('sin cambios tras los errores →', JSON.stringify(coffee));

coffee.tags = [...coffee.tags, 'comercio justo']; // una lista NUEVA, validada
Product.update(coffee, { cents: 23000, stock: 35 });
delete coffee.tags; // opcional: se puede borrar
console.log('cambios válidos →', JSON.stringify(coffee));
console.log('instanceof →', coffee instanceof Product, '| copia con spread →', ({ ...coffee }) instanceof Product);

// ── Importar un CSV ya convertido en filas: generadores de todo o nada por fila
const rows = [
  { sku: 'CAC-070', name: 'Chocolate de mesa 70 %', cents: 9500, stock: 60, category: 'cacao' },
  { sku: 'caf-250', name: 'Café de Veracruz 250 g', cents: 12000, stock: 25, category: 'café' },
  { sku: 'ACC-001', name: 'Molinillo de madera', cents: 38900, stock: 8, category: 'accesorios', tags: ['artesanal', 'regalo'] },
  { sku: 'CAF-1KG', name: 'Ca', cents: 0, category: 'té', color: 'rojo' },
];

function* importRows(input) {
  for (const [index, row] of input.entries()) {
    try {
      yield { line: index + 2, record: Product.create(row) }; // línea 1: cabecera del CSV
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      yield { line: index + 2, issues: error.issues };
    }
  }
}

const results = [...importRows(rows)];
const imported = results.filter((result) => result.record);
console.log(`importados → ${imported.length} | rechazados → ${results.length - imported.length}`);
console.table(results.filter((result) => result.issues).flatMap(({ line, issues }) => issues.map((issue) => ({ línea: line, campo: issue.field, problema: issue.message }))));
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
console.log('valor del inventario importado →', pesos.format(imported.reduce((sum, { record }) => sum + record.cents * record.stock, 0) / 100));
```
