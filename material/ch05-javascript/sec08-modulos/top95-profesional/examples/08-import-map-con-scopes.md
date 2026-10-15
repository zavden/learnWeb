---
example_description: "Un import map con alias y scopes: el código nuevo importa 'money' y recibe la versión 2, la carpeta legacy/ recibe la versión 1 con el mismo nombre, y 'shop/' es un prefijo; import.meta.resolve muestra qué decidió el mapa para cada módulo"
example_tags: "javascript|html|profesional|modulos|import-maps|scopes|versiones"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<!-- El import map de la página, antes que cualquier módulo:
     - "imports": nombres para TODA la página. «money» es la versión 2, y todo
       lo que empiece por «shop/» está en la carpeta 08-mapa/shop/.
     - "scopes": excepciones por carpeta. Los módulos cuya URL empieza por
       08-mapa/legacy/ reciben otra «money»: la versión 1.
     Las URL relativas se resuelven contra la página (la carpeta assets/). -->
<script type="importmap">
{
  "imports": {
    "money": "./08-mapa/vendor/money-v2.js",
    "shop/": "./08-mapa/shop/"
  },
  "scopes": {
    "./08-mapa/legacy/": {
      "money": "./08-mapa/vendor/money-v1.js"
    }
  }
}
</script>
<main>
  <h1>Dos versiones de una librería en la misma página</h1>
  <p>Abre la consola: el código nuevo usa <code>money</code> 2.1 y las facturas antiguas, 1.4.</p>
</main>
```

# JavaScript

```javascript
// UN IMPORT MAP CON ALIAS Y SCOPES.
//
// Archivos (assets/08-mapa/):
//   vendor/money-v1.js → VERSION 1.4.0, format(pesos)          (API antigua)
//   vendor/money-v2.js → VERSION 2.1.0, formatPrice(centavos)  (API nueva)
//   shop/cart.js       → import … from 'money'   → recibe la v2
//   legacy/invoice.js  → import … from 'money'   → recibe la v1 (scope)
//
// Decisiones:
// - Los módulos importan NOMBRES ('money', 'shop/cart.js'), y la página
//   decide en un solo sitio qué archivo (y qué versión) hay detrás de cada uno.
// - Actualizar una librería con cambios incompatibles no obliga a tocar todo
//   a la vez: el código antiguo sigue con su versión gracias a un scope.
// - Con un empaquetador y npm pasa lo mismo: dos versiones de un paquete en
//   node_modules, cada una para quien la pidió.
//
// Alcance: módulos 1-8.
import { formatPrice, VERSION } from 'money';
import { cartLine, MONEY as cartMoney } from 'shop/cart.js';
import { invoiceTotal, MONEY as invoiceMoney } from './08-mapa/legacy/invoice.js';

const short = (url) => url.slice(url.indexOf('08-mapa/') + '08-mapa/'.length);

console.group('▶ qué «money» recibe cada módulo');
console.log('este script →', short(import.meta.resolve('money')), `(${VERSION})`);
console.log('shop/cart.js →', short(cartMoney.url), `(${cartMoney.version})`);
console.log('legacy/invoice.js →', short(invoiceMoney.url), `(${invoiceMoney.version})`);
console.groupEnd();

console.group('▶ cada uno con su API');
console.log(cartLine('Café de Chiapas 500 g', 21000, 2));
console.log(cartLine('Molinillo manual', 54900, 1));
console.log('total →', formatPrice(117900), '| en dólares →', formatPrice(6450, { locale: 'en-US', currency: 'USD' }));
console.log('factura antigua →', invoiceTotal(1179)); // la v1 no separa los miles
console.groupEnd();

console.group('▶ prefijos y nombres que no están en el mapa');
console.log("'shop/cart.js' →", short(import.meta.resolve('shop/cart.js')));
try {
  import.meta.resolve('lodash-es');
} catch (error) {
  console.log('⛔ lodash-es →', error.name, '(no está en el mapa ni empieza por ./)');
}
console.groupEnd();

// Para usar un paquete de npm sin empaquetador bastaría con otra entrada:
//   "lodash-es": "https://esm.sh/lodash-es@4.17.21"
// (con la versión fijada, como en la lección «Import dinámico»).
```
