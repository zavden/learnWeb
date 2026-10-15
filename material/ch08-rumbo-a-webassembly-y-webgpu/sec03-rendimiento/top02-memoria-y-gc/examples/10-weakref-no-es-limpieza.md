---
example_description: "WeakRef y FinalizationRegistry no sirven para limpiar: soltar una sesión de chat y esperar a que el recolector llame al finalizador deja la conexión abierta un tiempo que nadie sabe (quizá para siempre). La limpieza se hace a mano y con try/finally; WeakRef se reserva para cachés de cosas que se pueden recalcular"
example_tags: "javascript|python|memoria|weakref|finalizationregistry|limpieza|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Una sesión de chat que abre una conexión (simulada) con el servidor.
const openRooms = new Set();
class ChatSession {
  constructor(room) {
    this.room = room;
    openRooms.add(room);
  }
  close() {
    openRooms.delete(this.room);
  }
}

// 🐛 «Cuando la sesión sea basura, que el recolector la cierre.»
//    FinalizationRegistry llama a su función DESPUÉS de que el recolector libere el objeto:
//    puede ser en un segundo, en diez minutos o nunca (si la pestaña se cierra antes).
const closer = new FinalizationRegistry((room) => {
  openRooms.delete(room); // nunca imprimas aquí: no sabrás cuándo ocurre, ni si ocurre
});
let supportSession = new ChatSession('soporte');
closer.register(supportSession, supportSession.room);
const supportRef = new WeakRef(supportSession);
supportSession = null; // «ya no la necesito»
console.log('🐛 sesión soltada · salas con conexión abierta →', [...openRooms].join(', '));
// Un WeakRef creado o leído en este turno mantiene vivo su objeto hasta que el turno acabe:
// en el mismo script, deref() siempre lo devuelve. Después, depende del recolector.
console.log('🐛 ¿supportRef.deref() la sigue viendo en este mismo turno? →', supportRef.deref() !== undefined);

// ✅ Cerrar a mano, y con try/finally para que se cierre también si algo falla.
function withSession(room, work) {
  const session = new ChatSession(room);
  try {
    return work(session);
  } finally {
    session.close();
  }
}
console.log('✅', withSession('ventas', (session) => `mensaje enviado a ${session.room}`));
try {
  withSession('pagos', () => { throw new Error('el servidor rechazó el mensaje'); });
} catch (error) {
  console.log('✅ error manejado →', error.message);
}
console.log('✅ salas con conexión abierta →', [...openRooms].join(', '), '(solo la 🐛)');

// Para qué SÍ sirve WeakRef: una caché de cosas grandes que se pueden recalcular (una imagen
// decodificada, un índice). Si el recolector la libera, se vuelve a calcular.
const decoded = new Map(); // nombre → WeakRef
function getThumbnail(fileName) {
  const cached = decoded.get(fileName)?.deref();
  if (cached) return cached;
  const pixels = new Uint8ClampedArray(64 * 64 * 4); // «decodificar» de nuevo
  decoded.set(fileName, new WeakRef(pixels));
  return pixels;
}
console.log('miniatura →', getThumbnail('mercado-de-coyoacan.png').length, 'bytes (con deref() === undefined siempre previsto)');

// Desde Python: CPython libera al instante lo que llega a 0 referencias, así que __del__ o
// weakref.finalize parecen inmediatos… salvo con ciclos. Por eso Python usa `with` (gestores de
// contexto) para cerrar archivos y conexiones. En Chrome (134+), JavaScript tiene su equivalente:
// `using session = …` dentro de un bloque llama a session[Symbol.dispose]() al salir de él.
```
