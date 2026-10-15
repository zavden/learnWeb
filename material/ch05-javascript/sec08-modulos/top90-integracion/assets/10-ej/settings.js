// AJUSTES DE ENVÍO DE LA TIENDA (ejercicio «Caza los bugs de módulos»).
// Un objeto compartido por todos los módulos que lo importan.
export const settings = {
  freeShippingFromCents: 99900,
  shippingCents: 14900,
};

export function shippingFor(subtotalCents, rules = settings) {
  return subtotalCents >= rules.freeShippingFromCents ? 0 : rules.shippingCents;
}
