---
example_description: "Dos workers conectados directamente: la página crea un MessageChannel y transfiere un puerto a cada worker; el lector genera 500 pedidos y los envía por su puerto a la contable, que solo devuelve el resumen: los pedidos no pasan por la página"
example_tags: "javascript|workers|messagechannel|messageport|transferibles|pipeline"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
function inlineWorker(code) {
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

// El lector «lee» 500 pedidos (aquí los genera) y los envía por SU puerto.
const reader = inlineWorker(`
  self.onmessage = (event) => {
    const { port, count } = event.data; // el puerto llegó dentro del mensaje
    for (let i = 1; i <= count; i++) port.postMessage({ id: i, amount: 100 + ((i * 37) % 900) });
    port.postMessage(null); // fin de la lista
  };
`);
// La contable recibe por SU puerto y solo envía a la página el resumen.
const accountant = inlineWorker(`
  self.onmessage = (event) => {
    const { port } = event.data;
    let count = 0;
    let total = 0;
    port.onmessage = (message) => { // asignar onmessage pone el puerto en marcha
      if (message.data === null) {
        self.postMessage({ count, total });
        port.close();
        return;
      }
      count += 1;
      total += message.data.amount;
    };
  };
`);

let pageMessages = 0;
accountant.onmessage = (event) => {
  pageMessages += 1;
  const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  console.log(`contable → ${event.data.count} pedidos recibidos por el puerto · total ${formatMXN(event.data.total)}`);
  console.log('mensajes que recibió la página →', pageMessages);
  reader.terminate();
  accountant.terminate();
};

// Un canal = dos puertos conectados. Cada puerto se TRANSFIERE a un worker: un
// MessagePort no se puede copiar (es un extremo de un tubo), solo cambiar de dueño.
const { port1, port2 } = new MessageChannel();
reader.postMessage({ port: port1, count: 500 }, [port1]);
accountant.postMessage({ port: port2 }, [port2]);
console.log('página: lector y contable conectados con un MessageChannel');

// Python: multiprocessing.Pipe() devuelve los dos extremos de una tubería, que se
// pasan a dos procesos: es exactamente un MessageChannel.
```
