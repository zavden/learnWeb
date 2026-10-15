---
example_description: "await en el nivel superior (top-level await): solo existe en los módulos; LearnWeb convierte el script en módulo al verlo, y eso cambia otras cosas: las variables de nivel superior no son globales y this vale undefined"
example_tags: "javascript|python|async|await|top-level-await|modulos"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Este script usa await FUERA de una función async. Eso solo se permite en
// los MÓDULOS (<script type="module">), que se estudian en el módulo 8.
// LearnWeb lo detecta y carga el script como módulo automáticamente.
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
const loadSettings = () => wait(50, { currency: 'MXN', taxRate: 0.16 });

console.log('1. empieza el módulo');
const settings = await loadSettings(); // ← sin async function main() alrededor
console.log('2. ajustes cargados →', settings);

const [orders, customers] = await Promise.all([wait(30, 42), wait(40, 7)]);
console.log('3. pedidos y clientes →', orders, customers);

// Ser un módulo cambia más cosas que el await (módulo 8):
var shopName = 'Café La Huasteca';
console.log('¿un var de nivel superior acaba en window? →', 'shopName' in globalThis); // clásico: true
console.log('this en el nivel superior →', this);                                    // clásico: window
console.log('¿modo estricto? →', (function () { return this === undefined; })());   // clásico: false

// En un script clásico, este mismo código daría un SyntaxError en el primer
// await. La alternativa de siempre es envolverlo todo en una función:
//   async function main() { const settings = await loadSettings(); … }
//   main();
// Un await de nivel superior pausa la evaluación DEL MÓDULO (y de los que lo
// importen), no la página: el event loop sigue funcionando.
// > Desde Python: es como si el archivo entero fuera el cuerpo de
//   asyncio.run(main()). En el REPL de Python (python -m asyncio) y en
//   Jupyter también puedes escribir await en el nivel superior.
```
