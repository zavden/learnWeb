// WORKER DEL EJEMPLO 03 (de módulo): la huella SHA-256 de un archivo, leído por trozos.
// Protocolo: { type: 'hash', id, file } · { type: 'cancel', id } →
//            { type: 'progress', id, loaded, total } · { type: 'result', id, hex, native }
//            { type: 'cancelled', id } · { type: 'error', id, message }
import { Sha256, toHex } from './sha256.js';

const NATIVE_LIMIT = 64 * 1024 * 1024; // crypto.subtle necesita el archivo entero en memoria
const cancelled = new Set();
const yieldToMessages = () => new Promise((resolve) => setTimeout(resolve, 0));

self.onmessage = async (event) => {
  const { type, id, file } = event.data;
  if (type === 'cancel') {
    cancelled.add(id);
    return;
  }
  try {
    const hash = new Sha256();
    const reader = file.stream().getReader();
    let loaded = 0;
    let reported = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      hash.update(value);
      loaded += value.byteLength;
      if (loaded - reported >= 1024 * 1024) { // cada MB: progreso y un respiro para leer 'cancel'
        reported = loaded;
        self.postMessage({ type: 'progress', id, loaded, total: file.size });
        await yieldToMessages();
        if (cancelled.has(id)) {
          await reader.cancel();
          self.postMessage({ type: 'cancelled', id });
          return;
        }
      }
    }
    const hex = toHex(hash.digest());
    // La prueba de que está bien hecha: la misma huella con la implementación del navegador.
    let native = null;
    if (crypto.subtle && file.size <= NATIVE_LIMIT) {
      native = toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())));
    }
    self.postMessage({ type: 'result', id, hex, native });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: error.message });
  } finally {
    cancelled.delete(id);
  }
};
