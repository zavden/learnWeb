// WORKER DEL EJEMPLO 04 (de módulo): prueba una expresión regular sobre un texto.
// Un patrón mal escrito puede tardar muchísimo (retroceso catastrófico) y, mientras,
// este hilo no atiende NADA: la única salida es que la página lo termine.
self.onmessage = (event) => {
  const { id, pattern, flags, text } = event.data;
  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches = Array.from(text.matchAll(regex), (match) => match[0]);
    self.postMessage({ id, ok: true, matches });
  } catch (error) {
    // Los errores viajan como datos: el nombre y el mensaje (lección «Web workers»).
    self.postMessage({ id, ok: false, error: { name: error.name, message: error.message } });
  }
};
