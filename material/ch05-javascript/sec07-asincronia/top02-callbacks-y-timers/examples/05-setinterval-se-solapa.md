---
example_description: "setInterval no espera a que termine el trabajo asíncrono: un sondeo cada 80 ms con respuestas que tardan más se solapa (dos peticiones a la vez) y las respuestas llegan desordenadas; un setTimeout recursivo programa la siguiente petición solo cuando llega la respuesta"
example_tags: "javascript|setinterval|settimeout|sondeo|concurrencia|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El panel de un almacén consulta el stock del servidor cada 80 ms (en la
// vida real, cada pocos segundos). La «red» es simulada: cada petición tarda
// lo que dice LATENCIES y responde llamando a un callback.
const POLL_MS = 80;
const LATENCIES = [180, 50, 120, 60]; // ms de cada petición: la 1.ª es lenta

function fetchStock(requestNo, onResponse) {
  setTimeout(onResponse, LATENCIES[requestNo - 1], { requestNo, units: 40 - requestNo * 3 });
}

function createTracker() {
  let inFlight = 0;
  return {
    maxInFlight: 0,
    arrivals: [],
    start() {
      inFlight += 1;
      this.maxInFlight = Math.max(this.maxInFlight, inFlight);
    },
    finish(requestNo) {
      inFlight -= 1;
      this.arrivals.push(requestNo);
    },
  };
}

// 🐛 setInterval lanza una petición cada 80 ms, haya terminado o no la anterior.
function pollWithInterval(done) {
  const tracker = createTracker();
  let sent = 0;
  const intervalId = setInterval(() => {
    sent += 1;
    tracker.start();
    fetchStock(sent, (stock) => {
      tracker.finish(stock.requestNo);
      if (tracker.arrivals.length === LATENCIES.length) done(tracker);
    });
    if (sent === LATENCIES.length) clearInterval(intervalId);
  }, POLL_MS);
}

// ✅ setTimeout recursivo: la siguiente petición se programa AL LLEGAR la respuesta.
function pollWithTimeout(done) {
  const tracker = createTracker();
  let sent = 0;
  function poll() {
    sent += 1;
    tracker.start();
    fetchStock(sent, (stock) => {
      tracker.finish(stock.requestNo);
      if (sent < LATENCIES.length) setTimeout(poll, POLL_MS); // 80 ms de PAUSA tras cada respuesta
      else done(tracker);
    });
  }
  setTimeout(poll, POLL_MS);
}

pollWithInterval((tracker) => {
  console.log('🐛 setInterval → peticiones a la vez (máximo):', tracker.maxInFlight);
  console.log('   orden de llegada →', tracker.arrivals.join(', '), '(la 1 pisa a la 2 con datos más viejos)');
  pollWithTimeout((safeTracker) => {
    console.log('✅ setTimeout recursivo → peticiones a la vez (máximo):', safeTracker.maxInFlight);
    console.log('   orden de llegada →', safeTracker.arrivals.join(', '));
  });
});

// setInterval mide el tiempo entre COMIENZOS; si el trabajo tarda más que el
// intervalo (una petición lenta, un servidor saturado), las ejecuciones se
// solapan, se acumulan y llegan en cualquier orden. El setTimeout recursivo
// mide la PAUSA entre el final de una y el comienzo de la siguiente: nunca
// hay dos a la vez, y si el servidor va lento, se consulta menos.
```
