// AVISOS (ejemplo 05): tampoco importa pedidos. Recibe el «canal» de envío
// (email de verdad, o uno falso en las pruebas).
export function createNotifier({ send }) {
  const sent = [];
  return {
    notify(to, message) {
      sent.push({ to, message });
      send(to, message);
    },
    sentCount() {
      return sent.length;
    },
  };
}
