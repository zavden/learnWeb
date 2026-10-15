// Módulo con una utilidad de formato. Lo importa widgets.js.
export function formatPercent(value) {
  return new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 2 }).format(value);
}
