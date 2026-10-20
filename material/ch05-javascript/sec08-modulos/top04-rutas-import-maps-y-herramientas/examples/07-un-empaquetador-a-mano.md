---
example_description: "Qué hace un empaquetador, en pequeño: cada módulo se convierte en una función dentro de un solo archivo, un registro las guarda y una caché garantiza que cada una se ejecuta una vez (el patrón módulo con IIFE, otra vez)"
example_tags: "javascript|modulos|empaquetadores|bundler|iife|commonjs"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Este script NO usa import: es lo que podría generar un empaquetador a
// partir de tres módulos (money.js, cart.js y main.js). Un solo archivo, una
// IIFE (lección «Patrones de diseño») y dentro, un registro de módulos.
(() => {
  // Cada módulo es una FUNCIÓN: su ámbito es el ámbito del módulo.
  const modules = {
    './money.js'(exports) {
      const VAT_RATE = 0.16; // privada: no sale de esta función
      exports.addVat = (cents) => Math.round(cents * (1 + VAT_RATE));
      exports.formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;
    },
    './cart.js'(exports, require) {
      const { addVat } = require('./money.js');
      exports.cartTotal = (lines) => addVat(lines.reduce((sum, line) => sum + line.cents, 0));
    },
    './main.js'(exports, require) {
      const { formatPrice } = require('./money.js');
      const { cartTotal } = require('./cart.js');
      console.log('total del carrito →', formatPrice(cartTotal([{ cents: 21000 }, { cents: 54900 }])));
    },
  };

  // La caché hace de mapa de módulos: cada función se ejecuta una sola vez.
  const cache = new Map();
  function require(id) {
    if (cache.has(id)) return cache.get(id);
    const exports = {};
    cache.set(id, exports); // antes de ejecutar: así un ciclo no se repite
    console.log(`  ejecutando ${id}`);
    modules[id](exports, require);
    return exports;
  }

  require('./main.js'); // el punto de entrada
  console.log('módulos ejecutados →', [...cache.keys()]);
})();

// Fíjate en el orden: main.js EMPIEZA el primero y se detiene en cada
// require hasta que ese módulo termina. Con módulos ES, las dependencias se
// evalúan antes de que main.js empiece (lección «Organizar el código»).
// Este esquema (require + exports) es CommonJS, el sistema de módulos que
// Node.js usaba antes de los módulos ES; lo verás en código antiguo. Sus
// exportaciones son copias, no enlaces vivos. Los empaquetadores modernos
// (Rollup, esbuild, Vite) hacen algo más fino: ponen todos los módulos en
// un mismo ámbito, renombran lo que choca y quitan lo que nadie importa.
```
