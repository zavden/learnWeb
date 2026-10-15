---
example_description: "Un objeto literal no es iterable: for…of, el spread y new Map lanzan TypeError, y Array.from devuelve [] sin avisar; se recorre con Object.entries, keys o values"
example_tags: "javascript|python|iterables|objetos|object-entries|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const settings = { theme: 'oscuro', fontSize: 16, language: 'es-MX' };

// 🐛 for…of, el spread y la desestructuración piden settings[Symbol.iterator],
//    y un objeto literal no lo tiene (no lo hereda de Object.prototype).
try {
  for (const entry of settings) console.log(entry);
} catch (error) {
  console.log('🐛 for…of →', error.name, '|', error.message);
}
try {
  const [first] = settings;
} catch (error) {
  console.log('🐛 desestructuración →', error.name, '|', error.message);
}
try {
  new Map(settings);
} catch (error) {
  console.log('🐛 new Map →', error.name, '|', error.message);
}

// 🐛 El más traicionero: Array.from NO lanza. Si el argumento no es iterable, lo
//    trata como «array-like» (un objeto con length), y sin length… la longitud es 0.
console.log('🐛 Array.from →', Array.from(settings));

// (El spread de OBJETOS, {...settings}, es otra cosa: copia propiedades, no itera.)
console.log('{...settings} →', { ...settings });

// ✅ Un objeto no es una colección: di qué quieres recorrer.
for (const [key, value] of Object.entries(settings)) {
  console.log(`✅ ${key} = ${value}`);
}
console.log('✅ claves →', Object.keys(settings));
console.log('✅ valores →', Object.values(settings));

// ✅ Si de verdad es una colección clave → valor, usa un Map: es iterable.
const settingsMap = new Map(Object.entries(settings));
console.log('✅ Map →', [...settingsMap.keys()]);

// > Desde Python: for k in un_dict recorre las claves, porque dict tiene
//   __iter__. Un objeto de JavaScript no es un dict: es un registro con
//   propiedades. Object.keys/values/entries son tus .keys(), .values() e .items().
```
