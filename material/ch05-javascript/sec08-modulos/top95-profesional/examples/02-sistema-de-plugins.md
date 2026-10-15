---
example_description: "Un sistema de plugins de informes: un manifiesto JSON, cada plugin cargado con import() la primera vez que se usa, un contrato comprobado al cargarlo, datos congelados para cada plugin y errores aislados con el id del plugin y su causa"
example_tags: "javascript|profesional|modulos|import-dinamico|plugins|json|contrato"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN SISTEMA DE PLUGINS PARA LOS INFORMES DE UNA TIENDA.
//
// Archivos (assets/02-plugins/):
//   manifest.json → apiVersion y la lista de plugins { id, label, entry }
//   host.js       → createPluginHost(servicios): list(), load(id), run(id, datos)
//   plugins/csv.js, summary.js, top-products.js → plugins correctos
//   plugins/legacy-pdf.js → escrito para la API v1 (no cumple el contrato)
//   plugins/chart.js      → a medio hacer: falla al evaluarse
//
// Decisiones (detalladas en host.js):
// - Nada se descarga hasta que se usa; dos usos a la vez comparten la carga.
// - El contrato (id, apiVersion, run) se comprueba ANTES de ejecutar nada.
// - Los plugins reciben los servicios del anfitrión por parámetro (formato,
//   idioma): no importan módulos de la aplicación.
// - Cada plugin recibe una copia congelada de los datos.
// - Un plugin roto da un PluginError con su id; los demás siguen.
//
// Alcance: módulos 1-8.
import { createPluginHost, PluginError } from './02-plugins/host.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const host = createPluginHost({
  locale: 'es-MX',
  formatPrice: (cents) => money.format(cents / 100),
});

const orders = [
  { id: 'P-1041', customer: 'Mariana Gómez', status: 'enviado', cents: 48720, items: ['café de Chiapas', 'taza de barro'] },
  { id: 'P-1042', customer: 'Iker Salas', status: 'pagado', cents: 63684, items: ['molinillo manual'] },
  { id: 'P-1043', customer: 'Sofía Ríos, S.A. de C.V.', status: 'enviado', cents: 21000, items: ['café de Chiapas'] },
  { id: 'P-1044', customer: 'Luis Ortega', status: 'cancelado', cents: 12000, items: ['taza de barro'] },
  { id: 'P-1045', customer: 'Elena Cruz', status: 'pagado', cents: 75900, items: ['café de Chiapas', 'molinillo manual'] },
];

console.log('plugins disponibles →', host.list().map((plugin) => plugin.id).join(', '));
console.log('cargados al empezar →', host.loadedIds().length);

async function report(id) {
  console.group(`▶ ${id}`);
  try {
    const result = await host.run(id, orders);
    for (const line of [result].flat().join('\n').split('\n')) console.log(line);
  } catch (error) {
    if (!(error instanceof PluginError)) throw error; // los errores ajenos no se tapan
    console.log(`⚠️ ${error.message}`);
  }
  console.groupEnd();
}

// Dos informes del mismo plugin a la vez, antes de que esté cargado: una
// sola descarga y una sola evaluación (un solo «evaluando»).
const [first, second] = await Promise.all([host.run('summary', orders), host.run('summary', orders)]);
console.log('dos resúmenes a la vez, iguales →', first.join() === second.join());

for (const id of ['csv', 'summary', 'top-products', 'legacy-pdf', 'chart', 'pdf-2030']) {
  await report(id);
}

// Reintentar el plugin roto: el anfitrión olvidó el fallo, pero el MÓDULO se
// quedó con su error en el mapa de módulos.
await report('chart');

console.log('cargados al final →', host.loadedIds().join(', '));
console.log('¿los pedidos siguen intactos? →', orders.length === 5 && !Object.isFrozen(orders));
```
