// RPC SOBRE postMessage (ejemplo 01): llamar a las funciones de un worker como si
// fueran métodos asíncronos de un objeto. Un mismo módulo con las dos mitades:
// exposeWorkerApi() se usa DENTRO del worker; createWorkerClient(), en la página.
//
// Protocolo:
//   página → worker: { id, method, args } · { id, cancel: true }
//   worker → página: { id, ok: true, result } · { id, ok: false, error: { name, message, ...extra } }
//
// Los errores viajan como DATOS: el clonado estructurado conserva los errores
// estándar (TypeError, RangeError…), pero una subclase propia llega como «Error»
// y sin sus campos. Así que se envían nombre, mensaje y campos, y se reconstruyen.

// ── Lado del worker ─────────────────────────────────────────────────────────
export function exposeWorkerApi(api) {
  const controllers = new Map(); // id → AbortController de cada llamada en curso
  self.onmessage = async (event) => {
    const { id, method, args, cancel } = event.data;
    if (cancel) {
      controllers.get(id)?.abort();
      return;
    }
    const controller = new AbortController();
    controllers.set(id, controller);
    try {
      if (typeof api[method] !== 'function') throw new TypeError(`método desconocido: ${method}`);
      // Cada método recibe la señal de su llamada en this.signal.
      const result = await api[method].apply({ signal: controller.signal }, args);
      self.postMessage({ id, ok: true, result });
    } catch (error) {
      // Nombre, mensaje y los campos propios (como field); si se lanzó algo que no es un error, su texto.
      const data = error instanceof Error || error instanceof DOMException
        ? { ...error, name: error.name, message: error.message }
        : { name: 'Error', message: String(error) };
      self.postMessage({ id, ok: false, error: data });
    } finally {
      controllers.delete(id);
    }
  };
}

// ── Lado de la página ───────────────────────────────────────────────────────
const STANDARD_ERRORS = { Error, TypeError, RangeError, SyntaxError, ReferenceError };

export function rehydrateError({ name, message, ...extra }) {
  const ErrorClass = STANDARD_ERRORS[name] ?? Error;
  const error = new ErrorClass(message);
  if (!STANDARD_ERRORS[name]) error.name = name; // ValidationError sigue llamándose así
  return Object.assign(error, extra);            // y conserva sus campos (field…)
}

export function createWorkerClient(worker, { timeout = 5000 } = {}) {
  const pending = new Map(); // id → { resolve, reject, cleanup }
  let nextId = 1;
  let closed = null;         // el motivo, si el worker ya no sirve

  const settle = (id, outcome) => {
    const request = pending.get(id);
    if (!request) return; // ya cancelada o vencida: la respuesta llega tarde
    pending.delete(id);
    request.cleanup();
    outcome(request);
  };
  const failAll = (error) => {
    closed = error;
    for (const id of [...pending.keys()]) settle(id, (request) => request.reject(error));
  };
  worker.addEventListener('message', (event) => {
    const { id, ok, result, error } = event.data;
    settle(id, (request) => (ok ? request.resolve(result) : request.reject(rehydrateError(error))));
  });
  worker.addEventListener('error', (event) => {
    event.preventDefault(); // lo manejamos: cada llamada pendiente recibe el error
    failAll(new Error(event.message ?? 'el worker no se pudo cargar'));
  });

  function call(method, args, options) {
    if (closed) return Promise.reject(closed);
    const signal = AbortSignal.any([AbortSignal.timeout(options.timeout), ...(options.signal ? [options.signal] : [])]);
    if (signal.aborted) return Promise.reject(signal.reason);
    const id = nextId++;
    const { promise, resolve, reject } = Promise.withResolvers();
    const onAbort = () => {
      worker.postMessage({ id, cancel: true }); // que el worker deje de trabajar en ella
      settle(id, (request) => request.reject(signal.reason)); // TimeoutError o AbortError
    };
    signal.addEventListener('abort', onAbort, { once: true });
    pending.set(id, { resolve, reject, cleanup: () => signal.removeEventListener('abort', onAbort) });
    worker.postMessage({ id, method, args });
    return promise;
  }

  // Un Proxy: cualquier propiedad es un método remoto. Tres nombres son especiales.
  const makeClient = (options) => new Proxy({}, {
    get(target, property) {
      // 'then' tiene que ser undefined: si no, `await client` creería que es una promesa.
      if (property === 'then' || typeof property === 'symbol') return undefined;
      if (property === 'withOptions') return (more) => makeClient({ ...options, ...more });
      if (property === 'terminate') {
        return () => {
          worker.terminate();
          failAll(new Error('worker cerrado'));
        };
      }
      return (...args) => call(property, args, options);
    },
  });
  return makeClient({ timeout });
}
