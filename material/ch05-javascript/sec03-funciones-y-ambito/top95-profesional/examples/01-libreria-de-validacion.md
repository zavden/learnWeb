---
example_description: "Librería de validación hecha con validadores pequeños fabricados con closures, combinadores de orden superior (all, optional, when) y un esquema recursivo que devuelve los errores con su ruta"
example_tags: "javascript|profesional|validacion|closures|orden-superior|recursion"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// LIBRERÍA DE VALIDACIÓN para el formulario de alta de un espacio de coworking.
//
// Decisiones:
// - Un validador es una función PURA (valor, datos) → null si es válido, o el mensaje
//   de error. No lanza: un formulario mal rellenado no es un fallo del programa.
// - Los validadores se FABRICAN: minLength(8) devuelve un closure que recuerda el 8.
//   Todas las fábricas aceptan { message } para personalizar el texto.
// - Se combinan con funciones de orden superior: all (el primer error de una lista),
//   optional (solo si hay valor) y when (solo si se cumple una condición sobre los datos).
// - Un ESQUEMA es un objeto con la misma forma que los datos; validate lo recorre con
//   recursión y devuelve TODOS los errores con su ruta ('address.zip', 'guests[1].email').
// - «Hoy» es un dato fijo (TODAY) y las fechas se comparan como texto AAAA-MM-DD:
//   el resultado no depende de la zona horaria de quien ejecuta el código.
//
// Alcance: módulos 1-3 (funciones, closures, orden superior, recursión).

const TODAY = '2026-10-12';
const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

// ── Validadores básicos (fábricas) ──────────────────────────────────────

const required = ({ message = 'Este campo es obligatorio' } = {}) =>
  (value) => (isBlank(value) ? message : null);

const minLength = (min, { message = `Escribe al menos ${min} caracteres` } = {}) =>
  (value) => ([...String(value)].length < min ? message : null); // cuenta code points, no UTF-16

const maxLength = (max, { message = `Escribe como mucho ${max} caracteres` } = {}) =>
  (value) => ([...String(value)].length > max ? message : null);

const digitsOnly = (length, { message = `Debe tener ${length} cifras` } = {}) =>
  (value) => {
    const text = String(value);
    const allDigits = [...text].every((char) => char >= '0' && char <= '9');
    return allDigits && text.length === length ? null : message;
  };

const oneOf = (options, { message } = {}) => {
  const list = new Intl.ListFormat('es', { type: 'disjunction' }).format(options);
  return (value) => (options.includes(value) ? null : message ?? `Elige ${list}`);
};

const isEmail = ({ message = 'El email no es válido' } = {}) => (value) => {
  const text = String(value);
  const at = text.indexOf('@');
  const ok = at > 0 && at === text.lastIndexOf('@') && text.indexOf('.', at) > at + 1
    && !text.endsWith('.') && !text.includes(' ');
  return ok ? null : message;
};

// Validadores que miran OTROS campos: reciben también los datos completos.
const sameAs = (field, label) => (value, data) => (value === data[field] ? null : `No coincide con ${label}`);

const isIsoDate = ({ message = 'Usa el formato AAAA-MM-DD' } = {}) => (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day)); // en UTC: sin zona horaria local
  const roundTrip = Number.isFinite(year) && date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return roundTrip ? null : message; // rechaza 2026-02-30, que Date desbordaría a marzo
};

const minAge = (years, { today = TODAY, message = `Debes tener al menos ${years} años` } = {}) =>
  (value) => {
    // Fechas AAAA-MM-DD: el año son los 4 primeros caracteres y 'MM-DD' se compara como texto.
    const age = Number(today.slice(0, 4)) - Number(value.slice(0, 4))
      - (today.slice(5) < value.slice(5) ? 1 : 0); // aún no ha cumplido años este año
    return age >= years ? null : message;
  };

// ── Combinadores (orden superior) ───────────────────────────────────────

