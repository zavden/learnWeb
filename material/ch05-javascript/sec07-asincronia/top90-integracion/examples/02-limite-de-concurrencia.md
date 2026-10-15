---
example_description: "Un límite de concurrencia: mapWithLimit procesa una lista con N operaciones a la vez como máximo (N «trabajadores» que se reparten un índice compartido) y devuelve los resultados en el orden de entrada; comparado con Promise.all (todas a la vez) y con un bucle con await (de una en una)"
example_tags: "javascript|async|concurrencia|promise-all|trabajadores|rendimiento"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generar las miniaturas de 10 fotos de producto. El servidor de imágenes
// acepta como mucho 3 peticiones a la vez. Cada foto tarda distinto.
const photos = [
  { file: 'cafe-chiapas.jpg', ms: 120 }, { file: 'mole-poblano.jpg', ms: 40 },
  { file: 'cajeta.jpg', ms: 60 }, { file: 'pan-de-muerto.jpg', ms: 80 },
  { file: 'chocolate.jpg', ms: 40 }, { file: 'vainilla.jpg', ms: 100 },
  { file: 'chile-ancho.jpg', ms: 20 }, { file: 'mezcal.jpg', ms: 60 },
  { file: 'jamaica.jpg', ms: 40 }, { file: 'tamarindo.jpg', ms: 80 },
];

// Un contador de «cuántas a la vez», para comprobar el límite.
function createMeter() {
  const meter = { now: 0, max: 0, finished: [] };
  meter.track = async (photo) => {
    meter.now += 1;
    meter.max = Math.max(meter.max, meter.now);
    await wait(photo.ms);
    meter.now -= 1;
    meter.finished.push(photo.file);
    return photo.file.replace('.jpg', '-200px.webp');
  };
  return meter;
}

// N trabajadores; cada uno toma el siguiente índice libre cuando termina el anterior.
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++; // síncrono: ningún otro trabajador puede colarse aquí
      results[index] = await fn(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results; // en el orden de ENTRADA, no en el de llegada
}

async function main() {
  // 1. Con límite de 3.
  let meter = createMeter();
  const thumbnails = await mapWithLimit(photos, 3, meter.track);
  console.log('▶ mapWithLimit(fotos, 3)');
  console.log('  nunca más de 3 a la vez →', meter.max === 3);
  console.log('  terminaron en otro orden →', meter.finished[0], '…', meter.finished[0] !== photos[0].file);
  console.log('  resultados en el orden de entrada →', thumbnails[0], thumbnails[1], '…', thumbnails.length);

  // 2. Promise.all: las 10 a la vez (el servidor rechazaría la mitad).
  meter = createMeter();
  await Promise.all(photos.map(meter.track));
  console.log('▶ Promise.all → a la vez:', meter.max);

  // 3. Un await en el bucle: de una en una (correcto, pero lento).
  meter = createMeter();
  for (const photo of photos) await meter.track(photo);
  console.log('▶ for…of + await → a la vez:', meter.max);
}
main();

// ¿Por qué no hay carreras con nextIndex++? Porque JavaScript tiene una sola
// hebra: entre leer y sumar no hay ningún await, así que ningún otro
// trabajador puede ejecutarse en medio (lección «El event loop»).
// > Desde Python: es lo que se hace con asyncio.Semaphore(3) alrededor de cada
//   tarea, o con un grupo de trabajadores que leen de una asyncio.Queue.
```
