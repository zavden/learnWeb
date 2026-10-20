// 🐛 AJUSTES COMO UN OBJETO EXPORTADO Y MODIFICABLE (ejemplo 09 de
// «Organizar el código»). El import es de solo lectura (nadie puede
// reasignar settings), pero el OBJETO no: cualquiera puede cambiar sus
// propiedades, y el cambio lo ven todos los módulos.
export const settings = {
  currency: 'MXN',
  freeShippingFromCents: 99900, // envío gratis desde $999.00
  shippingCents: 14900,
};
