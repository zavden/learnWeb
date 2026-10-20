// 🐛 UN MÓDULO QUE PIDE EL NOMBRE AMBIGUO (ejemplo 05).
// Pedirlo explícitamente sí es un error, al enlazar.
import { format } from './index.js';

console.log('esta línea nunca se imprime', format(0));
