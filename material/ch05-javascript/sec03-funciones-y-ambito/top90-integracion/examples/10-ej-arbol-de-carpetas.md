---
example_description: "Ejercicio: funciones recursivas sobre un árbol de carpetas (tamaño, archivos, el mayor, ruta) y una limpieza inmutable que comparte las ramas que no cambian"
example_tags: "javascript|ejercicio|recursion|arboles|inmutabilidad"
exercise: true
exercise_title: "Recorre y limpia un árbol de carpetas"
exercise_instructions: "totalSize(node): suma los bytes de todos los archivos (un archivo tiene size; una carpeta, children) || countFiles(node): cuántos archivos hay (las carpetas no cuentan) || largestFile(node): el archivo más grande como { name, size }, o null si no hay ninguno || findPath(node, name): la ruta 'web-tienda/js/utils/format.js' del primer nodo con ese nombre, o null || withoutTempFiles(node): devuelve un árbol NUEVO sin los archivos que terminan en '.tmp', sin modificar el original || Si en una carpeta no se quita nada, devuelve esa misma carpeta (no una copia) || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "Todas siguen el mismo esquema: caso base para un archivo (!node.children) y caso recursivo que combina el resultado de cada hijo || totalSize y countFiles caben en un reduce sobre node.children || En largestFile, compara los candidatos de los hijos y quédate con el de mayor size; cuidado con los null || findPath: si un hijo devuelve una ruta, antepón el nombre de la carpeta con `${node.name}/${ruta}` || withoutTempFiles: filtra los hijos que son .tmp, aplica la función a los que quedan y compara con === para saber si algo cambió (como updateNode en «Árbol de categorías»)"
exercise_solution_example: 10-ej-arbol-de-carpetas-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cinco funciones recursivas hasta que todo salga ✓.
// Un archivo tiene size (bytes); una carpeta tiene children.
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
  // TODO 1: caso base (archivo) y suma recursiva de los hijos.
  return 0;
}

function countFiles(node) {
  // TODO 2: un archivo cuenta 1; una carpeta, la suma de sus hijos.
  return 0;
}

function largestFile(node) {
  // TODO 3: { name, size } del archivo más grande, o null si no hay archivos.
  return null;
}

function findPath(node, name) {
  // TODO 4: 'web-tienda/js/utils/format.js', o null si no aparece.
  return null;
}

function withoutTempFiles(node) {
  // TODO 5: árbol nuevo sin los archivos .tmp; el original no se toca y las
  // carpetas en las que no se quita nada se devuelven tal cual.
  return node;
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
