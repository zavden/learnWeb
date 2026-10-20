// PAGO EN EFECTIVO EN OXXO (ejercicio «Carga bajo demanda»).
export default {
  id: 'oxxo',
  label: 'Efectivo en OXXO',
  fee() {
    return 1200; // comisión fija de $12.00
  },
};
