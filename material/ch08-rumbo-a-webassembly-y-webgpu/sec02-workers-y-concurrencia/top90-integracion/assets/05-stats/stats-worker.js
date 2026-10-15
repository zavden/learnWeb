// UN WORKER DEL POOL (ejemplo 05, de módulo): resume las lecturas de una estación
// meteorológica y DEVUELVE el búfer transferido, para que la página lo recupere.
self.onmessage = (event) => {
  const { station, readings } = event.data;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumOfSquares = 0;
  let hot = 0;
  for (const value of readings) {
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
    sumOfSquares += value * value;
    if (value >= 30) hot += 1;
  }
  const mean = sum / readings.length;
  const deviation = Math.sqrt(sumOfSquares / readings.length - mean * mean);
  self.postMessage({ station, readings, min, max, mean, deviation, hot }, [readings.buffer]);
};
