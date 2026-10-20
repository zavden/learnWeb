// DESENFOQUE DE CAJA 3 × 3 (ejemplo 10): el núcleo «desenfocar» de la lección
// «Píxeles» del capítulo 6 (cada píxel, la media de sus 9 vecinos), repetido
// varias pasadas. Lo importan la página y el worker: el mismo código en los dos hilos.
export function boxBlur(image, passes) {
  const { width, height } = image;
  let src = image.data;
  let out = new Uint8ClampedArray(src.length);
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const sy = Math.min(height - 1, Math.max(0, y + dy)); // fuera de la imagen: el borde
          for (let dx = -1; dx <= 1; dx++) {
            const sx = Math.min(width - 1, Math.max(0, x + dx));
            const i = (sy * width + sx) * 4;
            r += src[i];
            g += src[i + 1];
            b += src[i + 2];
          }
        }
        const o = (y * width + x) * 4;
        out[o] = r / 9;
        out[o + 1] = g / 9;
        out[o + 2] = b / 9;
        out[o + 3] = src[o + 3];
      }
    }
    [src, out] = [out, src]; // el resultado de esta pasada es la entrada de la siguiente
  }
  if (src !== image.data) image.data.set(src);
  return image;
}
