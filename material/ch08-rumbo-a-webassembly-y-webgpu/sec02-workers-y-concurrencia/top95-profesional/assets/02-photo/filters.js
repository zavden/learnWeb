// FILTROS DEL EDITOR (ejemplo 02). Cada filtro trabaja sobre una imagen
// { data, width, height } (data: Uint8ClampedArray RGBA) y devuelve otra del mismo
// tamaño. halo(amount) dice cuántas filas vecinas necesita por arriba y por abajo:
// 0 para los que miran un píxel cada vez; para los que miran a los vecinos, las
// que «contaminan» sus pasadas. Lo importan la página y los workers.

function perPixel(image, transform) {
  const data = new Uint8ClampedArray(image.data);
  for (let i = 0; i < data.length; i += 4) transform(data, i);
  return { data, width: image.width, height: image.height };
}

// Una pasada de un núcleo 3 × 3 (lección «Píxeles»); fuera de la imagen, el borde.
function convolve(image, kernel) {
  const { width, height, data: src } = image;
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let k = 0; k < 9; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + (k % 3) - 1));
        const sy = Math.min(height - 1, Math.max(0, y + Math.floor(k / 3) - 1));
        const i = (sy * width + sx) * 4;
        r += src[i] * kernel[k];
        g += src[i + 1] * kernel[k];
        b += src[i + 2] * kernel[k];
      }
      const o = (y * width + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = src[o + 3];
    }
  }
  return { data: out, width, height };
}

const BLUR = Array(9).fill(1 / 9);

export const FILTERS = {
  gray: {
    label: 'Blanco y negro',
    halo: () => 0,
    apply: (image) => perPixel(image, (d, i) => {
      const luma = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      d[i] = luma;
      d[i + 1] = luma;
      d[i + 2] = luma;
    }),
  },
  sepia: {
    label: 'Sepia',
    halo: () => 0,
    apply: (image, amount) => perPixel(image, (d, i) => {
      const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
      const mix = amount / 10; // 0,1 … 1
      d[i] = r + mix * (0.393 * r + 0.769 * g + 0.189 * b - r);
      d[i + 1] = g + mix * (0.349 * r + 0.686 * g + 0.168 * b - g);
      d[i + 2] = b + mix * (0.272 * r + 0.534 * g + 0.131 * b - b);
    }),
  },
  contrast: {
    label: 'Contraste',
    halo: () => 0,
    apply: (image, amount) => perPixel(image, (d, i) => {
      const factor = 1 + amount * 0.08;
      for (let c = 0; c < 3; c++) d[i + c] = (d[i + c] - 128) * factor + 128;
    }),
  },
  blur: {
    label: 'Desenfocar',
    halo: (amount) => amount, // cada pasada mira una fila más allá
    apply: (image, amount) => {
      let result = image;
      for (let pass = 0; pass < amount; pass++) result = convolve(result, BLUR);
      return result;
    },
  },
  sharpen: {
    label: 'Enfocar',
    halo: () => 1,
    apply: (image, amount) => {
      const k = amount * 0.12;
      return convolve(image, [0, -k, 0, -k, 1 + 4 * k, -k, 0, -k, 0]);
    },
  },
};

// Las filas [from, to) de una imagen, COPIADAS a un búfer propio (para transferirlo).
export function sliceRows(image, from, to) {
  return image.data.slice(from * image.width * 4, to * image.width * 4);
}
