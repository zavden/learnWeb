// UN WORKER DEL POOL DEL EDITOR (ejemplo 02, de módulo). Recibe una franja con sus
// filas de halo, aplica el filtro y devuelve solo las filas de dentro, transferidas.
import { FILTERS } from './filters.js';

self.onmessage = (event) => {
  const { job, strip, filter, amount, width, rows, offset, innerRows, y, pixels } = event.data;
  const result = FILTERS[filter].apply({ data: pixels, width, height: rows }, amount);
  const inner = result.data.slice(offset * width * 4, (offset + innerRows) * width * 4);
  self.postMessage({ job, strip, y, innerRows, pixels: inner }, [inner.buffer]);
};
