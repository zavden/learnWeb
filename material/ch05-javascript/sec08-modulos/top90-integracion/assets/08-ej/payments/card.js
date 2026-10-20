// PAGO CON TARJETA (ejercicio «Carga bajo demanda»).
export default {
  id: 'card',
  label: 'Tarjeta',
  fee(cents) {
    return Math.round(cents * 0.035); // comisión del 3.5 %
  },
};
