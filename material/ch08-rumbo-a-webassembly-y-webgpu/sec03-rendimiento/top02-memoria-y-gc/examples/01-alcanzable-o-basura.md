---
example_description: "Un modelo de juguete del recolector de basura: los objetos son nodos, las referencias flechas, y basura es todo lo que no se alcanza desde las raíces (variables globales, la pila, los listeners registrados). Un ciclo inalcanzable es basura aunque sus objetos se apunten entre sí, al revés que con un contador de referencias"
example_tags: "javascript|python|memoria|recolector-de-basura|alcanzabilidad|ciclos"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El montón (heap) de una tienda, dibujado como un grafo: cada objeto dice a quién apunta.
const heap = {
  window: ['app'],
  app: ['cart', 'user'],
  cart: ['line1', 'line2'],
  line1: ['coffee'],
  line2: ['mole'],
  user: [],
  coffee: [],
  mole: [],
  oldCart: ['line3'],                  // el carrito del pedido anterior: ya nadie lo apunta
  line3: ['bread'],
  bread: [],
  menuPopup: ['menuItems'],            // un menú desplegable cerrado…
  menuItems: ['menuPopup'],            // …y sus opciones: se apuntan entre sí (un ciclo)
  listeners: ['onResize'],             // los listeners que el navegador tiene registrados
  onResize: ['salesReport'],           // una función que usa el informe de ventas
  salesReport: [],
};
// Las raíces: lo que siempre está vivo (globales, la pila de llamadas, los listeners…).
const roots = ['window', 'listeners'];

// FASE DE MARCADO: recorre las flechas desde las raíces y marca todo lo alcanzable.
function markReachable(graph, rootNames) {
  const marked = new Set();
  const pending = [...rootNames];
  while (pending.length > 0) {
    const node = pending.pop();
    if (marked.has(node)) continue; // ya visitado: así los ciclos no lo cuelgan
    marked.add(node);
    pending.push(...graph[node]);
  }
  return marked;
}
const garbageOf = (graph) => {
  const alive = markReachable(graph, roots);
  return Object.keys(graph).filter((node) => !alive.has(node));
};

console.log('vivos →', [...markReachable(heap, roots)].sort().join(', '));
console.log('basura →', garbageOf(heap).join(', '));

// Un contador de referencias (lo que hace CPython primero) libera un objeto cuando
// nadie lo apunta. En el ciclo, cada uno tiene una referencia (la del otro): nunca llega a 0.
const incoming = (target) => Object.values(heap).filter((targets) => targets.includes(target)).length;
console.log('referencias a menuPopup →', incoming('menuPopup'), '· a menuItems →', incoming('menuItems'));
console.log('¿el ciclo es basura para un recolector que marca desde las raíces? →', garbageOf(heap).includes('menuPopup'));

// Se envía el pedido: la app suelta el carrito. Todo lo que colgaba de él queda inalcanzable…
heap.app = ['user'];
console.log('tras enviar el pedido, basura →', garbageOf(heap).join(', '));
// …y el informe sigue vivo solo porque un listener lo usa. Quitar el listener lo libera.
heap.listeners = [];
console.log('tras quitar el listener, ¿salesReport es basura? →', garbageOf(heap).includes('salesReport'));

// Desde Python: CPython cuenta referencias (sys.getrefcount) y libera al llegar a 0; para
// los ciclos tiene además un recolector aparte, el módulo gc. V8 solo marca desde las raíces.
```
