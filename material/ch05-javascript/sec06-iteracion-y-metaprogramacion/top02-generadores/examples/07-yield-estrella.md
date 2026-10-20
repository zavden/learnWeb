---
example_description: "yield* delega en otro iterable y entrega sus valores uno a uno: recorrer un árbol con un generador recursivo, concatenar iterables y la diferencia con yield; el yield from de Python"
example_tags: "javascript|python|generadores|yield-star|recursion|arboles"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El mapa de secciones de una tienda en línea: un árbol.
const site = {
  name: 'tienda',
  children: [
    { name: 'café', children: [{ name: 'chiapas' }, { name: 'veracruz' }] },
    { name: 'pan', children: [{ name: 'conchas' }, { name: 'orejas' }] },
    { name: 'contacto' },
  ],
};

// yield* entrega, uno a uno, todos los valores de OTRO iterable: aquí, los de
// la llamada recursiva para cada hijo.
function* paths(node, prefix = '') {
  const path = `${prefix}/${node.name}`;
  yield path;
  for (const child of node.children ?? []) yield* paths(child, path);
}

for (const path of paths(site)) console.log('ruta →', path);

// 🤔 Con yield (sin asterisco) se entregaría el generador ENTERO como un valor:
function* shallowPaths(node) {
  yield node.name;
  for (const child of node.children ?? []) yield paths(child, '');
}
console.log('con yield →', [...shallowPaths(site)].map((value) => Object.prototype.toString.call(value)));

// Sigue siendo perezoso: buscar se detiene en cuanto encuentra (find cierra
// toda la cadena de generadores anidados).
console.log('primera ruta de pan →', paths(site).find((path) => path.startsWith('/tienda/pan/')));

// yield* acepta cualquier iterable: arrays, strings, Sets, Maps…
function* concat(...iterables) {
  for (const iterable of iterables) yield* iterable;
}
console.log('concat →', [...concat(['a', 'b'], 'xy', new Set([1, 2]))]);

// > Desde Python: yield* es yield from. También devuelve el valor del return
//   del generador delegado (ejemplo siguiente).
```
