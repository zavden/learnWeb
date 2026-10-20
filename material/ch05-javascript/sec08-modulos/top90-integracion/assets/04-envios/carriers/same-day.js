// ENVÍO EN EL DÍA (ejemplo 04): un «plugin» que se carga más tarde, con
// import(), solo si la tienda activa el servicio. Se registra en el MISMO
// registro que las demás, porque registry.js ya está en el mapa de módulos.
import { registerCarrier } from '../registry.js';
console.log('5. same-day.js se registra (cargado con import())');

registerCarrier({
  id: 'same-day',
  label: 'Mensajería en el día',
  accepts: (order) => order.city === 'Ciudad de México' && order.weightGrams <= 5000,
  price: () => 8900,
});
