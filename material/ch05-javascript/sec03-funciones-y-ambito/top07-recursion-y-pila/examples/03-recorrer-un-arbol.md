---
example_description: "Donde la recursión brilla: datos anidados de profundidad desconocida. Tamaño de un árbol de carpetas, dibujarlo con sangría y buscar la ruta de un archivo"
example_tags: "javascript|python|recursion|arboles|datos-anidados"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un árbol de carpetas: cada carpeta tiene children; cada archivo, size (bytes).
const project = {
  name: 'web-tienda',
  children: [
    { name: 'index.html', size: 4200 },
    { name: 'css', children: [{ name: 'base.css', size: 3100 }, { name: 'layout.css', size: 5400 }] },
    {
      name: 'js',
      children: [
        { name: 'app.js', size: 12800 },
        { name: 'utils', children: [{ name: 'format.js', size: 2100 }, { name: 'money.js', size: 1650 }] },
      ],
    },
    { name: 'img', children: [{ name: 'logo.svg', size: 1800 }] },
  ],
};

// El tamaño de una carpeta es la suma de los tamaños de lo que contiene,
// y cada cosa puede ser otra carpeta: la definición YA es recursiva.
function totalSize(node) {
  if (!node.children) return node.size; // caso base: un archivo
  return node.children.reduce((sum, child) => sum + totalSize(child), 0);
}

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

// Dibujar el árbol: la profundidad de la recursión es la sangría.
function printTree(node, depth = 0) {
  const icon = node.children ? '📁' : '📄';
  console.log(`${'   '.repeat(depth)}${icon} ${node.name} (${formatKb(totalSize(node))})`);
  for (const child of node.children ?? []) {
    printTree(child, depth + 1);
  }
}
printTree(project);

// Buscar un archivo y devolver su ruta: cada nivel añade su nombre.
function findPath(node, target) {
  if (node.name === target) return [node.name];
  for (const child of node.children ?? []) {
    const path = findPath(child, target);
    if (path) return [node.name, ...path]; // encontrado más abajo
  }
  return null; // no está en esta rama
}
console.log('ruta de money.js →', findPath(project, 'money.js')?.join('/'));
console.log('ruta de README →', findPath(project, 'README.md'));

// Con un bucle normal no sabrías cuántos for anidar: la profundidad no se conoce
// de antemano. La recursión se adapta a la forma de los datos.
```
