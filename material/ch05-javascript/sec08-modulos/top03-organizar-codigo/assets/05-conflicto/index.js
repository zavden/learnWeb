// 🐛 DOS «export *» CON UN NOMBRE REPETIDO (ejemplo 05).
// money.js y weight.js exportan los dos «format». No hay error aquí: el
// nombre ambiguo simplemente desaparece de este barrel.
export * from './money.js';
export * from './weight.js';
