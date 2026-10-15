// WORKER DEL EJEMPLO 11 (de módulo): comprime un archivo con gzip a medida que lo
// lee (streams: lección «Streams y progreso») y comprueba el resultado
// descomprimiéndolo. Protocolo: { id, file } → { type: 'progress', id, loaded, total }
// · { type: 'result', id, blob, same } · { type: 'error', id, message }.
function countBytes(id, total) {
  let loaded = 0;
  let reported = 0;
  return new TransformStream({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      if (loaded - reported >= 256 * 1024 || loaded === total) {
        reported = loaded;
        self.postMessage({ type: 'progress', id, loaded, total });
      }
      controller.enqueue(chunk); // pasa el trozo tal cual
    },
  });
}

async function sameBytes(a, b) {
  if (a.size !== b.size) return false;
  const [x, y] = await Promise.all([a.bytes(), b.bytes()]);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

self.onmessage = async (event) => {
  const { id, file } = event.data;
  try {
    const gzipped = file.stream().pipeThrough(countBytes(id, file.size)).pipeThrough(new CompressionStream('gzip'));
    const blob = await new Response(gzipped).blob();
    const restored = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
    self.postMessage({ type: 'result', id, blob: new Blob([blob], { type: 'application/gzip' }), same: await sameBytes(file, restored) });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: `${error.name}: ${error.message}` });
  }
};
