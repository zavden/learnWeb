---
example_description: "Subir las fotos de un producto en paralelo con progreso por partes; Promise.allSettled da el informe completo (un fallo no tapa los éxitos), solo los fallos transitorios se reintentan una vez, y el resumen final se muestra con console.table"
example_tags: "javascript|async|allsettled|reintentos|subidas|progreso"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class UploadError extends Error {
  constructor(file, status, reason) {
    super(`${file}: ${status} ${reason}`);
    this.name = 'UploadError';
    this.status = status;
    this.retryable = status >= 500;
  }
}

// El servidor simulado: cada foto se sube en partes de 20 ms. «terraza.jpg»
// falla la primera vez (502, transitorio) y «menu.tif» pesa demasiado (413).
const PHOTOS = [
  { file: 'fachada.jpg', parts: 3 },
  { file: 'terraza.jpg', parts: 4, failFirstTryAtPart: 2 },
  { file: 'barra.jpg', parts: 7 },
  { file: 'menu.tif', parts: 9, tooLarge: true },
  { file: 'platillo.jpg', parts: 5 },
];
const triesByFile = new Map();

async function upload(photo, onProgress) {
  const tries = (triesByFile.get(photo.file) ?? 0) + 1;
  triesByFile.set(photo.file, tries);
  if (photo.tooLarge) {
    await wait(10);
    throw new UploadError(photo.file, 413, 'archivo demasiado grande');
  }
  for (let part = 1; part <= photo.parts; part++) {
    await wait(20);
    if (tries === 1 && part === photo.failFirstTryAtPart) throw new UploadError(photo.file, 502, 'pasarela caída');
    onProgress(Math.round((part / photo.parts) * 100));
  }
  return `https://cdn.example.com/fondita/${photo.file.replace('.jpg', '.webp')}`;
}

// Una barra de texto para el progreso: ████░░░░░░ 40 %
function bar(percent) {
  const filled = Math.round(percent / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${percent} %`;
}
const progress = new Map(PHOTOS.map(({ file }) => [file, 0]));

async function main() {
  console.log('▶ subiendo 5 fotos a la vez');
  const results = await Promise.allSettled(PHOTOS.map((photo) => upload(photo, (percent) => progress.set(photo.file, percent))));

  console.log('▶ progreso al terminar la primera ronda');
  for (const [file, percent] of progress) console.log(`  ${file.padEnd(13)} ${bar(percent)}`);

  // Reintentar SOLO los fallos transitorios, una vez.
  const retried = await Promise.allSettled(results.map((result, index) => {
    if (result.status === 'rejected' && result.reason.retryable) {
      console.log(`  ↻ reintento ${PHOTOS[index].file} (${result.reason.status})`);
      return upload(PHOTOS[index], (percent) => progress.set(PHOTOS[index].file, percent));
    }
    return result.status === 'fulfilled' ? result.value : Promise.reject(result.reason);
  }));

  console.table(retried.map((result, index) => ({
    archivo: PHOTOS[index].file,
    estado: result.status === 'fulfilled' ? '✅ subida' : '⛔ error',
    intentos: triesByFile.get(PHOTOS[index].file),
    detalle: result.status === 'fulfilled' ? result.value : result.reason.message,
  })));
  const ok = retried.filter((result) => result.status === 'fulfilled').length;
  console.log(`resumen → ${ok} de ${PHOTOS.length} subidas; revisa las que quedan en rojo`);
}
main();

// Con Promise.all, el 413 de «menu.tif» habría rechazado todo en 10 ms y no
// sabríamos qué fotos llegaron. allSettled espera a todas y dice qué pasó con
// cada una; con ese informe se decide qué reintentar.
```
