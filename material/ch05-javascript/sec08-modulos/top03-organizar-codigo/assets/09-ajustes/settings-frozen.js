// ✅ AJUSTES CONGELADOS (ejemplo 09): nadie puede cambiarlos por accidente.
// Quien necesite otros valores crea un objeto NUEVO a partir de estos.
export const SETTINGS = Object.freeze({
  currency: 'MXN',
  freeShippingFromCents: 99900,
  shippingCents: 14900,
});

export function withOverrides(overrides) {
  return Object.freeze({ ...SETTINGS, ...overrides });
}
