// CARGA PEREZOSA CON PRECARGA (ejemplo 10).
// lazy(() => import('./x.js')) devuelve:
//   load()     → la promesa del módulo (una sola carga, aunque se pida mil veces)
//   prefetch() → empieza la carga sin esperar: para cuando el puntero se
//                acerca al botón o el teclado llega a él
//   loaded     → si ya se pidió
// Si la carga falla, se olvida la promesa: el siguiente load() lo reintenta.
export function lazy(loader) {
  let promise = null;

  function load() {
    promise ??= loader().catch((error) => {
      promise = null;
      throw error;
    });
    return promise;
  }

  return {
    load,
    prefetch() {
      load().catch(() => {}); // si falla, ya lo dirá el load() de verdad
    },
    get loaded() {
      return promise !== null;
    },
  };
}
