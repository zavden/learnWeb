---
example_description: "Diferencias entre dos versiones de un pedido en JSON: recorrido profundo con una pila explícita, arrays emparejados por clave, cambios de tipo y resumen con Map"
example_tags: "javascript|profesional|json|objetos|arrays|algoritmos"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// DIFERENCIAS ENTRE DOS VERSIONES DE UN PEDIDO (el «historial de cambios» de un back office).
//
// JavaScript no tiene igualdad de contenido: === entre objetos compara identidad, y
// comparar los JSON solo dice «son distintos» (y falla si las claves cambian de orden).
// Este programa recorre los dos documentos a la vez y lista cada diferencia con su
// ruta, como hace git diff con el texto.
//
// Decisiones:
// - Recorrido con una PILA explícita (un array con push/pop) en lugar de recursión,
//   que se estudia en «Funciones y ámbito». Así se ve el mecanismo: cada elemento de
//   la pila es «comparar a con b en esta ruta».
// - Los arrays de objetos con identidad (líneas de pedido con sku) se emparejan por esa
//   clave, no por posición: borrar la primera línea no debe marcar todas como cambiadas.
// - Se avisa de los cambios de TIPO (46001 → "46001"), que rompen código sin hacer ruido.
//
// Alcance: function y las flechas, en «Funciones y ámbito».

const BEFORE_JSON = `{
  "id": "P-24133", "status": "pagado", "updatedAt": "2026-10-09T11:40:00Z",
  "customer": { "name": "Lucía Romero", "email": "lucia@example.com" },
  "shipping": { "method": "estándar", "address": { "street": "Calle Mayor 12", "city": "Valencia", "zip": 46001 } },
  "items": [
    { "sku": "CAF-COL", "qty": 3, "unitCents": 990 },
    { "sku": "TE-SEN", "qty": 1, "unitCents": 650 },
    { "sku": "MOL-MAN", "qty": 1, "unitCents": 3490 }
  ],
  "tags": ["web", "primera-compra"],
  "coupon": "BIENVENIDA5",
  "notes": null
}`;

const AFTER_JSON = `{
  "id": "P-24133", "status": "enviado", "updatedAt": "2026-10-10T08:05:00Z",
  "customer": { "email": "lucia@example.com", "name": "Lucía Romero" },
  "shipping": {
    "method": "urgente",
    "address": { "street": "Calle Mayor 12, 3.º B", "city": "Valencia", "zip": "46001" },
    "trackingCode": "ES26CX0045812"
  },
  "items": [
    { "sku": "TE-SEN", "qty": 1, "unitCents": 650 },
    { "sku": "CAF-COL", "qty": 2, "unitCents": 990 },
    { "sku": "TAZ-CER", "qty": 1, "unitCents": 1250 }
  ],
  "tags": ["web"],
  "notes": "La clienta pide factura a nombre de su empresa"
}`;

// Rutas que no interesan (cambian siempre) y arrays que se emparejan por una clave.
const IGNORED_PATHS = new Set(['updatedAt']);
const ARRAY_KEYS = new Map([['items', 'sku']]);

// ── Diferencias ─────────────────────────────────────────────────────────

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

// Un array de objetos → objeto { 'sku=CAF-COL': {…}, … } para compararlo por clave.
function indexBy(array, key) {
  return Object.fromEntries(array.map((item) => [`${key}=${item[key]}`, item]));
}

function childPath(path, key, parentType) {
  if (parentType === 'array') return `${path}[${key}]`;
  return path === '' ? key : `${path}.${key}`;
}

