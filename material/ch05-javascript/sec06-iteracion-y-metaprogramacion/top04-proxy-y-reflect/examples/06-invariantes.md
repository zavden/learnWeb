---
example_description: "Un proxy no puede mentir sobre lo que el objetivo garantiza: si el objetivo está congelado, una trampa get que transforma valores, un has que oculta claves o un ownKeys que las omite lanzan TypeError (invariantes); la solución es un objetivo no congelado"
example_tags: "javascript|proxy|invariantes|freeze|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un manejador de «presentación»: pone en mayúsculas los textos y oculta las
// claves internas (las que empiezan por _).
const isInternal = (key) => String(key).startsWith('_');
const presentation = {
  get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);
    return typeof value === 'string' ? value.toUpperCase() : value;
  },
  has(target, key) {
    return !isInternal(key) && Reflect.has(target, key);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target).filter((key) => !isInternal(key));
  },
};

// La configuración de la tienda está congelada (lección «Propiedades a fondo»):
// sus propiedades son de solo lectura y NO configurables.
const config = Object.freeze({ currency: 'mxn', country: 'mx', _apiKey: 'sk-123' });

// 🐛 Con el objeto congelado como objetivo, las tres trampas «mienten» sobre
//    algo que el objetivo GARANTIZA, y el motor lo comprueba tras cada trampa.
const display = new Proxy(config, presentation);
const attempts = {
  'display.currency': () => display.currency,
  "'_apiKey' in display": () => '_apiKey' in display,
  'Object.keys(display)': () => Object.keys(display),
};
for (const [code, run] of Object.entries(attempts)) {
  try {
    console.log(code, '→', run());
  } catch (error) {
    console.log(`🐛 ${code} → ${error.name}: ${error.message}`);
  }
}

// ✅ El mismo manejador sobre un objetivo que NO está congelado (una copia):
//    sus propiedades son configurables, y el proxy puede transformarlas u ocultarlas.
const view = new Proxy({ ...config }, presentation);
console.log('✅ currency →', view.currency, '| ¿_apiKey? →', '_apiKey' in view);
console.log('✅ claves →', Object.keys(view), '| JSON →', JSON.stringify(view));

// Las invariantes solo protegen lo que el objetivo promete: propiedades no
// configurables (freeze, defineProperty sin configurable) y objetos no
// extensibles (preventExtensions, seal, freeze). Con un objeto normal, las
// trampas pueden contar lo que quieran.
```