// all: aplica los validadores en orden y devuelve el PRIMER error (o null).
const all = (...validators) => (value, data) => {
  for (const validator of validators) {
    const error = validator(value, data);
    if (error) return error;
  }
  return null;
};
const optional = (validator) => (value, data) => (isBlank(value) ? null : validator(value, data));
const when = (condition, validator) => (value, data) => (condition(data) ? validator(value, data) : null);
const listOf = (itemSchema, { min = 0, max = Infinity } = {}) => ({ listOf: itemSchema, min, max });

// ── Recorrido recursivo del esquema ─────────────────────────────────────

const joinPath = (path, key) => (path === '' ? key : `${path}.${key}`);

function validate(schema, value, data = value, path = '') {
  if (typeof schema === 'function') {
    const message = schema(value, data);
    return message ? [{ path, message }] : [];
  }
  if (schema.listOf) {
    const items = Array.isArray(value) ? value : [];
    if (items.length < schema.min) return [{ path, message: `Añade al menos ${schema.min}` }];
    if (items.length > schema.max) return [{ path, message: `Como mucho ${schema.max}` }];
    return items.flatMap((item, i) => validate(schema.listOf, item, data, `${path}[${i}]`));
  }
  // Un objeto: cada clave del esquema valida la clave correspondiente de los datos.
  return Object.entries(schema).flatMap(([key, child]) => validate(child, value?.[key], data, joinPath(path, key)));
}

// ── El esquema del alta ─────────────────────────────────────────────────

const PLANS = ['diario', 'mensual', 'anual'];
const signupSchema = {
  name: all(required(), minLength(2), maxLength(60)),
  email: all(required(), isEmail()),
  password: all(required(), minLength(10, { message: 'La contraseña necesita 10 caracteres o más' })),
  passwordConfirm: all(required(), sameAs('password', 'la contraseña')),
  birthDate: all(required(), isIsoDate(), minAge(18)),
  plan: all(required(), oneOf(PLANS)),
  company: when((data) => data.plan === 'anual', required({ message: 'El plan anual se factura a una empresa' })),
  address: {
    street: required(),
    zip: all(required(), digitsOnly(5, { message: 'El código postal tiene 5 cifras' })),
    city: required(),
  },
  guests: listOf({ name: required(), email: optional(isEmail()) }, { max: 3 }),
};

// ── Tres altas de prueba ────────────────────────────────────────────────

const submissions = [
  {
    name: 'Lucía Ortega', email: 'lucia.ortega@example.com', password: 'té-verde-2026', passwordConfirm: 'té-verde-2026',
    birthDate: '1994-03-08', plan: 'mensual', company: '',
    address: { street: 'Calle Feria 12', zip: '41003', city: 'Sevilla' },
    guests: [{ name: 'Iker', email: '' }],
  },
  {
    name: ' ', email: 'marta@@example.com', password: 'corta', passwordConfirm: 'Corta',
    birthDate: '2026-02-30', plan: 'semanal',
    address: { street: 'Gran Vía 1', zip: '28O13', city: '' },
    guests: [{ name: 'Ana', email: 'ana@example.com' }, { name: '', email: 'sin-arroba' }],
  },
  {
    name: 'Bruno Díaz', email: 'bruno@example.org', password: 'caf3-con-leche', passwordConfirm: 'caf3-con-leche',
    birthDate: '2008-10-13', plan: 'anual', company: '   ',
    address: { street: 'Rúa Nova 4', zip: '15705', city: 'Santiago' },
    guests: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
  },
];

for (const submission of submissions) {
  const errors = validate(signupSchema, submission);
  console.log(`▼ ${submission.email}: ${errors.length === 0 ? '✅ alta válida' : `${errors.length} errores`}`);
  for (const { path, message } of errors) {
    console.log(`    ${path.padEnd(16)} ${message}`);
  }
}

// Las mismas piezas sirven para otro formulario sin escribir validadores nuevos.
const newsletterSchema = { email: all(required(), isEmail()), topics: listOf(oneOf(['css', 'js', 'a11y']), { min: 1 }) };
console.log('newsletter →', validate(newsletterSchema, { email: 'iker@example.com', topics: ['js', 'php'] }));
```
