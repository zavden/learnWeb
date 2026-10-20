// TASAS DE IMPUESTOS POR PAÍS (ejemplo 03 de «Import dinámico»).

const VAT_BY_COUNTRY = { MX: 0.16, ES: 0.21, CO: 0.19 };

export function vatFor(country) {
  const rate = VAT_BY_COUNTRY[country];
  if (rate === undefined) throw new RangeError(`Sin datos de IVA para ${country}`);
  return rate;
}
