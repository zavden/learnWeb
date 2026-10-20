// ESTAFETA (ejemplo 04): se registra sola al evaluarse. No exporta nada:
// se importa «por sus efectos» (import './estafeta.js').
import { registerCarrier } from '../registry.js';
console.log('2. estafeta.js se registra');

registerCarrier({
  id: 'estafeta',
  label: 'Estafeta (3-5 días)',
  accepts: (order) => order.weightGrams <= 30000,
  price: (order) => 9900 + Math.ceil(order.weightGrams / 1000) * 1500,
});
