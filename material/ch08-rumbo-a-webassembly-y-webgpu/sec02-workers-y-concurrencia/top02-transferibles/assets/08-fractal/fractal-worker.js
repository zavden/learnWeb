// WORKER DEL EJEMPLO 08 (de módulo): dibuja el conjunto de Mandelbrot en el
// OffscreenCanvas que le transfirió la página. Lo hace por bandas de 16 filas y
// cede el turno entre una banda y la siguiente: un worker también es UN hilo, y
// solo atiende los mensajes «pausa» y «detener» cuando termina lo que está haciendo.
const BAND = 16;
let ctx = null;
let job = null; // el dibujo en curso: { maxIter, row, image, timer, paused, startedAt }

self.onmessage = (event) => {
  const { type } = event.data;
  if (type === 'init') {
    ctx = event.data.canvas.getContext('2d'); // el contexto vive AQUÍ, no en la página
    start(40);                                // vista previa rápida (≈ 20 ms)
  } else if (type === 'draw') {
    start(event.data.maxIter);
  } else if (type === 'pause' && job) {
    job.paused = true;
    clearTimeout(job.timer);
  } else if (type === 'resume' && job?.paused) {
    job.paused = false;
    drawBand();
  } else if (type === 'stop' && job) {
    clearTimeout(job.timer);
    job = null;
    self.postMessage({ type: 'stopped' });
  }
};

function start(maxIter) {
  clearTimeout(job?.timer);
  job = { maxIter, row: 0, image: ctx.createImageData(ctx.canvas.width, BAND), timer: 0, paused: false, startedAt: performance.now() };
  drawBand();
}

// Colores: de azul oscuro a naranja y amarillo según lo rápido que escapa el punto.
function paint(data, offset, iterations, maxIter) {
  const t = iterations === maxIter ? 1 : Math.log(1 + iterations) / Math.log(1 + maxIter);
  data[offset] = 9 * (1 - t) * t * t * t * 255;
  data[offset + 1] = 15 * (1 - t) * (1 - t) * t * t * 255;
  data[offset + 2] = 8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255 + 20 * t;
  data[offset + 3] = 255;
}

function drawBand() {
  if (!job || job.paused) return;
  const { width, height } = ctx.canvas;
  const rows = Math.min(BAND, height - job.row);
  const { data } = job.image;
  const scale = 3 / width; // el ancho del canvas abarca 3 unidades del plano
  for (let y = 0; y < rows; y++) {
    const ci = (job.row + y - height / 2) * scale;
    for (let x = 0; x < width; x++) {
      const cr = -0.75 + (x - width / 2) * scale;
      let zr = 0;
      let zi = 0;
      let i = 0;
      while (zr * zr + zi * zi <= 4 && i < job.maxIter) { // z = z² + c hasta que escapa
        const next = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = next;
        i++;
      }
      paint(data, (y * width + x) * 4, i, job.maxIter);
    }
  }
  ctx.putImageData(job.image, 0, job.row); // al acabar esta tarea, la banda aparece en la página
  job.row += rows;
  self.postMessage({ type: 'progress', done: job.row, total: height });
  if (job.row < height) {
    job.timer = setTimeout(drawBand, 0); // cede el turno: aquí pueden entrar «pausa» o «detener»
  } else {
    self.postMessage({ type: 'done', maxIter: job.maxIter, ms: performance.now() - job.startedAt });
    job = null;
  }
}
