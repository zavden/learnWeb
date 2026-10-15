---
example_description: "Un mini enlazador de módulos: varios archivos escritos como texto, sus import leídos con métodos de string, el orden de evaluación en postorden con detección de ciclos, y cada archivo convertido en un Blob cuyas rutas './x.js' se cambian por URLs blob:"
example_tags: "javascript|modulos|blob|import-dinamico|grafo|evaluacion"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Sin archivos en assets/: tres «archivos» como textos, como en un playground.
const files = {
  'main.js': `import { cartTotal } from './cart.js';
import { formatPrice } from './money.js';
export function run() { return 'Total con IVA: ' + formatPrice(cartTotal([21000, 54900])); }`,
  'cart.js': `import { addVat } from './money.js';
export function cartTotal(prices) { return addVat(prices.reduce((sum, cents) => sum + cents, 0)); }`,
  'money.js': `export const addVat = (cents) => Math.round(cents * 1.16);
export const formatPrice = (cents) => '$' + (cents / 100).toFixed(2);`,
};

// 1. Las dependencias de un archivo: las líneas «import … from './x.js'».
function dependenciesOf(code) {
  return code.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('import ') && line.includes(' from \'./'))
    .map((line) => line.slice(line.lastIndexOf(' from ') + 9, line.lastIndexOf('\'')));
}

// 2. El orden de evaluación: en profundidad, hojas primero (postorden), con
//    el camino actual a mano para descubrir los ciclos.
function evaluationOrder(sources, entry) {
  const order = [];
  const path = [];
  function visit(name) {
    if (order.includes(name)) return;
    if (path.includes(name)) throw new Error(`ciclo: ${[...path.slice(path.indexOf(name)), name].join(' → ')}`);
    if (!Object.hasOwn(sources, name)) throw new Error(`no existe ${name}`);
    path.push(name);
    for (const dependency of dependenciesOf(sources[name])) visit(dependency);
    path.pop();
    order.push(name);
  }
  visit(entry);
  return order;
}

// 3. Enlazar: cada archivo, en ese orden, se convierte en un Blob después de
//    cambiar sus './dep.js' por la URL blob: de la dependencia (que ya existe).
async function link(sources, entry) {
  const urls = new Map();
  for (const name of evaluationOrder(sources, entry)) {
    let code = sources[name];
    for (const [dependency, url] of urls) code = code.replaceAll(`'./${dependency}'`, `'${url}'`);
    urls.set(name, URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
  }
  try {
    return await import(urls.get(entry));
  } finally {
    for (const url of urls.values()) URL.revokeObjectURL(url);
  }
}

console.log('orden (hojas primero) →', evaluationOrder(files, 'main.js').join(' → '));
const main = await link(files, 'main.js');
console.log('main.js →', main.run());

const cyclic = { 'a.js': "import { b } from './b.js';\nexport const a = 1;", 'b.js': "import { a } from './a.js';\nexport const b = 2;" };
const broken = { 'main.js': "import { x } from './utils.js';\nexport const y = x;" };
for (const [sources, entry] of [[cyclic, 'a.js'], [broken, 'main.js']]) {
  try {
    await link(sources, entry);
  } catch (error) {
    console.log('⛔', error.message);
  }
}

// Con Blobs, un ciclo es imposible: la URL de a.js depende de su texto, que
// necesita la URL de b.js, que necesita la de a.js. El navegador sí admite
// ciclos porque primero crea TODOS los módulos y después los enlaza.
```
