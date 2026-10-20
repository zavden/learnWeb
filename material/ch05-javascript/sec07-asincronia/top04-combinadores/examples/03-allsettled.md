---
example_description: "Promise.allSettled espera a todas las operaciones, fallen o no, y devuelve un informe con el estado de cada una ({status, value} o {status, reason}): el envío de avisos a varios clientes, donde un fallo no debe tapar los éxitos"
example_tags: "javascript|python|promesas|allsettled|errores|informe"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Avisar a cuatro clientes de que su pedido salió. Algunos avisos fallan, y
// eso no debe impedir saber cuáles llegaron.
const recipients = [
  { name: 'Ana', channel: 'email', address: 'ana@example.com' },
  { name: 'Luis', channel: 'sms', address: '+52 55 0000 0000' },
  { name: 'Sofía', channel: 'email', address: 'sofia@example' },
  { name: 'Iván', channel: 'whatsapp', address: '+52 33 1234 5678' },
];

function notify({ name, channel, address }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (address.includes('0000 0000')) reject(new Error(`${name}: número no válido`));
      else if (channel === 'email' && !address.includes('.', address.indexOf('@'))) reject(new Error(`${name}: dominio sin punto`));
      else resolve(`${name} avisado por ${channel}`);
    }, 40);
  });
}

// Con Promise.all, el primer fallo taparía los demás resultados.
Promise.all(recipients.map(notify))
  .catch((error) => console.log('Promise.all → solo sabemos esto:', error.message));

// allSettled NUNCA se rechaza: espera a todas y describe cada una.
Promise.allSettled(recipients.map(notify)).then((results) => {
  console.log('primer resultado →', results[0]);
  for (const result of results) {
    if (result.status === 'fulfilled') console.log('  ✅', result.value);
    else console.log('  ⛔', result.reason.message);
  }
  const failed = results.filter((result) => result.status === 'rejected');
  console.log(`resumen → ${results.length - failed.length} enviados, ${failed.length} para revisar`);
});

// > Desde Python: es asyncio.gather(*avisos, return_exceptions=True), que
//   devuelve los resultados mezclados con las excepciones; allSettled los
//   envuelve en objetos { status, value | reason }.
```
