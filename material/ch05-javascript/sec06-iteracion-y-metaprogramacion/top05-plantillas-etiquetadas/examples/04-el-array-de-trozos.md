---
example_description: "El array strings de una plantilla etiquetada está congelado (modificarlo falla en silencio en un script clásico) y es el MISMO objeto en cada ejecución del mismo sitio del código: sirve como clave de caché para lo que depende del texto, nunca para el resultado"
example_tags: "javascript|plantillas|tagged-templates|freeze|cache|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
const grab = (strings) => strings; // una etiqueta que devuelve sus trozos
function interleave(parts, values) {
  let result = parts[0];
  for (let i = 0; i < values.length; i++) result += values[i] + parts[i + 1];
  return result;
}

// 🐛 1. Una etiqueta que «limpia» los trozos modificándolos en su sitio.
function compact(strings, ...values) {
  for (let i = 0; i < strings.length; i++) {
    strings[i] = strings[i].replaceAll('  ', ' '); // 🐛 strings está congelado
  }
  return interleave(strings, values);
}
const dish = 'tlayuda';
console.log('🐛 compact →', JSON.stringify(compact`Hoy  hay  ${dish}  con  tasajo`));
console.log('🐛 ¿strings congelado? →', Object.isFrozen(grab`x`));
// En un script clásico, asignar a un objeto congelado falla EN SILENCIO
// (lección «Propiedades a fondo»); en código estricto lanzaría TypeError.

// ✅ Trabaja con una copia: strings.map(…) crea un array nuevo.
function compactFixed(strings, ...values) {
  return interleave(strings.map((text) => text.replaceAll('  ', ' ')), values);
}
console.log('✅ compactFixed →', JSON.stringify(compactFixed`Hoy  hay  ${dish}  con  tasajo`));

// 2. El MISMO sitio del código entrega SIEMPRE el mismo array strings.
const seen = [];
for (const n of [1, 2, 3]) seen.push(grab`pedido ${n}`);
console.log('mismo sitio →', seen[0] === seen[1] && seen[1] === seen[2]);
console.log('otro sitio, mismo texto →', grab`pedido ${1}` === grab`pedido ${1}`);

// 🐛 Eso tienta a usarlo como clave de caché… del RESULTADO, que depende de los valores.
const cache = new WeakMap();
function badge(strings, ...values) {
  if (cache.has(strings)) return cache.get(strings); // 🐛 ignora los valores nuevos
  const html = interleave(strings, values);
  cache.set(strings, html);
  return html;
}
for (const customer of ['Ana', 'Luis', 'Sofía']) console.log('🐛 badge →', badge`👤 ${customer}`);

// ✅ La caché por strings vale para lo que depende SOLO del texto (como
//    analizar la plantilla una vez); los valores se procesan en cada llamada.
let analyses = 0;
const analysisCache = new WeakMap();
function badgeFixed(strings, ...values) {
  if (!analysisCache.has(strings)) {
    analyses += 1;
    analysisCache.set(strings, strings.map((text) => text.replaceAll('  ', ' ')));
  }
  return interleave(analysisCache.get(strings), values);
}
for (const customer of ['Ana', 'Luis', 'Sofía']) console.log('✅ badgeFixed →', badgeFixed`👤  ${customer}`);
console.log('✅ veces que se analizó el texto →', analyses);
```
