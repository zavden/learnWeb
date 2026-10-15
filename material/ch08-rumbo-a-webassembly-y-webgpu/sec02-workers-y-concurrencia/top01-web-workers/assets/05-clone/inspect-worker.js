// WORKER DEL EJEMPLO 05: describe lo que recibe. Todo llega COPIADO con el
// algoritmo de clonado estructurado, el mismo de structuredClone.
self.onmessage = (event) => {
  const booking = event.data;
  const people = Object.getOwnPropertyDescriptor(booking, 'people');
  const report = [
    `Date → ${booking.visit instanceof Date} · ${booking.visit.toISOString()}`,
    `Map → ${[...booking.tickets].map(([type, count]) => `${type}: ${count}`).join(', ')}`,
    `Set → ${[...booking.tags].join(', ')}`,
    `Uint8Array → [${booking.seats.join(', ')}]`,
    `${booking.problem.name} → ${booking.problem.message}`,
    `¿referencia circular? → ${booking.self === booking}`,
    `getter people → valor ${people.value}, ¿sigue siendo getter? ${typeof people.get === 'function'}`,
  ];
  booking.tickets.set('adulto', 99); // cambia SU copia, no la de la página
  self.postMessage({ report, copy: booking });
};
