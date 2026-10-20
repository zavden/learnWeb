// LA SIMULACIÓN (ejemplo 08): cómo se reparte el calor en un comal de 80 × 50
// celdas con el quemador en el centro. La importan la página (para el estado
// inicial) y el worker (para avanzar la simulación).
export const WIDTH = 80;
export const HEIGHT = 50;
export const AMBIENT = 25;  // °C del aire: los bordes se quedan siempre así
export const BURNER = 250;  // °C del quemador
const K = 0.2;              // cuánto calor pasa a los vecinos en cada paso (≤ 0,25 para que sea estable)

const isBurner = (x, y) => (x - WIDTH / 2) ** 2 + (y - HEIGHT / 2) ** 2 <= 25; // un círculo de radio 5

// El estado inicial: todo a temperatura ambiente, salvo el quemador.
export function createPlate() {
  const plate = new Float32Array(WIDTH * HEIGHT).fill(AMBIENT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) if (isBurner(x, y)) plate[y * WIDTH + x] = BURNER;
  }
  return plate;
}

// Un paso: cada celda interior se acerca a la media de sus cuatro vecinas.
export function step(current, next) {
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const i = y * WIDTH + x;
      const neighbours = current[i - 1] + current[i + 1] + current[i - WIDTH] + current[i + WIDTH];
      next[i] = isBurner(x, y) ? BURNER : current[i] + K * (neighbours - 4 * current[i]);
    }
  }
}
