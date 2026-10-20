// Módulo (type="module"): se comporta como defer y admite import y await.
// Ojo con las rutas: el import se resuelve contra la URL de ESTE archivo (…/js/), igual que
// url() dentro de un CSS; fetch, en cambio, se resuelve contra la URL del DOCUMENTO.
import { formatPercent } from './format.js';

const response = await fetch('status.json');
const { services } = await response.json();

// Sustituye el estado que vino en el HTML (el de las 09:00) por el actual
for (const service of services) {
  const item = document.querySelector(`[data-service="${service.id}"]`);
  item.querySelector('.state').textContent = service.state;
  item.querySelector('.uptime').textContent = formatPercent(service.uptime);
}
console.log('widgets.js (module) → readyState:', document.readyState,
  '| status.json:', response.status, '| estado actualizado');
