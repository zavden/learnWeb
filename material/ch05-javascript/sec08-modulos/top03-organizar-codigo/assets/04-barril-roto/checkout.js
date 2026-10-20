// 🐛 UN MÓDULO QUE IMPORTA EL DEFAULT DEL BARREL ROTO (ejemplo 04).
// El barrel no tiene exportación por defecto: este import falla al enlazar.
import Cart from './index.js';

console.log('esta línea nunca se imprime', new Cart());
