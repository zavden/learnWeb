---
example_description: "Una dependencia circular de tres módulos (user → permissions → roles → user) que rompe la carga con un ReferenceError, un analizador que lee los archivos y encuentra el ciclo, y la refactorización que lo elimina moviendo lo que lo cerraba a su propio módulo"
example_tags: "javascript|profesional|modulos|dependencias-circulares|tdz|refactorizar|grafo"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN CICLO DE TRES MÓDULOS, SU DIAGNÓSTICO Y SU ARREGLO.
//
// Archivos (assets/07-ciclo/):
//   v1/user.js → permissions.js → roles.js → user.js   🔁 un ciclo
//      roles.js crea SYSTEM_USER = new User(…) en su nivel superior
//   v1/admin-panel.js → importa user.js y roles.js
//   v2/roles.js (solo datos) ← permissions.js ← user.js ← system-user.js
//   v2/admin-panel.js → importa user.js y system-user.js
//
// Decisiones:
// - Los ciclos se buscan con una herramienta, no a ojo: aquí, un analizador
//   de 40 líneas que lee el texto de cada archivo (como hacen madge o la
//   regla import/no-cycle de ESLint en proyectos reales).
// - El arreglo no es «reordenar los imports hasta que funcione», sino que
//   las dependencias vayan en un solo sentido: datos ← reglas ← entidades ←
//   lo que las combina.
//
// Alcance: módulos 1-8. fetch es del capítulo 6: aquí solo descarga el TEXTO
// de cada archivo para analizarlo.

function dependenciesOf(code) {
  return code.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('import ') && line.includes(' from \'./'))
    .map((line) => line.slice(line.lastIndexOf(' from ') + 9, line.lastIndexOf('\'')));
}

async function readGraph(entryPath) {
  const entryUrl = import.meta.resolve(entryPath);
  const folder = entryUrl.slice(0, entryUrl.lastIndexOf('/') + 1);
  const graph = new Map(); // archivo → sus imports, en orden
  const pending = [entryUrl.slice(folder.length)];
  while (pending.length > 0) {
    const name = pending.shift();
    if (graph.has(name)) continue;
    const response = await fetch(folder + name);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const dependencies = dependenciesOf(await response.text());
    graph.set(name, dependencies);
    pending.push(...dependencies);
  }
  return graph;
}

// Recorrido en profundidad: el orden de evaluación (postorden) y, si lo hay,
// el primer ciclo (el camino actual vuelve a un archivo «en curso»).
function analyze(graph, entry) {
  const order = [];
  const path = [];
  let cycle = null;
  function visit(name) {
    if (order.includes(name)) return;
    if (path.includes(name)) {
      cycle ??= [...path.slice(path.indexOf(name)), name];
      return;
    }
    path.push(name);
    for (const dependency of graph.get(name)) visit(dependency);
    path.pop();
    order.push(name);
  }
  visit(entry);
  return { order, cycle };
}

for (const version of ['v1', 'v2']) {
  console.group(`▶ ${version}: análisis estático`);
  const graph = await readGraph(`./07-ciclo/${version}/admin-panel.js`);
  const { order, cycle } = analyze(graph, 'admin-panel.js');
  console.log(cycle ? `🔁 ciclo: ${cycle.join(' → ')}` : '✓ sin ciclos');
  console.log('orden de evaluación →', order.join(' → '));
  console.groupEnd();

  console.group(`▶ ${version}: en el navegador`);
  try {
    const panel = await import(`./07-ciclo/${version}/admin-panel.js`);
    console.log(panel.describeAccess('Ana', 'admin', 'reembolsar'));
    console.log(panel.describeAccess('Luis', 'staff', 'editar-precios'));
    console.log('usuario del sistema →', panel.SYSTEM);
  } catch (error) {
    console.log('⛔', error.name, '|', error.message);
  }
  console.groupEnd();
}

// En v1, roles.js se evaluó PRIMERO (era la hoja del recorrido) y su
// «new User(…)» llegó antes que la clase: user.js estaba «en curso», esperando
// a sus dependencias. Si otro archivo hubiera importado antes roles.js, el
// error no saldría… hasta el día en que cambiara el orden.
// En v2, lo que cerraba el ciclo (crear un usuario dentro de los datos de
// roles) vive en system-user.js, arriba del todo: el grafo ya no tiene ciclos.
```
