// ✅ PUNTOS DE FIDELIDAD CON INYECCIÓN DE DEPENDENCIAS (ejemplo 06).
// La misma lógica, pero el reloj y el almacén llegan como parámetros: la
// aplicación pasa los de verdad y cada prueba, los suyos.
function isTuesdayInMexico(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Mexico_City' }).format(date) === 'Tue';
}

export function createLoyalty({ clock = () => new Date(), balances = new Map() } = {}) {
  return {
    earn(customer, cents) {
      const points = Math.floor(cents / 1000) * (isTuesdayInMexico(clock()) ? 2 : 1);
      balances.set(customer, (balances.get(customer) ?? 0) + points);
      return points;
    },
    balance(customer) {
      return balances.get(customer) ?? 0;
    },
  };
}
