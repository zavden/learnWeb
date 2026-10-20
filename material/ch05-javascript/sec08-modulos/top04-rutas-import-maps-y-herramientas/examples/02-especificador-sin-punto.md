---
example_description: "Sin ./ delante, una ruta es un «especificador desnudo» (como 'lodash'), y el navegador no sabe resolverlo: TypeError: Failed to resolve module specifier; las rutas relativas empiezan siempre por ./ o ../"
example_tags: "javascript|modulos|rutas|especificadores|import-maps|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/01-rutas/shared/format.js (el del ejemplo 01).
// (import() se explica en la lección «Import dinámico»; aquí atrapa los errores.)

// 🐛 Dos rutas sin ./ delante: para el navegador son NOMBRES de paquete
//    (especificadores «desnudos»), no rutas, y no sabe a qué URL llevan.
for (const specifier of ['01-rutas/shared/format.js', 'lodash']) {
  try {
    await import(specifier);
  } catch (error) {
    console.log(`🐛 import('${specifier}') →`, error.name, '|', error.message);
  }
}

// ✅ Con ./ es una ruta relativa, y se resuelve.
const { formatPrice } = await import('./01-rutas/shared/format.js');
console.log('✅ con ./ →', formatPrice(21000));

// Con un import estático, el mismo error detiene el script entero antes de
// su primera línea:
//   import _ from 'lodash';
//   → Uncaught TypeError: Failed to resolve module specifier "lodash"…
// Node.js y los empaquetadores buscan 'lodash' en la carpeta node_modules;
// el navegador no tiene node_modules. Para que entienda un nombre así hace
// falta un import map (ejemplo 04) o un empaquetador.
```
