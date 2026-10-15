---
example_description: "Una prueba del contrato de la API pública: importa cada versión del barrel con import(), compara las claves de su espacio de nombres con lo prometido y encuentra lo que export * perdió (el default, los nombres en conflicto) y lo que filtró"
example_tags: "javascript|modulos|barrel|namespace|pruebas|import-dinamico"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/07-contrato/shop/):
//   money.js    → formatPrice, addVat
//   catalog.js  → findProduct, format (¡como weight.js!), normalizeSku (interna)
//   weight.js   → format
//   cart.js     → export default class Cart, MAX_ITEMS
//   index-v1.js → 🐛 export * de los cuatro
//   index-v2.js → ✅ la lista explícita, con format renombrado
//
// El contrato: lo que la tienda promete al resto de la aplicación.
const CONTRACT = {
  Cart: 'class',
  MAX_ITEMS: 'number',
  addVat: 'function',
  findProduct: 'function',
  formatPrice: 'function',
  formatProduct: 'function',
  formatWeight: 'function',
};

function kindOf(value) {
  if (typeof value !== 'function') return typeof value;
  return Function.prototype.toString.call(value).startsWith('class') ? 'class' : 'function';
}

async function checkApi(path) {
  const api = await import(path); // el espacio de nombres: una clave por exportación
  const problems = [];
  for (const [name, kind] of Object.entries(CONTRACT)) {
    if (!(name in api)) problems.push(`falta ${name}`);
    else if (kindOf(api[name]) !== kind) problems.push(`${name} es ${kindOf(api[name])}, no ${kind}`);
  }
  for (const name of Object.keys(api)) {
    if (!Object.hasOwn(CONTRACT, name)) problems.push(`sobra ${name} (¿es interna?)`);
  }
  return { api, problems };
}

for (const version of ['index-v1.js', 'index-v2.js']) {
  console.group(`▶ shop/${version}`);
  const { api, problems } = await checkApi(`./07-contrato/shop/${version}`);
  for (const problem of problems) console.log('✗', problem);
  if (problems.length === 0) {
    console.log('✓ la API coincide con el contrato:', Object.keys(api).join(', '));
    console.log('  prueba rápida →', new api.Cart().add('CAF-500').size, 'producto ·', api.findProduct(' caf-500 ').name);
  }
  console.groupEnd();
}

// v1 perdió Cart (export * no incluye el default) y los dos format (nombre en
// conflicto: desaparecen sin error), y filtró normalizeSku. Una prueba así,
// que se ejecuta con cada cambio, avisa antes de que lo note otro equipo.
```
