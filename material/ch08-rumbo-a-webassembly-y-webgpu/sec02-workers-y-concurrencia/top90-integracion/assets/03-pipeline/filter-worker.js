// UN ESLABÓN DE LA CADENA (ejemplo 03, worker de módulo). Recibe los píxeles,
// aplica SU filtro sobre ellos (sin copiarlos) y los pasa al siguiente eslabón:
// otro worker, por un puerto de un MessageChannel, o la página. Siempre transferidos.
const FILTERS = {
  'blanco y negro'(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
      const luma = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
      pixels[i] = luma;
      pixels[i + 1] = luma;
      pixels[i + 2] = luma;
    }
  },
  'viñeta'(pixels, width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const farthest = Math.hypot(cx, cy);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const factor = 1 - 0.65 * (Math.hypot(x - cx, y - cy) / farthest) ** 2; // más oscuro hacia las esquinas
        const i = (y * width + x) * 4;
        pixels[i] *= factor;
        pixels[i + 1] *= factor;
        pixels[i + 2] *= factor;
      }
    }
  },
};

let filter = null;
let next = self; // a quién se pasa el resultado: un puerto hacia otro worker, o la página
self.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'setup') {
    filter = message.filter;
    if (message.output) next = message.output;                         // puerto de salida
    if (message.input) message.input.onmessage = (input) => run(input.data); // puerto de entrada
    return;
  }
  run(message);
};

function run({ pixels, width, height, path }) {
  FILTERS[filter](pixels, width, height);
  path.push(filter);
  next.postMessage({ pixels, width, height, path }, [pixels.buffer]);
}
