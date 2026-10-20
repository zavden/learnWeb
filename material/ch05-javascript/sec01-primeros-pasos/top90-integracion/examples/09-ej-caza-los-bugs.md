---
example_description: "Ejercicio: un script de tienda con cinco bugs típicos del módulo (ASI, ||, + con strings, for…in, fallthrough) y comprobaciones automáticas"
example_tags: "javascript|ejercicio|depuracion|asi|coercion|switch"
exercise: true
exercise_title: "Caza los cinco bugs de la tienda"
exercise_instructions: "Ejecuta el ejemplo y lee qué comprobaciones salen con ✗ || Bug 1: haz que defaultConfig() devuelva el objeto || Bug 2: respeta el volumen 0 guardado por el usuario || Bug 3: suma los precios como números || Bug 4: suma las tallas, no los índices || Bug 5: que cada zona cobre solo su tarifa de envío || Termina cuando todas las comprobaciones salgan con ✓"
exercise_hints: "Bug 1: mira dónde termina la línea del return (lección «Sintaxis frente a Python») || Bug 2: || trata el 0 como vacío; hay un operador que solo actúa con null y undefined || Bug 3: lo que llega de un formulario es texto || Bug 4: for…in da claves (strings); for…of da valores || Bug 5: sin break (o return), switch sigue ejecutando los case de debajo"
exercise_solution_example: 09-ej-caza-los-bugs-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: este script de una tienda tiene CINCO bugs típicos de este módulo.
// Ninguno lanza un error: solo producen resultados equivocados.
// Arregla cada TODO hasta que todas las comprobaciones del final salgan ✓.
// (function se estudia en «Funciones y ámbito»; arrays y objetos, en
// «Números, texto y colecciones».)

// Bug 1 — configuración por defecto de la tienda.
function defaultConfig() {
  // TODO 1: esta función devuelve undefined. ¿Por qué?
  return
  {
    currency: 'EUR'
  };
}

// Bug 2 — volumen de los avisos sonoros guardado por el usuario.
const savedSettings = { volume: 0, theme: 'dark' };
// TODO 2: el usuario silenció los avisos (0), pero el código le pone 50.
const volume = savedSettings.volume || 50;

// Bug 3 — total de la cesta. Los precios llegan como texto desde el formulario.
const priceInputs = ['19.99', '5.01'];
let basketTotal = 0;
for (const price of priceInputs) {
  // TODO 3: el total acaba siendo un texto concatenado.
  basketTotal = basketTotal + price;
}

// Bug 4 — talla media de los zapatos de un pedido.
const shoeSizes = [38, 40, 42];
let sizeSum = 0;
// TODO 4: este bucle no suma las tallas.
for (const index in shoeSizes) {
  sizeSum += index;
}

// Bug 5 — gastos de envío según la zona.
function shippingCost(zone) {
  let cost = 0;
  // TODO 5: la península paga como si fuera Canarias.
  switch (zone) {
    case 'peninsula':
      cost = 4.95;
    case 'baleares':
      cost = 9.95;
    case 'canarias':
      cost = 14.95;
  }
  return cost;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}

check('1. defaultConfig() devuelve la moneda', defaultConfig()?.currency, 'EUR');
check('2. se respeta el volumen 0', volume, 0);
check('3. el total de la cesta es un número', typeof basketTotal, 'number');
check('3. el total de la cesta es 25', basketTotal, 25);
check('4. la talla media es 40', sizeSum / shoeSizes.length, 40);
check('5. envío a la península: 4.95', shippingCost('peninsula'), 4.95);
check('5. envío a Baleares: 9.95', shippingCost('baleares'), 9.95);
check('5. envío a Canarias: 14.95', shippingCost('canarias'), 14.95);
```
