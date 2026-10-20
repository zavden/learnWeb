// ANALÍTICA (ejemplo 03 de «Rutas, import maps y herramientas»).
// Este archivo existe y se descarga bien… pero si otro módulo del mismo
// grafo falla al cargar, no llega a evaluarse.
console.log('  (evaluando analytics.js)');

export function track(event) {
  return `📊 ${event}`;
}
