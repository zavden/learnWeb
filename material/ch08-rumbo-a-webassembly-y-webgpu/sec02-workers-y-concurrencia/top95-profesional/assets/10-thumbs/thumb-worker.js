// WORKER DEL EJEMPLO 10 (de módulo): de un archivo de imagen a una miniatura WebP.
// Todo el trabajo pesado (decodificar, reducir, codificar) ocurre en este hilo.
self.onmessage = async (event) => {
  const { id, file, maxWidth } = event.data; // el File llega como referencia
  try {
    const source = await createImageBitmap(file); // decodifica (JPEG, PNG, WebP…)
    const width = Math.min(maxWidth, source.width);
    const height = Math.round((source.height * width) / source.width);
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);
    const original = { width: source.width, height: source.height };
    source.close();
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
    self.postMessage({ id, ok: true, blob, width, height, original }); // un Blob también viaja como referencia
  } catch {
    self.postMessage({ id, ok: false });
  }
};
