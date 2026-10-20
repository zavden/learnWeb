// Costo de envío en pesos: una base por zona y 40 pesos por cada kilo a partir del segundo.
const BASE = { local: 59, national: 189 };

export function shippingCost(zone, weightGrams) {
  const extraKilos = Math.max(0, Math.ceil(weightGrams / 1000) - 1);
  return BASE[zone] + extraKilos * 40;
}
