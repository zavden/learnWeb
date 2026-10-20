// 🐛 UN MÓDULO QUE PIDE { formatPrice } A UN EXPORT DEFAULT (ejemplo 10).
// Las llaves de import NO son desestructuración: piden una exportación con
// ese nombre, y format.js no la tiene. Este archivo no llega a ejecutarse:
// el error salta al ENLAZAR los módulos, antes de ejecutar ninguna línea.
import { formatPrice } from './format.js';

console.log('esta línea nunca se imprime', formatPrice(0));