function diff(before, after) {
  const changes = [];
  // Cada tarea: comparar «a» con «b» en «path». inA / inB dicen si la clave existe en cada lado.
  const stack = [{ path: '', a: before, b: after, inA: true, inB: true }];

  while (stack.length > 0) {
    const { path, a, b, inA, inB } = stack.pop();
    if (IGNORED_PATHS.has(path)) continue;
    if (!inB) {
      changes.push({ kind: 'removed', path, before: a });
      continue;
    }
    if (!inA) {
      changes.push({ kind: 'added', path, after: b });
      continue;
    }
    if (Object.is(a, b)) continue; // primitivos iguales (y el mismo objeto)

    let left = a;
    let right = b;
    let parentType = typeOf(a);
    const arrayKey = ARRAY_KEYS.get(path);
    if (arrayKey && typeOf(a) === 'array' && typeOf(b) === 'array') {
      left = indexBy(a, arrayKey);
      right = indexBy(b, arrayKey);
      parentType = 'array'; // para escribir la ruta como items[sku=CAF-COL]
    }

    const bothContainers = typeOf(left) === typeOf(right) && (typeOf(left) === 'object' || typeOf(left) === 'array');
    if (!bothContainers) {
      changes.push({ kind: 'changed', path, before: a, after: b });
      continue;
    }

    // Unión de claves en orden de aparición (un Set no repite).
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    const tasks = [];
    for (const key of keys) {
      tasks.push({
        path: childPath(path, key, parentType),
        a: left[key],
        b: right[key],
        inA: Object.hasOwn(left, key),
        inB: Object.hasOwn(right, key),
      });
    }
    // La pila saca primero lo último que entra: se apilan al revés para conservar el orden.
    stack.push(...tasks.toReversed());
  }
  return changes;
}

// ── Presentación ────────────────────────────────────────────────────────

const SYMBOLS = { added: '+', removed: '-', changed: '~' };
function show(value) {
  return JSON.stringify(value); // las comillas dejan ver si es texto o número
}
function describe(change) {
  const symbol = SYMBOLS[change.kind];
  if (change.kind === 'added') return `${symbol} ${change.path}: ${show(change.after)}`;
  if (change.kind === 'removed') return `${symbol} ${change.path}: ${show(change.before)}`;
  const typeNote = typeOf(change.before) === typeOf(change.after)
    ? ''
    : `  ⚠ cambia el tipo (${typeOf(change.before)} → ${typeOf(change.after)})`;
  return `${symbol} ${change.path}: ${show(change.before)} → ${show(change.after)}${typeNote}`;
}

let before;
let after;
try {
  before = JSON.parse(BEFORE_JSON);
  after = JSON.parse(AFTER_JSON);
} catch (error) {
  throw new SyntaxError('Uno de los documentos no es JSON válido', { cause: error });
}

// Por qué no basta con comparar los JSON: el orden de las claves de customer cambió.
console.log('¿customer igual según JSON.stringify? →', JSON.stringify(before.customer) === JSON.stringify(after.customer));
console.log('¿customer igual según diff? →', diff(before.customer, after.customer).length === 0);

const changes = diff(before, after);
console.group(`Pedido ${after.id}: ${changes.length} cambios (sin contar updatedAt)`);
for (const change of changes) {
  console.log(describe(change));
}
console.groupEnd();

// Resumen por tipo de cambio y por sección (la primera parte de la ruta).
const byKind = Map.groupBy(changes, (change) => change.kind);
console.log('resumen →', Object.fromEntries([...byKind].map(([kind, list]) => [kind, list.length])));
const sections = new Set(changes.map((change) => change.path.split(/[.[]/)[0])); // regex: corta en «.» o «[»
console.log('secciones tocadas →', [...sections].join(', '));

// Impacto en el importe: se recalcula con los datos, no se deduce del diff.
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', signDisplay: 'exceptZero' });
function totalCents(order) {
  return order.items.reduce((sum, item) => sum + item.qty * item.unitCents, 0);
}
console.log('variación del importe →', money.format((totalCents(after) - totalCents(before)) / 100));

// 🐛 Comparado por posición, el mismo cambio parece mucho más grande.
ARRAY_KEYS.delete('items');
console.log('si items se compara por posición →', diff(before, after).length, 'cambios en lugar de', changes.length);
```
