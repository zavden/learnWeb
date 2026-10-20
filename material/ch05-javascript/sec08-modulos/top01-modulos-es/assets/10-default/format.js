// 🐛 FORMATEADORES COMO UN OBJETO POR DEFECTO (ejemplo 10 de «Módulos ES»).
// Parece un módulo con dos exportaciones, pero exporta UNA cosa: un objeto
// sin nombre. Quien lo importe no puede pedir { formatPrice } entre llaves.

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const weight = new Intl.NumberFormat('es-MX', { style: 'unit', unit: 'kilogram' });

function formatPrice(cents) {
  return money.format(cents / 100);
}

function formatWeight(grams) {
  return weight.format(grams / 1000);
}

export default { formatPrice, formatWeight };
