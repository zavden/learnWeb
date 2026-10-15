// WORKER DEL EJEMPLO 08 (de módulo): avanza la simulación y la copia en los
// «marcos» que le llegan. Los marcos son Float32Array que van y vuelven
// transferidos: dos marcos para siempre, ninguno nuevo por fotograma.
import { createPlate, step } from './heat.js';

const STEPS_PER_FRAME = 4;
let current = createPlate();
let next = createPlate(); // los bordes y el quemador ya tienen su valor fijo
let steps = 0;
let total = 0;

self.onmessage = (event) => {
  const { type, frame } = event.data;
  if (type === 'start') {
    total = event.data.total;
    return;
  }
  // type === 'fill': un marco vacío que la página ya pintó. Se rellena y se devuelve.
  if (steps < total) {
    for (let s = 0; s < STEPS_PER_FRAME; s++) {
      step(current, next);
      [current, next] = [next, current];
    }
    steps += STEPS_PER_FRAME;
  }
  frame.set(current); // copia DENTRO del worker: el estado sigue siendo solo suyo
  self.postMessage({ frame, steps, done: steps >= total }, [frame.buffer]);
};
