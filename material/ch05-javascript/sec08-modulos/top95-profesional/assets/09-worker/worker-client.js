// CLIENTE DEL WORKER (ejemplo 09): convierte el ir y venir de mensajes en
// promesas. Cada petición lleva un id; la respuesta con ese id cumple (o
// rechaza) su promesa. Si el worker falla al cargar, se rechazan todas.
export function createStatsClient(workerUrl) {
  const worker = new Worker(workerUrl, { type: 'module', name: 'estadísticas' });
  const pending = new Map(); // id → { resolve, reject }
  let nextId = 1;

  worker.addEventListener('message', (event) => {
    const { id, ok, message, ...result } = event.data;
    const request = pending.get(id);
    if (!request) return;
    pending.delete(id);
    if (ok) request.resolve(result);
    else request.reject(new Error(message));
  });

  worker.addEventListener('error', (event) => {
    event.preventDefault(); // lo manejamos aquí: que no salga como error sin atrapar
    for (const request of pending.values()) request.reject(new Error('el worker no pudo cargarse'));
    pending.clear();
  });

  return {
    request(payload) {
      const id = nextId++;
      const { promise, resolve, reject } = Promise.withResolvers();
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, ...payload });
      return promise;
    },
    terminate() {
      worker.terminate();
      for (const request of pending.values()) request.reject(new Error('worker cerrado'));
      pending.clear();
    },
  };
}
