// LA FÁBRICA DE LA CACHÉ (ejemplo 05): sin estado de módulo. Cada llamada
// crea una caché nueva; quién la crea, y cuántas, lo decide quien la usa.
export function createPriceCache(load) {
  const entries = new Map(); // sku → promesa del precio
  const stats = { hits: 0, misses: 0 };

  return {
    stats,
    get(sku) {
      if (entries.has(sku)) {
        stats.hits += 1;
        return entries.get(sku);
      }
      stats.misses += 1;
      // Se guarda la PROMESA: tres widgets que piden el mismo precio a la
      // vez comparten una petición. Si falla, se olvida (no se guardan errores).
      const promise = load(sku).catch((error) => {
        entries.delete(sku);
        throw error;
      });
      entries.set(sku, promise);
      return promise;
    },
    invalidate(sku) {
      entries.delete(sku);
    },
  };
}
