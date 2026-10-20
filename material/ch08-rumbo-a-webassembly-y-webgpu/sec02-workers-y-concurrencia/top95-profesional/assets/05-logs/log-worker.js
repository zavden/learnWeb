// WORKER DEL EJEMPLO 05 (de módulo): el registro entero vive aquí (40 000 líneas o
// el archivo que abras). La página pide resúmenes y búsquedas; recibe solo las
// primeras líneas que coinciden, ya troceadas en fichas para resaltarlas.
import { generateLog, tokenize, makeMatcher, summarize } from './logs.js';

let lines = generateLog(40_000);
let source = 'tienda-2026-10-13.log';
self.postMessage({ id: 0, type: 'summary', source, ...summarize(lines) });

const LEVEL = /\b(ERROR|WARN|INFO)\b/;
const DURATION = /\b(\d+)ms\b/;
let loading = Promise.resolve(); // la lectura de un archivo en curso

async function load(id, file) {
  try {
    lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim() !== '');
    source = file.name;
    self.postMessage({ id, type: 'summary', source, ...summarize(lines) });
  } catch (error) {
    self.postMessage({ id, type: 'error', name: error.name, message: error.message });
  }
}

self.onmessage = async (event) => {
  const { id, type } = event.data;
  if (type === 'load') {
    loading = load(id, event.data.file); // el File llega como referencia: el worker lo lee
    return;
  }
  // file.text() es asíncrono: mientras se lee, ya entran los mensajes siguientes. Sin esta
  // espera, la consulta que la página envía detrás del archivo buscaría en el registro anterior.
  await loading;
  try {
    if (type === 'query') {
      const { query, levels, slowOnly, limit } = event.data;
      const matches = makeMatcher(query); // un /regex/ mal escrito lanza aquí
      const shown = [];
      let total = 0;
      lines.forEach((line, index) => {
        const level = LEVEL.exec(line)?.[1];
        if (level && !levels.includes(level)) return;
        if (slowOnly && !(Number(DURATION.exec(line)?.[1]) >= 500)) return;
        if (!matches(line)) return;
        total += 1;
        if (shown.length < limit) shown.push({ number: index + 1, line, tokens: tokenize(line) });
      });
      self.postMessage({ id, type: 'results', query, total, shown });
    }
  } catch (error) {
    self.postMessage({ id, type: 'error', name: error.name, message: error.message });
  }
};
