// DHL EXPRESS (ejemplo 04): se registra sola al evaluarse.
import { registerCarrier } from '../registry.js';
console.log('3. dhl.js se registra');

registerCarrier({
  id: 'dhl',
  label: 'DHL Express (1 día)',
  accepts: (order) => order.weightGrams <= 20000,
  price: (order) => 24900 + Math.ceil(order.weightGrams / 1000) * 2500,
});
