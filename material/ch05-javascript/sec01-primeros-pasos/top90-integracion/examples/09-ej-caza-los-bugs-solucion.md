---
example_description: "Solución: los cinco bugs de la tienda corregidos y explicados (ASI, ??, Number(), for…of, break)"
example_tags: "javascript|solucion|depuracion|asi|coercion|switch"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: los cinco bugs corregidos. Cada ✅ explica la causa.
// (function se estudia en «Funciones y ámbito»; arrays y objetos, en
// «Números, texto y colecciones».)

// Bug 1 — configuración por defecto de la tienda.
function defaultConfig() {
  // ✅ ASI ponía un ; justo después de return. La llave va en la MISMA línea.
  return {
    currency: 'EUR',
  };
}

// Bug 2 — volumen de los avisos sonoros guardado por el usuario.
const savedSettings = { volume: 0, theme: 'dark' };
// ✅ || trata el 0 como «vacío»; ?? solo sustituye null y undefined.
const volume = savedSettings.volume ?? 50;

// Bug 3 — total de la cesta. Los precios llegan como texto desde el formulario.
const priceInputs = ['19.99', '5.01'];
let basketTotal = 0;
for (const price of priceInputs) {
  // ✅ + con un string concatena: convertimos a número antes de sumar.
  basketTotal = basketTotal + Number(price);
}

// Bug 4 — talla media de los zapatos de un pedido.
const shoeSizes = [38, 40, 42];
let sizeSum = 0;
// ✅ for…in recorría las claves ('0', '1', '2') y las concatenaba;
// for…of recorre los valores.
for (const size of shoeSizes) {
  sizeSum += size;
}

// Bug 5 — gastos de envío según la zona.
function shippingCost(zone) {
  // ✅ Sin break, cada case «caía» en el siguiente. Con return cada caso
  // termina en el acto, y default convierte una zona desconocida en un error.
  switch (zone) {
    case 'peninsula':
      return 4.95;
    case 'baleares':
      return 9.95;
    case 'canarias':
      return 14.95;
    default:
      throw new RangeError(`Zona de envío desconocida: «${zone}»`);
  }
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
