---
example_description: "Solución: defaultDict con una trampa get que deja pasar símbolos y toJSON, pyList con get/set para índices negativos y has que busca valores, y readOnly con set/deleteProperty que lanzan y un get que envuelve lo anidado"
example_tags: "javascript|solucion|proxy|reflect|python|defaultdict|colecciones"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: tres colecciones al estilo de Python, con Proxy.

// ✅ 1. Solo las claves de texto «de datos» se crean; el lenguaje también lee
//       toJSON y símbolos (JSON.stringify, el spread, la consola…).
function defaultDict(factory) {
  return new Proxy({}, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key !== 'toJSON' && !(key in target)) target[key] = factory();
      return Reflect.get(target, key, receiver);
    },
  });
}

// ✅ 2. '-1' → length - 1, al leer y al escribir; in busca valores (__contains__).
function pyList(array) {
  const resolve = (target, key) => {
    if (typeof key === 'string' && key.startsWith('-') && Number.isInteger(Number(key))) {
      return String(target.length + Number(key));
    }
    return key;
  };
  return new Proxy(array, {
    get(target, key, receiver) {
      return Reflect.get(target, resolve(target, key), receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, resolve(target, key), value, receiver);
    },
    has(target, key) {
      return target.includes(key);
    },
  });
}

// ✅ 3. Ninguna escritura llega al objetivo; lo anidado sale también protegido.
function readOnly(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === 'object' && value !== null ? readOnly(value) : value;
    },
    set(target, key) {
      throw new TypeError(`solo lectura: ${String(key)}`);
    },
    deleteProperty(target, key) {
      throw new TypeError(`solo lectura: ${String(key)}`);
    },
  });
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
