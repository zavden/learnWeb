---
example_description: "Un árbol de archivos iterable: recorrido en profundidad con un generador recursivo y yield*, en anchura con una cola, vista con sangrías, búsquedas que se detienen pronto y Symbol.toStringTag"
example_tags: "javascript|generadores|yield-star|arboles|recursion|iterables|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// EL PROYECTO DE UNA WEB como árbol de carpetas y archivos (tamaños en bytes).
// Lecciones: iterable propio con un método generador, yield* recursivo,
// recorridos perezosos con helpers y Symbol.toStringTag.
const project = {
  name: 'tienda',
  children: [
    { name: 'index.html', size: 4_210 },
    {
      name: 'css',
      children: [
        { name: 'base.css', size: 2_048 },
        { name: 'catalogo.css', size: 6_930 },
      ],
    },
    {
      name: 'img',
      children: [
        { name: 'logo.svg', size: 1_870 },
        { name: 'productos', children: [{ name: 'cafe.webp', size: 48_300 }, { name: 'mole.webp', size: 51_120 }] },
      ],
    },
    { name: 'js', children: [{ name: 'carrito.js', size: 9_480 }] },
  ],
};

class FileTree {
  #root;
  visited = 0; // cuántos nodos ha tocado el último recorrido

  constructor(root) {
    this.#root = root;
  }

  // Profundidad primero: cada nodo y, con yield*, todo lo que cuelga de él.
  static *#walk(node, path, depth, tree) {
    tree.visited += 1;
    yield { path, depth, node };
    for (const child of node.children ?? []) {
      yield* FileTree.#walk(child, `${path}/${child.name}`, depth + 1, tree);
    }
  }

  *[Symbol.iterator]() {
    this.visited = 0;
    yield* FileTree.#walk(this.#root, this.#root.name, 0, this);
  }

  // Anchura primero: una cola en vez de recursión (nivel a nivel).
  *breadthFirst() {
    const queue = [{ path: this.#root.name, depth: 0, node: this.#root }];
    while (queue.length > 0) {
      const entry = queue.shift();
      yield entry;
      for (const child of entry.node.children ?? []) {
        queue.push({ path: `${entry.path}/${child.name}`, depth: entry.depth + 1, node: child });
      }
    }
  }

  *files() {
    for (const entry of this) if (!entry.node.children) yield entry;
  }

  get [Symbol.toStringTag]() {
    return 'FileTree';
  }
}

const tree = new FileTree(project);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

console.group('Vista del árbol (profundidad primero)');
for (const { depth, node } of tree) {
  const label = node.children ? `📁 ${node.name}/` : `📄 ${node.name} (${kb(node.size)})`;
  console.log(`${'   '.repeat(depth)}${label}`);
}
console.groupEnd();

console.log('anchura primero →', tree.breadthFirst().map(({ node }) => node.name).toArray().join(' → '));
console.log('tamaño total →', kb(tree.files().reduce((sum, { node }) => sum + node.size, 0)));
console.log('imágenes →', tree.files().filter(({ path }) => path.includes('/img/')).map(({ path }) => path).toArray());

// find recorre solo hasta encontrarlo, y al cerrarse cierra los generadores anidados.
const firstCss = tree[Symbol.iterator]().find(({ node }) => node.name.endsWith('.css'));
console.log('primer .css →', firstCss.path, '| nodos visitados:', tree.visited, 'de', [...tree].length);

console.log('los 2 más grandes →', [...tree.files()].toSorted((a, b) => b.node.size - a.node.size).slice(0, 2).map(({ node }) => node.name));
console.log('etiqueta →', Object.prototype.toString.call(tree));

// > Desde Python: os.walk(…) es un generador; la recursión con yield from
//   es la misma que aquí con yield*.
```
