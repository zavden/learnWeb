// LAS CLAVES DE LOS SERVICIOS (ejemplo 11 de «Ejemplos profesionales»).
// Son símbolos: dos símbolos nunca son iguales, aunque tengan la misma
// descripción, así que dos módulos no pueden pisarse una clave por accidente
// (con textos, dos librerías que registren «logger» chocarían).
// Como este módulo se evalúa una vez, todos los que importan LOGGER reciben
// EL MISMO símbolo.
export const LOGGER = Symbol('logger');
export const CLOCK = Symbol('clock');
export const ORDERS = Symbol('orders');

// Symbol.for busca en un registro GLOBAL por descripción: la misma clave
// aunque este módulo se evalúe dos veces (dos copias, dos versiones).
// Para servicios que comparten varios paquetes; con un nombre largo y único.
export const PAYMENTS = Symbol.for('cafe-la-huasteca.payments');
