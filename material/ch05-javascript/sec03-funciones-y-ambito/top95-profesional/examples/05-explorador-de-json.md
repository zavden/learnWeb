---
example_description: "Explorador de JSON: un recorrido recursivo genérico con visitantes, rutas como 'lines[1].qty', aplanar y reconstruir, actualizar sin mutar copiando solo el camino y detectar referencias circulares con un WeakSet"
example_tags: "javascript|profesional|recursion|json|inmutabilidad|orden-superior"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EXPLORADOR DE JSON para la respuesta de una API de pedidos.
//
// Decisiones:
// - Una RUTA se escribe como texto ('lines[1].options.size') y se trabaja como lista
//   de claves (['lines', 1, 'options', 'size']): números para índices de array.
// - walk es el ÚNICO recorrido recursivo. Recibe un «visitante» (una función) y lo
//   llama con (valor, ruta, profundidad) en cada nodo. Aplanar, contar tipos y buscar
//   son solo visitantes distintos: funciones de orden superior.
// - setIn es INMUTABLE: copia los nodos del camino hasta el cambio (spread y with) y
//   comparte todo lo demás con el original.
// - Las referencias circulares se detectan con un WeakSet de los objetos que están en
//   el camino actual; sin él, la recursión desbordaría la pila. Un objeto que aparece
//   dos veces en ramas distintas (compartido) NO es un ciclo.
//
// Alcance: módulos 1-3 (recursión, orden superior, inmutabilidad, Map, WeakSet).

// ── Rutas ───────────────────────────────────────────────────────────────
function parsePath(path) {
  const keys = [];
  for (const part of path.split('.')) {
    const bracket = part.indexOf('[');
    const name = bracket === -1 ? part : part.slice(0, bracket);
    if (name !== '') keys.push(name);
    if (bracket !== -1) {
      // 'matrix[0][2]' → los índices '0' y '2'
      for (const index of part.slice(bracket + 1, -1).split('][')) keys.push(Number(index));
    }
  }
  return keys;
}
const formatPath = (keys) =>
  keys.map((key, i) => (typeof key === 'number' ? `[${key}]` : i === 0 ? key : `.${key}`)).join('') || '(raíz)';

// ── El recorrido genérico ───────────────────────────────────────────────
const isContainer = (value) => value !== null && typeof value === 'object';
const childrenOf = (value) => (Array.isArray(value) ? value.map((item, i) => [i, item]) : Object.entries(value));

function walk(value, visit, path = [], depth = 0, ancestors = new WeakSet()) {
  if (isContainer(value)) {
    if (ancestors.has(value)) throw new Error(`referencia circular en «${formatPath(path)}»`);
    ancestors.add(value);
  }
  visit(value, path, depth);
  if (isContainer(value)) {
    for (const [key, child] of childrenOf(value)) walk(child, visit, [...path, key], depth + 1, ancestors);
    ancestors.delete(value); // sale del camino: si reaparece en otra rama, es compartido, no circular
  }
}

// ── Visitantes y operaciones construidas sobre walk ─────────────────────
function flatten(data) {
  const leaves = new Map(); // ruta → valor de cada hoja (o contenedor vacío)
  walk(data, (value, path) => {
    if (!isContainer(value) || childrenOf(value).length === 0) leaves.set(formatPath(path), value);
  });
  return leaves;
}

function typeStats(data) {
  const counts = new Map();
  let maxDepth = 0;
  walk(data, (value, path, depth) => {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    counts.set(type, (counts.get(type) ?? 0) + 1);
    maxDepth = Math.max(maxDepth, depth);
  });
  return { counts: Object.fromEntries(counts), maxDepth };
}

function findPaths(data, predicate) {
  const found = [];
  walk(data, (value, path) => {
    if (predicate(value, path)) found.push(formatPath(path));
  });
  return found;
}

const getIn = (data, path) => parsePath(path).reduce((node, key) => node?.[key], data);

function setIn(node, keys, value) {
  const [key, ...rest] = keys;
  const current = node?.[key];
  const next = rest.length === 0 ? value : setIn(current ?? (typeof rest[0] === 'number' ? [] : {}), rest, value);
  if (Array.isArray(node)) return key < node.length ? node.with(key, next) : [...node, next];
  return { ...node, [key]: next };
}

const unflatten = (leaves) =>
  [...leaves].reduce((result, [path, value]) => setIn(result, parsePath(path), value), {});

function deepEqual(a, b) {
  if (a === b) return true;
  if (!isContainer(a) || !isContainer(b) || Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  return keysA.length === Object.keys(b).length && keysA.every((key) => deepEqual(a[key], b[key]));
}

// ── Datos: la respuesta de la API ───────────────────────────────────────
const order = JSON.parse(`{
  "id": "P-1042",
  "customer": {
    "name": "Lucía Ortega",
    "email": "lucia@example.com",
    "addresses": [
      { "type": "envío", "street": "Calle Feria 12", "zip": "41003", "city": "Sevilla" },
      { "type": "factura", "street": "Av. de la Constitución 4", "zip": "41004", "city": "Sevilla" }
    ]
  },
  "lines": [
    { "sku": "TE-01", "name": "Té verde sencha", "qty": 2, "unitCents": 690, "options": { "size": "100 g" } },
    { "sku": "AC-03", "name": "Tetera de hierro", "qty": 1, "unitCents": 3450, "options": { "color": "negro" } }
  ],
  "payment": { "method": "tarjeta", "last4": "4242", "receiptEmail": "facturas@example.com" },
  "tags": [],
  "notes": null
}`);

const leaves = flatten(order);
console.log(`hojas: ${leaves.size}`);
console.table(Object.fromEntries([...leaves].slice(0, 8))); // las 8 primeras rutas
console.log('tipos →', typeStats(order));
console.log('emails →', findPaths(order, (value) => typeof value === 'string' && value.includes('@')));
console.log('cantidades > 1 →', findPaths(order, (value, path) => path.at(-1) === 'qty' && value > 1));
console.log("getIn('lines[1].options.color') →", getIn(order, 'lines[1].options.color'));
console.log("getIn('lines[5].sku') →", getIn(order, 'lines[5].sku')); // undefined, sin errores

// Actualizar sin mutar: solo se copia el camino hasta el cambio.
const updated = setIn(order, parsePath('lines[0].qty'), 3);
console.log('qty original / nueva →', order.lines[0].qty, '/', updated.lines[0].qty);
console.log('¿customer compartido? →', updated.customer === order.customer);     // true
console.log('¿lines[1] compartida? →', updated.lines[1] === order.lines[1]);     // true
console.log('¿lines copiado? →', updated.lines !== order.lines);                 // true

// Aplanar y reconstruir debe dar los mismos datos.
console.log('¿unflatten(flatten(order)) igual al original? →', deepEqual(unflatten(leaves), order));

// Un objeto COMPARTIDO no es un ciclo; uno que se contiene a sí mismo, sí.
const sharedAddress = { city: 'Sevilla' };
console.log('compartido →', flatten({ billing: sharedAddress, shipping: sharedAddress }).size, 'hojas');
const circular = { id: 'P-1043', lines: [] };
circular.lines.push({ sku: 'TE-01', order: circular }); // la línea apunta a su pedido
try {
  flatten(circular);
} catch (error) {
  console.log('circular →', error.message);
}
```
