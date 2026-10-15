---
example_description: "Promise.all lanza varias operaciones a la vez y espera a todas: tarda lo que la más lenta (no la suma), devuelve los resultados en el orden de entrada y acepta cualquier iterable, también valores que no son promesas"
example_tags: "javascript|python|promesas|promise-all|paralelo|iterables"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El panel de una tienda necesita tres datos que no dependen entre sí.
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
const api = {
  getOrdersToday: () => wait(150, 42),
  getLowStock: () => wait(100, ['cajeta', 'mole poblano']),
  getNewCustomers: () => wait(200, 7),
};

const start = performance.now();

// Las tres peticiones EMPIEZAN aquí (una promesa ya está en marcha al
// crearse); Promise.all solo espera a que se cumplan todas.
Promise.all([api.getOrdersToday(), api.getLowStock(), api.getNewCustomers()])
  .then(([orders, lowStock, customers]) => {
    const elapsed = performance.now() - start;
    console.log('pedidos de hoy →', orders);
    console.log('stock bajo →', lowStock);
    console.log('clientes nuevos →', customers);
    // El orden de los resultados es el de ENTRADA, no el de llegada
    // (getLowStock llegó primero y aun así va en segundo lugar).
    console.log('tardó lo que la más lenta (< 300 ms, no 450) →', elapsed < 300);
    console.log(`   (≈ ${Math.round(elapsed)} ms; varía)`);
  })
  .then(() => {
    // Acepta cualquier ITERABLE (lección «Protocolo iterable»), y los valores
    // que no son promesas pasan tal cual.
    const ids = new Set(['P-1001', 'P-1002', 'P-1001']); // el Set quita el duplicado
    const getOrder = (id) => wait(30, `${id} ✓`);
    return Promise.all([...ids].map(getOrder).concat('sin espera'));
  })
  .then((results) => {
    console.log('ids de un Set + un valor normal →', results);
    return Promise.all([]); // sin nada que esperar: se cumple al instante
  })
  .then((empty) => console.log('Promise.all([]) →', empty));

// Patrón de todos los días: Promise.all(lista.map(funciónAsíncrona)).
// > Desde Python: es asyncio.gather(a(), b(), c()), con una diferencia de
//   reparto: gather recibe corrutinas y las programa; Promise.all recibe
//   promesas que YA estaban en marcha antes de llamarlo.
```
