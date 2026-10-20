// LA API PÚBLICA DE LA TIENDA: un «barrel» (barril) que reexporta lo que
// el resto de la aplicación puede usar (ejemplo 03).
// Quien importa escribe './03-tienda/index.js' y no necesita saber en qué
// archivo vive cada cosa. Es el __init__.py de un paquete de Python.

export * from './money.js'; // todo lo que exporta money.js (menos su default)
export { findProduct } from './catalog.js'; // solo esto de catalog.js
export { default as Cart } from './cart.js'; // el default de cart.js, con nombre

// Reexportar NO crea variables aquí: index.js no puede usar formatPrice
// sin importarlo además con un import normal.
