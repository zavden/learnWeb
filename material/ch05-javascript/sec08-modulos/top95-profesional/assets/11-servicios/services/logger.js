// REGISTRO DE MENSAJES (ejemplo 11).
export function createLogger() {
  const lines = [];
  return {
    info(message) {
      lines.push(message);
      console.log(`📝 ${message}`);
    },
    count: () => lines.length,
  };
}
