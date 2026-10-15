// WORKER DEL EJEMPLO 10 (de módulo): desenfoca un ImageBitmap en un OffscreenCanvas.
import { boxBlur } from './blur.js';

self.onmessage = (event) => {
  const { bitmap, passes } = event.data; // un ImageBitmap TRANSFERIDO por la página
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height); // un canvas sin página
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close(); // ya está dibujado: libera su memoria
  const start = performance.now();
  ctx.putImageData(boxBlur(ctx.getImageData(0, 0, canvas.width, canvas.height), passes), 0, 0);
  const ms = performance.now() - start;
  const result = canvas.transferToImageBitmap(); // el dibujo, como ImageBitmap…
  self.postMessage({ result, ms }, [result]);     // …transferido de vuelta, sin copiar
};
