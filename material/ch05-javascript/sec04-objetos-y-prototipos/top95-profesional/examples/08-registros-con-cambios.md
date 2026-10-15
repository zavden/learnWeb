---
example_description: "Un mini ORM en memoria: modelos generados que heredan de un tipo Record, accesores por campo que normalizan, validan y registran los cambios pendientes, SQL solo con las columnas cambiadas e hidratación sin pasar por la constructora"
example_tags: "javascript|profesional|accesores|herencia|orm|estaticos"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// REGISTROS CON CAMBIOS PENDIENTES: un mini ORM en memoria para los clientes y las
// facturas de una herramienta de facturación.
//
// Decisiones:
// - Record es el tipo base (constructora + prototipo) con lo común: isDirty, changes,
//   validate, save, revert y toJSON.
// - defineModel(nombre, { table, fields }) crea un tipo hijo de Record: enlaza los
//   prototipos (métodos) y las constructoras (el estático find se hereda) y genera en el
//   prototipo un ACCESOR por campo, compartido por todos los registros del modelo.
// - Cada registro guarda sus datos y sus valores originales en propiedades propias no
//   enumerables, y no es extensible: una errata en un campo lanza un error.
// - El setter normaliza y valida; la primera vez que un campo cambia recuerda su valor
//   original, y si vuelve a él, lo olvida: isDirty() es exacto.
// - save() envía SOLO las columnas cambiadas, con los valores como parámetros aparte
//   (nunca pegados en el texto del SQL: así se evita la inyección SQL).
// - find() «hidrata» desde la base SIN pasar por la constructora ni por los setters
//   (Object.create(Model.prototype) + los datos): leer no es cambiar. instanceof
//   funciona igual, porque solo mira la cadena.
// - La «base de datos» es un Map por tabla y la salida, el SQL que se enviaría.
//
// Alcance: módulos 1-4.

// ── La base de datos en memoria ─────────────────────────────────────────
const db = {
  customers: new Map([
    [1, { id: 1, name: 'Ana Torres Studio', email: 'ana@anatorres.example', plan: 'gratis', vatId: 'X1234567L' }],
    [2, { id: 2, name: 'Panadería La Espiga', email: 'pedidos@laespiga.example', plan: 'pro', vatId: 'B87654321' }],
  ]),
  invoices: new Map(),
  nextId: { customers: 3, invoices: 1 },
  sent: [],
};

// ── Normalización y validación por tipo de campo ───────────────────────
const isIsoDate = (text) => typeof text === 'string' && text.length === 10 && !Number.isNaN(Date.parse(`${text}T00:00:00Z`))
  && new Date(`${text}T00:00:00Z`).toISOString().startsWith(text); // rechaza el 31 de febrero
function coerce(model, field, spec, value) {
  const fail = (reason) => { throw new RangeError(`${model}.${field}: ${reason} (${JSON.stringify(value)})`); };
  if (value === null || value === undefined) return null;
  switch (spec.type) {
    case 'string': {
      const text = String(value).trim();
      if (spec.maxLength && text.length > spec.maxLength) fail(`máximo ${spec.maxLength} caracteres`);
      return text;
    }
    case 'email': {
      const email = String(value).trim().toLowerCase();
      const at = email.indexOf('@');
      if (at < 1 || email.indexOf('.', at) === -1 || email.endsWith('.')) fail('email no válido');
      return email;
    }
    case 'enum':
      if (!spec.values.includes(value)) fail(`admite ${spec.values.join(', ')}`);
      return value;
    case 'integer':
      if (!Number.isSafeInteger(value) || value < 0) fail('entero no negativo');
      return value;
    case 'date':
      if (!isIsoDate(value)) fail('fecha AAAA-MM-DD');
      return value;
    case 'boolean':
      if (typeof value !== 'boolean') fail('true o false');
      return value;
    default:
      throw new TypeError(`tipo de campo desconocido: ${spec.type}`);
  }
}

