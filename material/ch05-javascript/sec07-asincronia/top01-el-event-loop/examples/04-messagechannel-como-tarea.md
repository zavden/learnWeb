---
example_description: "MessageChannel como fuente de tareas: cada mensaje es una tarea, y entre una tarea y la siguiente se vacían las microtareas (las que crea el primer mensaje se ejecutan antes que el segundo mensaje)"
example_tags: "javascript|event-loop|messagechannel|tareas|microtareas"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un MessageChannel es un «tubo» con dos extremos (port1 y port2): lo que
// envías por uno llega al otro como una TAREA nueva. Está pensado para hablar
// con workers (capítulo 8) e iframes, pero dentro de una misma página es la
// forma más directa de encolar una tarea sin temporizador.
const { port1, port2 } = new MessageChannel();
let received = 0;

// Asignar onmessage activa el puerto (con addEventListener habría que llamar
// a port1.start(); los eventos se estudian en el capítulo 6).
port1.onmessage = (event) => {
  const n = ++received;
  console.log(`📨 tarea ${n}: «${event.data}»`);
  queueMicrotask(() => {
    console.log(`   microtarea creada en la tarea ${n} → antes de la siguiente tarea`);
    if (n === 3) {
      port1.close(); // cerramos el canal: no queda nada escuchando en segundo plano
      console.log('🔒 canal cerrado');
    }
  });
};

console.log('script: envío tres avisos de stock');
port2.postMessage('café de Chiapas: quedan 3');
port2.postMessage('mole poblano: agotado');
port2.postMessage('cajeta: repuesto');
queueMicrotask(() => console.log('microtarea del script → antes que cualquier mensaje'));
console.log('script: termina');

// Orden: script → sus microtareas → mensaje 1 → SUS microtareas → mensaje 2…
// Cada mensaje es una tarea, y el event loop vacía las microtareas entre tarea
// y tarea. Las librerías de interfaz (el planificador de React, por ejemplo)
// usan MessageChannel para «ceder el turno» al navegador entre trozos de trabajo.
// (El orden entre FUENTES distintas, un mensaje frente a un setTimeout, no está
// garantizado: cada navegador prioriza sus colas a su manera.)
```
