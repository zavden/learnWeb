---
example_description: "Tres formas de crear un worker que suman la misma cuenta: un archivo clásico, un archivo de módulo ({ type: 'module' }, con import) y un Blob con el código en un texto (con revokeObjectURL); y el error de crear como clásico un worker que usa import"
example_tags: "javascript|workers|modulos|blob|importscripts|createobjecturl|close"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Los archivos están en 03-ways/ («Assets»): classic-worker.js, module-worker.js y money.js.
const prices = [349, 129.5, 567]; // un comal, un molcajete y una olla de barro

// Envía la cuenta y espera UNA respuesta (o un error). Después cierra el worker.
function ask(worker) {
  return new Promise((resolve) => {
    worker.onmessage = (event) => resolve(event.data);
    worker.onerror = (event) => {
      event.preventDefault(); // lo imprimimos nosotros: que no salga además como «Uncaught»
      resolve(`🐛 ${event.message}`);
    };
    worker.postMessage(prices);
  }).finally(() => worker.terminate());
}

// 1. Un archivo clásico
console.log('clásico (archivo) →', await ask(new Worker('03-ways/classic-worker.js')));

// 2. Un archivo de módulo: puede importar otros módulos (money.js)
console.log('módulo (archivo, con import) →', await ask(new Worker('03-ways/module-worker.js', { type: 'module' })));

// 3. Un Blob: el código va en un texto de la página. Útil para demos pequeñas.
const code = `
  self.onmessage = (event) => {
    const total = event.data.reduce((sum, price) => sum + price, 0);
    self.postMessage(new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total));
    self.close(); // un worker también puede cerrarse a sí mismo
  };
`;
const blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const blobWorker = new Worker(blobUrl);
URL.revokeObjectURL(blobUrl); // el worker ya tiene su código: la URL sobra
console.log('blob (texto en la página) →', await ask(blobWorker));

// 🐛 Un archivo con import creado SIN { type: 'module' }: el worker no llega a arrancar.
console.log('módulo creado como clásico →', await ask(new Worker('03-ways/module-worker.js')));
```
