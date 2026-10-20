// 🐛 UN BARREL QUE PIERDE LA CLASE (ejemplo 04).
// «export *» reexporta todas las exportaciones CON NOMBRE de cart.js…
// pero no su exportación por defecto: Cart se queda fuera.
export * from './cart.js';
