// ✅ EL BARREL CON LOS NOMBRES RESUELTOS (ejemplo 05).
// Una exportación explícita gana a las de «export *»: se reexporta cada
// format con un nombre propio.
export * from './money.js';
export * from './weight.js';
export { format as formatMoney } from './money.js';
export { format as formatWeight } from './weight.js';
