// RECOGER EN TIENDA (ejemplo 04): solo en Ciudad de México.
import { registerCarrier } from '../registry.js';
console.log('4. pickup.js se registra');

registerCarrier({
  id: 'pickup',
  label: 'Recoger en la tienda de Coyoacán',
  accepts: (order) => order.city === 'Ciudad de México',
  price: () => 0,
});
