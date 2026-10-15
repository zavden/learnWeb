// IVA POR PAÍS (ejercicio «Caza los bugs de módulos»).
const VAT = { MX: 0.16, CO: 0.19, ES: 0.21 };

export function vatFor(country) {
  if (!Object.hasOwn(VAT, country)) throw new RangeError(`Sin IVA para ${country}`);
  return VAT[country];
}
