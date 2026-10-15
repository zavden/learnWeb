---
example_description: "Solución: recorridos recursivos de un árbol de carpetas y una limpieza inmutable que solo copia las carpetas del camino que cambia"
example_tags: "javascript|solucion|recursion|arboles|inmutabilidad"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: recorrer y limpiar un árbol de carpetas.
const project = {
  name: 'web-tienda',
  children: [
    { name: 'index.html', size: 4200 },
    { name: 'notas.tmp', size: 900 },
    { name: 'css', children: [{ name: 'base.css', size: 3100 }, { name: 'layout.css', size: 5400 }] },
    {
      name: 'js',
      children: [
        { name: 'app.js', size: 12800 },
        { name: 'app.js.tmp', size: 12750 },
        { name: 'utils', children: [{ name: 'format.js', size: 2100 }] },
      ],
    },
    { name: 'img', children: [{ name: 'logo.svg', size: 1800 }, { name: 'hero.webp', size: 48500 }] },
    { name: 'vacia', children: [] },
  ],
};

function totalSize(node) {
  if (!node.children) return node.size; // caso base: un archivo
  return node.children.reduce((sum, child) => sum + totalSize(child), 0);
}

function countFiles(node) {
  if (!node.children) return 1;
  return node.children.reduce((count, child) => count + countFiles(child), 0);
}

function largestFile(node) {
  if (!node.children) return { name: node.name, size: node.size };
  let largest = null; // una carpeta vacía no tiene archivos
  for (const child of node.children) {
    const candidate = largestFile(child);
    if (candidate && (largest === null || candidate.size > largest.size)) largest = candidate;
  }
  return largest;
}

function findPath(node, name) {
  if (node.name === name) return node.name;
  for (const child of node.children ?? []) {
    const path = findPath(child, name);
    if (path) return `${node.name}/${path}`; // encontrado más abajo: antepón la carpeta
  }
  return null;
}

function withoutTempFiles(node) {
  if (!node.children) return node; // un archivo se queda como está (el filtro lo hace su carpeta)
  const kept = node.children
    .filter((child) => child.children || !child.name.endsWith('.tmp'))
    .map((child) => withoutTempFiles(child));
  // ¿Ha cambiado algo? Mismo número de hijos y cada uno es el MISMO objeto → nada.
  const unchanged = kept.length === node.children.length && kept.every((child, i) => child === node.children[i]);
  return unchanged ? node : { ...node, children: kept };
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
const childNamed = (node, name) => node.children?.find((child) => child.name === name);

check('totalSize(project)', totalSize(project), 91550);
check('totalSize de css', totalSize(childNamed(project, 'css')), 8500);
check('totalSize de una carpeta vacía', totalSize(childNamed(project, 'vacia')), 0);
check('countFiles(project)', countFiles(project), 9);
check('largestFile(project)', JSON.stringify(largestFile(project)), '{"name":"hero.webp","size":48500}');
check('largestFile de una carpeta vacía', largestFile(childNamed(project, 'vacia')), null);
check('findPath de format.js', findPath(project, 'format.js'), 'web-tienda/js/utils/format.js');
check('findPath de un archivo que no existe', findPath(project, 'README.md'), null);

const clean = withoutTempFiles(project);
check('limpio: archivos', countFiles(clean), 7);
check('limpio: bytes', totalSize(clean), 77900);
check('el original sigue con sus 9 archivos', countFiles(project), 9);
check('css no cambia: es la MISMA carpeta', childNamed(clean, 'css') === childNamed(project, 'css'), true);
check('js cambia: es una carpeta NUEVA', childNamed(clean, 'js') !== childNamed(project, 'js'), true);
check('utils (dentro de js) se comparte', childNamed(childNamed(clean, 'js'), 'utils') === childNamed(childNamed(project, 'js'), 'utils'), true);
```
