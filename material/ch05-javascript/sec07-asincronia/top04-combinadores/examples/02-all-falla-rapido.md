---
example_description: "Promise.all falla rápido: se rechaza con el primer error, pero las demás operaciones NO se detienen y terminan (con sus efectos) cuando nadie las escucha; con un AbortController compartido, el primer fallo cancela el resto"
example_tags: "javascript|python|promesas|promise-all|abortcontroller|cancelar|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Publicar un producto: tres trabajos en paralelo. El de las fotos falla pronto.
// Cada trabajo acepta una señal de cancelación (signal) opcional.
function runJob(name, ms, { signal, failWith } = {}) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timerId = setTimeout(() => {
      finished = true;
      if (failWith) {
        reject(new Error(`${name}: ${failWith}`));
      } else {
        console.log(`   ⚙️ ${name} terminó (y guardó sus cambios)`);
        resolve(name);
      }
    }, ms);
    // addEventListener se estudia en el capítulo 6: «cuando se cancele, haz esto».
    signal?.addEventListener('abort', () => {
      if (finished) return; // ya había terminado: no hay nada que cancelar
      clearTimeout(timerId);
      console.log(`   🛑 ${name} cancelado`);
      reject(signal.reason);
    }, { once: true });
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 🐛 Sin cancelación: all se rechaza a los 50 ms… y los otros dos siguen.
console.log('▶ sin cancelación');
Promise.all([
  runJob('traducir la ficha', 120),
  runJob('subir 12 fotos', 50, { failWith: 'formato HEIC no admitido' }),
  runJob('indexar en el buscador', 160),
])
  .catch((error) => console.log('  ⛔ Promise.all →', error.message, '(los demás siguen en marcha)'))
  .then(() => wait(200)) // esperamos para ver lo que pasa después del fallo
  .then(() => {
    console.log('  🐛 el producto quedó medio publicado: traducido e indexado, sin fotos');

    // ✅ Con un AbortController compartido: el primer fallo cancela el resto.
    console.log('▶ con AbortController');
    const controller = new AbortController();
    const { signal } = controller;
    const jobs = [
      runJob('traducir la ficha', 120, { signal }),
      runJob('subir 12 fotos', 50, { signal, failWith: 'formato HEIC no admitido' }),
      runJob('indexar en el buscador', 160, { signal }),
    ];
    return Promise.all(jobs.map((job) => job.catch((error) => {
      controller.abort(error); // el primero que falla, cancela a los demás
      throw error;
    })));
  })
  .catch((error) => console.log('  ✅ Promise.all →', error.message, '(y nada quedó a medias)'))
  .then(() => wait(200))
  .then(() => console.log('fin: nada más se ejecutó tras la cancelación'));

// Promise.all no puede cancelar nada: una promesa es solo el AVISO de un
// resultado, no la operación. Cancelar es cosa de la operación, que debe
// aceptar una señal (signal): así lo hacen fetch y muchas APIs del navegador.
// > Desde Python: asyncio.gather tampoco cancela a los demás cuando uno falla;
//   asyncio.TaskGroup sí. Promise.all + AbortController es tu TaskGroup.
```
