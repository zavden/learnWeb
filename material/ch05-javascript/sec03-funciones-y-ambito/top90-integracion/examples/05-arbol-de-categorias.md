---
example_description: "Árbol de categorías de una tienda: contar productos, migas de pan y opciones de un select con recursión, y actualizar un nodo sin mutar compartiendo las ramas que no cambian"
example_tags: "javascript|integracion|recursion|inmutabilidad|arboles|orden-superior"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// ÁRBOL DE CATEGORÍAS de una tienda de deportes.
// Integra: recursión («Recursión y pila de llamadas»), inmutabilidad y funciones
// que reciben funciones («Funciones de orden superior»), parámetros por defecto.
const catalog = {
  id: 'root', name: 'Deportes', products: 0,
  children: [
    { id: 'run', name: 'Running', products: 4, children: [
      { id: 'run-shoes', name: 'Zapatillas', products: 38 },
      { id: 'run-wear', name: 'Ropa técnica', products: 52 },
    ] },
    { id: 'mtn', name: 'Montaña', products: 6, children: [
      { id: 'mtn-boots', name: 'Botas', products: 21 },
      { id: 'mtn-climb', name: 'Escalada', products: 0, children: [
        { id: 'climb-ropes', name: 'Cuerdas', products: 9 },
        { id: 'climb-harness', name: 'Arneses', products: 7 },
      ] },
    ] },
    { id: 'swim', name: 'Natación', products: 17 },
  ],
};

// Productos de una categoría y de todas sus subcategorías.
function countProducts(node) {
  return node.products + (node.children ?? []).reduce((sum, child) => sum + countProducts(child), 0);
}

// Migas de pan: el camino de nombres desde la raíz hasta id (o null).
function breadcrumbs(node, id) {
  if (node.id === id) return [node.name];
  for (const child of node.children ?? []) {
    const trail = breadcrumbs(child, id);
    if (trail) return [node.name, ...trail];
  }
  return null;
}

// Opciones para un <select>: la sangría es la profundidad de la recursión.
function toOptions(node, depth = 0) {
  const own = { id: node.id, label: `${'— '.repeat(depth)}${node.name} (${countProducts(node)})` };
  return [own, ...(node.children ?? []).flatMap((child) => toOptions(child, depth + 1))];
}

// Actualización INMUTABLE: aplica update al nodo id y devuelve un árbol nuevo.
// Solo se crean de nuevo los nodos del camino; las demás ramas se comparten.
function updateNode(node, id, update) {
  if (node.id === id) return update(node);
  if (!node.children) return node;
  const children = node.children.map((child) => updateNode(child, id, update));
  const changed = children.some((child, i) => child !== node.children[i]);
  return changed ? { ...node, children } : node;
}

console.log('Total →', countProducts(catalog), 'productos');
console.log('Migas →', breadcrumbs(catalog, 'climb-ropes').join(' › '));
console.table(toOptions(catalog));

// Llegan 12 cuerdas nuevas y se renombra «Ropa técnica».
const restocked = updateNode(catalog, 'climb-ropes', (node) => ({ ...node, products: node.products + 12 }));
const renamed = updateNode(restocked, 'run-wear', (node) => ({ ...node, name: 'Ropa de running' }));

console.log('Escalada antes / después →', countProducts(catalog.children[1].children[1]), '/',
  countProducts(renamed.children[1].children[1]));                     // 16 / 28
console.log('¿original intacto? →', breadcrumbs(catalog, 'run-wear').at(-1)); // 'Ropa técnica'
console.log('¿Natación compartida? →', renamed.children[2] === catalog.children[2]);   // true
console.log('¿Montaña copiada? →', renamed.children[1] !== catalog.children[1]);       // true: está en el camino
console.log('¿id inexistente? →', updateNode(catalog, 'nope', (node) => node) === catalog); // true: nada cambia
```
