// WORKER DEL EJEMPLO 01 (de módulo): resume un CSV de ventas leyéndolo por trozos.
// Protocolo (cada análisis lleva su id):
//   página → worker: { type: 'analyze', id, file } · { type: 'cancel', id }
//   worker → página: { type: 'progress', id, loaded, total }
//                    { type: 'result', id, rows, skipped, cities, products }
//                    { type: 'cancelled', id } · { type: 'error', id, message }
// El File (o el Blob) llega como referencia: postMessage no copia sus bytes, y el
// worker los lee con file.stream() sin que pasen por el hilo principal.
const HEADER = 'date,city,product,units,amount';
const cancelled = new Set(); // ids que la página pidió cancelar

self.onmessage = async (event) => {
  const { type, id } = event.data;
  if (type === 'cancel') {
    cancelled.add(id); // se mira entre trozo y trozo
    return;
  }
  try {
    const result = await analyze(event.data.file, id);
    self.postMessage(result ? { type: 'result', id, ...result } : { type: 'cancelled', id });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: error.message });
  } finally {
    cancelled.delete(id);
  }
};

async function analyze(file, id) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true }); // bytes que no son UTF-8 → TypeError
  const cities = new Map();
  const products = new Map();
  let rest = '';
  let line = 0;
  let rows = 0;
  let skipped = 0;
  let loaded = 0;
  let pausedAt = 0;

  const addLine = (text) => {
    line += 1;
    if (line === 1) {
      if (text.trim() !== HEADER) throw new Error(`no es un CSV de ventas: la cabecera es «${text.trim().slice(0, 40)}»`);
      return;
    }
    if (text.trim() === '') return;
    const [, city, product, units, amount] = text.split(',');
    const count = Number(units);
    const value = Number(amount);
    if (!product || !Number.isInteger(count) || !Number.isFinite(value)) {
      skipped += 1; // una fila rota no tumba el análisis: se cuenta y se sigue
      return;
    }
    cities.set(city, (cities.get(city) ?? 0) + value);
    products.set(product, (products.get(product) ?? 0) + count);
    rows += 1;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (cancelled.has(id)) {
      await reader.cancel();
      return null;
    }
    const text = rest + (done ? decoder.decode() : decoder.decode(value, { stream: true }));
    const lines = text.split('\n');
    rest = done ? '' : lines.pop(); // la última línea puede venir cortada
    lines.forEach(addLine);
    if (done) break;
    loaded += value.byteLength;
    self.postMessage({ type: 'progress', id, loaded, total: file.size });
    if (loaded - pausedAt >= 1024 * 1024) {
      // Cada MB, un respiro (una tarea nueva): así el mensaje 'cancel' puede entrar
      // aunque los trozos del archivo lleguen sin esperas reales.
      pausedAt = loaded;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  const byTotal = (map) => [...map].sort((a, b) => b[1] - a[1]);
  return { rows, skipped, cities: byTotal(cities), products: byTotal(products) };
}
