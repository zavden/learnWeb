---
example_description: "Llamar a una función async sin await la ARRANCA en el acto (no como una corrutina de Python, que no hace nada hasta el await): sirve para lanzar varias cosas a la vez y esperarlas después, como asyncio.create_task"
example_tags: "javascript|python|async|await|create-task|concurrencia"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendInvoice(orderId) {
  console.log(`  📨 ${orderId}: empiezo a generar la factura`);
  await wait(100);
  console.log(`  📨 ${orderId}: factura enviada`);
  return `FAC-${orderId}`;
}
async function printLabel(orderId) {
  console.log(`  🏷️ ${orderId}: empiezo a imprimir la etiqueta`);
  await wait(100);
  console.log(`  🏷️ ${orderId}: etiqueta impresa`);
  return `ETQ-${orderId}`;
}

async function main() {
  // 1. Sin await, la función ya está en marcha: su primer log sale AHORA.
  console.log('▶ llamar sin await');
  const invoice = sendInvoice('P-1');
  console.log('  la llamada volvió: la factura ya se está generando');
  console.log('  resultado →', await invoice); // esperamos más tarde

  // 2. Con await en cada llamada: una detrás de otra.
  console.log('▶ una detrás de otra');
  let start = performance.now();
  await sendInvoice('P-2');
  await printLabel('P-2');
  console.log('  tardó ≥ 200 ms →', performance.now() - start >= 200);

  // 3. Lanzar las dos y esperarlas después: a la vez.
  console.log('▶ las dos a la vez');
  start = performance.now();
  const invoicePromise = sendInvoice('P-3'); // arranca
  const labelPromise = printLabel('P-3');    // arranca
  const results = await Promise.all([invoicePromise, labelPromise]); // espera a las dos
  console.log('  resultados →', results, '| tardó < 180 ms →', performance.now() - start < 180);
}
main();

// ⚠️ Una promesa lanzada y NUNCA esperada (ni con await ni con catch) es una
// promesa suelta: si se rechaza, su error sale como «Uncaught (in promise)».
// Si lanzas algo sin esperar, guárdalo y espéralo después, o ponle un catch.
// > Desde Python: aquí está la gran diferencia. send_invoice('P-1') sin await
//   crea una corrutina DORMIDA que no ejecuta nada (y Python avisa con
//   «coroutine … was never awaited»). Para que arranque sin esperarla hay que
//   llamar a asyncio.create_task(send_invoice('P-1')). En JavaScript, la
//   llamada misma es el create_task.
```
