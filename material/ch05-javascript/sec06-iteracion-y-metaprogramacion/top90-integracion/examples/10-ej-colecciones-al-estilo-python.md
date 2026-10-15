---
example_description: "Ejercicio: tres colecciones al estilo de Python hechas con Proxy: un defaultdict que no se deja engañar por toJSON ni por los símbolos, una lista con índices negativos e in que busca valores, y una vista de solo lectura que protege también los objetos anidados"
example_tags: "javascript|ejercicio|proxy|reflect|python|defaultdict|colecciones"
exercise: true
exercise_title: "Colecciones al estilo de Python"
exercise_instructions: "defaultDict(factory): al leer una clave de texto que no existe, la crea con factory() y la devuelve; los símbolos y la clave 'toJSON' se leen sin crear nada, porque los pide el propio lenguaje (JSON.stringify busca toJSON) || El operador in no debe crear claves: no necesita trampa || pyList(array): leer y asignar con índices negativos ('-1' es el último); el resto de lecturas y asignaciones, normales con Reflect || pyList: el operador in busca VALORES, como en Python ('mole' in menu), no índices || readOnly(object): asignar o borrar lanza TypeError('solo lectura: ' + clave); al leer un objeto anidado, devuélvelo también envuelto con readOnly || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "Las claves llegan como strings o como símbolos: comprueba typeof key === 'string' antes de nada || En defaultDict: if (typeof key === 'string' && key !== 'toJSON' && !(key in target)) target[key] = factory(); y después return Reflect.get(target, key, receiver) || Un índice negativo es un string que empieza por '-' y cuyo Number(key) es entero: conviértelo con target.length + Number(key) || La trampa de in es has(target, key); en pyList devuelve target.includes(key) || En readOnly, set y deleteProperty lanzan siempre; get usa Reflect.get y envuelve el resultado si es un objeto (typeof value === 'object' && value !== null)"
exercise_solution_example: 10-ej-colecciones-al-estilo-python-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: tres colecciones al estilo de Python, con Proxy. Completa los
// TODO (las trampas) hasta que todas las comprobaciones salgan ✓.

// TODO 1: trampa get. Crea las claves de texto que falten con factory(),
//         salvo 'toJSON'; los símbolos, tal cual.
function defaultDict(factory) {
  return new Proxy({}, {});
}

// TODO 2: trampas get y set con índices negativos, y has que busca valores.
function pyList(array) {
  return new Proxy(array, {});
}

// TODO 3: set y deleteProperty lanzan TypeError('solo lectura: clave');
//         get envuelve los objetos anidados.
function readOnly(object) {
  return new Proxy(object, {});
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}

// defaultdict
check('agrupar por inicial', () => {
  const byLetter = defaultDict(() => []);
  for (const dish of ['mole', 'mezcal', 'tamal', 'tlayuda', 'pozole']) byLetter[dish[0]].push(dish);
  return JSON.stringify(byLetter);
}, '{"m":["mole","mezcal"],"t":["tamal","tlayuda"],"p":["pozole"]}');
check('contar votos', () => {
  const votes = defaultDict(() => 0);
  for (const drink of ['café', 'té', 'café', 'atole', 'café']) votes[drink] += 1;
  return JSON.stringify(votes);
}, '{"café":3,"té":1,"atole":1}');
check('JSON.stringify no crea toJSON', () => JSON.stringify(defaultDict(() => 0)), '{}');
check('in no crea claves', () => {
  const empty = defaultDict(() => 0);
  const found = 'propina' in empty;
  return `${found} ${Object.keys(empty).length}`;
}, 'false 0');
check('los símbolos no crean nada', () => typeof defaultDict(() => [])[Symbol.iterator], 'undefined');

// lista con índices negativos
const temps = pyList([14, 17, 21, 24]);
check('temps[-1] y temps[-4]', () => `${temps[-1]} ${temps[-4]}`, '24 14');
check('temps[-1] = 25', () => {
  temps[-1] = 25;
  return temps.join(',');
}, '14,17,21,25');
check('in busca valores', () => {
  const menu = pyList(['mole', 'pozole']);
  return `${'mole' in menu} ${'0' in menu}`;
}, 'true false');
check('sigue siendo un array', () => `${Array.isArray(temps)} ${temps.length} ${[...temps].at(-1)}`, 'true 4 25');

// vista de solo lectura
const original = { theme: 'oscuro', limits: { cartItems: 20 } };
const settings = readOnly(original);
check('asignar lanza', () => {
  settings.theme = 'claro';
  return 'sin error';
}, 'TypeError: solo lectura: theme');
check('asignar en un objeto anidado lanza', () => {
  settings.limits.cartItems = 99;
  return 'sin error';
}, 'TypeError: solo lectura: cartItems');
check('borrar lanza', () => {
  delete settings.theme;
  return 'sin error';
}, 'TypeError: solo lectura: theme');
check('el original no cambió', () => JSON.stringify(original), '{"theme":"oscuro","limits":{"cartItems":20}}');
check('leer sigue funcionando', () => `${settings.theme} ${settings.limits.cartItems}`, 'oscuro 20');
```
