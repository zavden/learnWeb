// ETIQUETA DE PRECIOS (ejemplo 08 de «Módulos ES»).
import { currency } from './settings.js';

// 🐛 Se calcula UNA vez, al evaluar este módulo: se queda con 'MXN' para siempre.
const label = `Precios en ${currency}`;

export function staleLabel() {
  return label;
}

// ✅ Lee el enlace vivo en cada llamada: siempre la moneda actual.
export function liveLabel() {
  return `Precios en ${currency}`;
}