// ── Record: el tipo base ────────────────────────────────────────────────
function Record() {
  if (!(this instanceof Record)) throw new TypeError('Record se crea con new');
  Object.defineProperties(this, {
    _data: { value: {} },
    _original: { value: new Map() },
    _isNew: { value: true, writable: true },
  });
}
function hydrate(Model, row) {
  const record = Object.create(Model.prototype); // la constructora NO se ejecuta
  Object.defineProperties(record, {
    _data: { value: { ...row } },
    _original: { value: new Map() },
    _isNew: { value: false, writable: true },
  });
  return Object.preventExtensions(record);
}
Record.find = function (id) {
  const row = db[this.table].get(id); // this: el modelo que llama (Customer.find, Invoice.find)
  return row ? hydrate(this, row) : null;
};
// Métodos no enumerables, como los de class.
function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
extendPrototype(Record, {
  isDirty() {
    return this._isNew || this._original.size > 0;
  },
  changes() {
    const result = {};
    for (const [field, from] of this._original) result[field] = { antes: from, ahora: this._data[field] };
    return result;
  },
  validate() {
    const fields = this.constructor.fields;
    return Object.keys(fields).filter((field) => fields[field].required && this._data[field] == null)
      .map((field) => `${field} es obligatorio`);
  },
  save() {
    const errors = this.validate();
    if (errors.length > 0) throw new RangeError(`${this.constructor.name}: ${errors.join('; ')}`);
    const table = this.constructor.table;
    let statement;
    if (this._isNew) {
      const columns = Object.keys(this._data);
      statement = { sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, params: Object.values(this._data) };
      this._data.id = db.nextId[table]++; // el id lo asigna la base de datos
      this._isNew = false;
    } else if (this._original.size === 0) {
      return '(sin cambios: no se envía nada)';
    } else {
      const columns = [...this._original.keys()];
      statement = {
        sql: `UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
        params: [...columns.map((column) => this._data[column]), this._data.id],
      };
    }
    db[table].set(this._data.id, { ...this._data });
    db.sent.push(statement);
    this._original.clear();
    return `${statement.sql}  ${JSON.stringify(statement.params)}`;
  },
  revert() {
    for (const [field, value] of this._original) this._data[field] = value;
    this._original.clear();
    return this;
  },
  toJSON() {
    return { ...this._data };
  },
});

// ── defineModel: genera un tipo hijo de Record ──────────────────────────
function defineModel(name, { table, fields }) {
  const Model = function (data = {}) {
    Record.call(this);
    for (const [field, spec] of Object.entries(fields)) this._data[field] = spec.default ?? null;
    Object.preventExtensions(this);
    Object.assign(this, data); // cada campo pasa por su setter; una clave desconocida lanza TypeError
    this._original.clear();    // los valores iniciales no son «cambios»
  };
  Object.defineProperty(Model, 'name', { value: name });
  Object.setPrototypeOf(Model.prototype, Record.prototype); // métodos
  Object.setPrototypeOf(Model, Record);                     // estáticos: Model.find
  Object.assign(Model, { table, fields: Object.freeze(fields) });

  Object.defineProperty(Model.prototype, 'id', { get() { return this._data.id ?? null; }, enumerable: true });
  for (const [field, spec] of Object.entries(fields)) {
    Object.defineProperty(Model.prototype, field, {
      enumerable: true,
      get() {
        return this._data[field];
      },
      set(value) {
        const next = coerce(name, field, spec, value);
        const current = this._data[field];
        if (Object.is(current, next)) return;
        if (!this._original.has(field)) this._original.set(field, current);
        else if (Object.is(this._original.get(field), next)) this._original.delete(field); // vuelve al original
        this._data[field] = next;
      },
    });
  }
  return Model;
}

const Customer = defineModel('Customer', {
  table: 'customers',
  fields: {
    name: { type: 'string', required: true, maxLength: 80 },
    email: { type: 'email', required: true },
    plan: { type: 'enum', values: ['gratis', 'pro', 'empresa'], default: 'gratis' },
    vatId: { type: 'string', maxLength: 20 },
  },
});
const Invoice = defineModel('Invoice', {
  table: 'invoices',
  fields: {
    customerId: { type: 'integer', required: true },
    issuedOn: { type: 'date', required: true },
    totalCents: { type: 'integer', required: true },
    paid: { type: 'boolean', default: false },
  },
});
extendPrototype(Invoice, {
  customer() {
    return Customer.find(this.customerId);
  },
});

// ── Uso ─────────────────────────────────────────────────────────────────
const attempt = (label, action) => {
  try {
    console.log(`${label} → ${action()}`);
  } catch (error) {
    console.warn(`⛔ ${label} → ${error.name}: ${error.message}`);
  }
};

console.group('Editar un cliente');
const ana = Customer.find(1);
console.log('hidratado →', ana.name, '| ¿cambios? →', ana.isDirty(), '| ¿instanceof Customer y Record? →', ana instanceof Customer, ana instanceof Record);
ana.email = '  Hola@AnaTorres.example ';
ana.plan = 'pro';
console.table(ana.changes());
attempt('guardar', () => ana.save());
ana.plan = 'empresa';
ana.plan = 'pro'; // vuelve al valor guardado
attempt('guardar otra vez', () => ana.save());
attempt("plan = 'vip'", () => { ana.plan = 'vip'; });
attempt("email = 'ana@'", () => { ana.email = 'ana@'; });
console.groupEnd();

console.group('Altas');
attempt('cliente nuevo', () => new Customer({ name: 'Talleres Ruiz', email: 'admin@talleresruiz.example', vatId: 'B12345678' }).save());
attempt('con una errata', () => new Customer({ name: 'Floristería Lis', emial: 'hola@lis.example' }));
attempt('sin email', () => new Customer({ name: 'Floristería Lis' }).save());
const invoice = new Invoice({ customerId: 2, issuedOn: '2026-10-01', totalCents: 4840 });
attempt('factura nueva', () => invoice.save());
attempt('fecha imposible', () => new Invoice({ customerId: 2, issuedOn: '2026-02-31', totalCents: 100 }));
console.groupEnd();

console.group('Deshacer cambios');
const stored = Invoice.find(1);
stored.paid = true;
stored.totalCents = 4500;
console.log('cambios →', stored.changes());
stored.revert();
console.log('tras revert →', stored.toJSON(), '| ¿cambios? →', stored.isDirty());
console.log('cliente de la factura →', stored.customer().name);
console.groupEnd();

console.log('Object.keys(ana) →', Object.keys(ana), '| JSON →', JSON.stringify(ana));
console.log('¿un solo accesor email para todos? →',
  Object.getOwnPropertyDescriptor(Customer.prototype, 'email').set === Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Customer.find(2)), 'email').set);
console.log(`SQL enviado: ${db.sent.length} sentencias`);
```
